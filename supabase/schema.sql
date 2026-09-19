-- Capital Class schema for Supabase (Auth + Postgres).
-- Apply in the SQL editor, then map auth.users -> public.profiles on signup.
-- The running hackathon demo also uses a file-backed store with the same shapes.

create extension if not exists "pgcrypto";

create type public.user_role as enum ('teacher', 'student');
create type public.redemption_status as enum ('pending', 'approved', 'denied');
create type public.trade_side as enum ('buy', 'sell');
create type public.powerup_kind as enum ('double_gain', 'half_loss');

create table public.classrooms (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null,
  name text not null,
  join_code text not null unique,
  token_cash_rate numeric not null default 100,
  goal_return_pct numeric not null default 1.2,
  goal_deadline date,
  market_day int not null default 1,
  baseline_class_value numeric not null default 0,
  pending_tick jsonb
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  classroom_id uuid references public.classrooms(id),
  role public.user_role not null,
  display_name text not null,
  email text not null unique
);

alter table public.classrooms
  add constraint classrooms_teacher_fk
  foreign key (teacher_id) references public.profiles(id);

create table public.wallets (
  profile_id uuid primary key references public.profiles(id) on delete cascade,
  unspent_tokens int not null default 0,
  savings_tokens int not null default 0,
  investment_cash numeric not null default 0,
  last_seen_market_day int not null default 0,
  last_tick_summary jsonb
);

create table public.token_ledger (
  id uuid primary key default gen_random_uuid(),
  classroom_id uuid not null references public.classrooms(id) on delete cascade,
  student_id uuid not null references public.profiles(id) on delete cascade,
  teacher_id uuid not null references public.profiles(id),
  amount int not null,
  reason text not null,
  created_at timestamptz not null default now()
);

create table public.sectors (
  slug text primary key,
  name text not null,
  emoji text not null,
  color text not null,
  price numeric not null
);

create table public.prices (
  id uuid primary key default gen_random_uuid(),
  sector_slug text not null references public.sectors(slug),
  day int not null,
  price numeric not null,
  unique (sector_slug, day)
);

create table public.news (
  id uuid primary key default gen_random_uuid(),
  classroom_id uuid not null references public.classrooms(id) on delete cascade,
  day int not null,
  headline text not null,
  body text not null,
  impacts jsonb not null
);

create table public.daily_questions (
  id uuid primary key default gen_random_uuid(),
  classroom_id uuid not null references public.classrooms(id) on delete cascade,
  day int not null,
  prompt text not null,
  options jsonb not null,
  correct_sector text not null,
  reward_cash numeric not null default 50,
  unique (classroom_id, day)
);

create table public.answers (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references public.daily_questions(id) on delete cascade,
  student_id uuid not null references public.profiles(id) on delete cascade,
  sector text not null,
  correct boolean not null,
  created_at timestamptz not null default now(),
  unique (question_id, student_id)
);

create table public.holdings (
  student_id uuid not null references public.profiles(id) on delete cascade,
  sector_slug text not null references public.sectors(slug),
  shares numeric not null default 0,
  primary key (student_id, sector_slug)
);

create table public.trades (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  sector_slug text not null references public.sectors(slug),
  side public.trade_side not null,
  shares numeric not null,
  price numeric not null,
  created_at timestamptz not null default now()
);

create table public.rewards (
  id uuid primary key default gen_random_uuid(),
  classroom_id uuid not null references public.classrooms(id) on delete cascade,
  title text not null,
  description text not null,
  token_cost int not null,
  emoji text not null,
  active boolean not null default true
);

create table public.redemptions (
  id uuid primary key default gen_random_uuid(),
  classroom_id uuid not null references public.classrooms(id) on delete cascade,
  student_id uuid not null references public.profiles(id) on delete cascade,
  reward_id uuid not null references public.rewards(id),
  status public.redemption_status not null default 'pending',
  created_at timestamptz not null default now()
);

create table public.powerup_catalog (
  id text primary key,
  name text not null,
  description text not null,
  emoji text not null,
  kind public.powerup_kind not null,
  cost_cash numeric not null
);

create table public.student_powerups (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  powerup_id text not null references public.powerup_catalog(id),
  charges int not null default 1
);

alter table public.classrooms enable row level security;
alter table public.profiles enable row level security;
alter table public.wallets enable row level security;
alter table public.token_ledger enable row level security;
alter table public.sectors enable row level security;
alter table public.prices enable row level security;
alter table public.news enable row level security;
alter table public.daily_questions enable row level security;
alter table public.answers enable row level security;
alter table public.holdings enable row level security;
alter table public.trades enable row level security;
alter table public.rewards enable row level security;
alter table public.redemptions enable row level security;
alter table public.powerup_catalog enable row level security;
alter table public.student_powerups enable row level security;

create policy "profiles self" on public.profiles
  for select using (auth.uid() = id or classroom_id in (
    select classroom_id from public.profiles where id = auth.uid()
  ));

create policy "classroom members" on public.classrooms
  for select using (
    id in (select classroom_id from public.profiles where id = auth.uid())
  );

create policy "own wallet" on public.wallets
  for select using (
    profile_id = auth.uid()
    or profile_id in (
      select id from public.profiles
      where classroom_id in (select classroom_id from public.profiles where id = auth.uid() and role = 'teacher')
    )
  );

create policy "public market data" on public.sectors for select using (true);
create policy "public prices" on public.prices for select using (true);
create policy "class news" on public.news for select using (
  classroom_id in (select classroom_id from public.profiles where id = auth.uid())
);
create policy "class questions" on public.daily_questions for select using (
  classroom_id in (select classroom_id from public.profiles where id = auth.uid())
);
create policy "own answers" on public.answers
  for select using (student_id = auth.uid() or exists (
    select 1 from public.profiles p where p.id = auth.uid() and p.role = 'teacher'
  ));
create policy "class holdings" on public.holdings for select using (
  student_id in (select id from public.profiles where classroom_id in (
    select classroom_id from public.profiles where id = auth.uid()
  ))
);
create policy "own trades" on public.trades for select using (student_id = auth.uid());
create policy "class rewards" on public.rewards for select using (
  classroom_id in (select classroom_id from public.profiles where id = auth.uid())
);
create policy "class redemptions" on public.redemptions for select using (
  classroom_id in (select classroom_id from public.profiles where id = auth.uid())
);
create policy "powerups catalog" on public.powerup_catalog for select using (true);
create policy "own powerups" on public.student_powerups for select using (student_id = auth.uid());
create policy "class ledger" on public.token_ledger for select using (
  classroom_id in (select classroom_id from public.profiles where id = auth.uid())
);

insert into public.sectors (slug, name, emoji, color, price) values
  ('technology', 'Technology', '💻', '#3B9AE1', 100),
  ('agriculture', 'Agriculture', '🌾', '#3D9A6A', 100),
  ('transportation', 'Transportation', '🚚', '#E8B923', 100),
  ('energy', 'Energy', '⚡', '#E85D4C', 100),
  ('healthcare', 'Healthcare', '🩺', '#8B5CF6', 100)
on conflict (slug) do nothing;

insert into public.powerup_catalog (id, name, description, emoji, kind, cost_cash) values
  ('pu-double', 'Lucky Lightning', 'Double your profits on the next market day.', '⚡', 'double_gain', 150),
  ('pu-shield', 'Safety Net', 'If you lose money next market day, keep half of the loss.', '🛡️', 'half_loss', 120)
on conflict (id) do nothing;
