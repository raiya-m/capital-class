# Capital Class

HackMIT classroom economy: teachers award tokens for good choices. Students save for rewards, or invest in a five-sector practice market driven by kid-safe news.

## Demo logins

| Role | Email | Password |
| --- | --- | --- |
| Teacher | teacher@capitalclass.local | teacher |
| Student | mia@capitalclass.local | student |

Other seeded students: `jordan`, `sam`, `priya`, `leo`, `ava` @ `capitalclass.local` (password `student`). Join code **CLASS4B**.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The first run writes a seeded classroom to `.data/store.json`.

Copy `.env.example` to `.env.local` if you want OpenAI-generated news (`OPENAI_API_KEY`). Without a key, market days use rotating classroom-safe stories.

## Supabase

The live demo uses a file-backed store so the hackathon app runs without cloud credentials. The same tables, RLS, and sector seed live in [`supabase/schema.sql`](supabase/schema.sql). To move production data to Supabase:

1. Create a project and paste `supabase/schema.sql` into the SQL editor.
2. Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
3. Client helpers are in `src/lib/supabase/`.

## Stack

Next.js App Router, Tailwind, cookie sessions, optional OpenAI news, Recharts for sector trends.
