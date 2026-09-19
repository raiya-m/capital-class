import Link from "next/link";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col justify-center px-6 py-16">
      <p className="text-sm font-bold uppercase tracking-[0.25em] text-sky">HackMIT classroom economy</p>
      <h1 className="mt-4 max-w-3xl text-6xl font-black leading-[0.95] text-navy">
        Tokens for good choices. Markets for curious minds.
      </h1>
      <p className="mt-6 max-w-2xl text-lg font-medium text-navy/70">
        Teachers award tokens. Students save for stickers, request rewards, or invest in
        Technology, Farms, Transit, Energy, and Health — powered by classroom-safe news.
      </p>
      <div className="mt-10 flex flex-wrap gap-4">
        <Link
          href="/login"
          className="rounded-2xl bg-navy px-6 py-3 text-sm font-bold text-white shadow-[0_4px_0_#12263f]"
        >
          Sign in
        </Link>
        <Link
          href="/signup"
          className="rounded-2xl bg-gold px-6 py-3 text-sm font-bold text-navy shadow-[0_4px_0_#b8860b]"
        >
          Create a class
        </Link>
      </div>
      <div className="mt-14 grid gap-4 sm:grid-cols-3">
        {[
          ["⭐", "Earn tokens", "Teachers spot kindness, teamwork, and focus."],
          ["📰", "Read the news", "A daily kid-safe bulletin moves five big sectors."],
          ["📈", "Invest together", "Chase a class goal like +120% by month end."],
        ].map(([emoji, title, body]) => (
          <div key={title} className="rounded-[28px] border-2 border-navy/10 bg-card p-5">
            <div className="text-3xl">{emoji}</div>
            <h2 className="mt-3 text-xl font-black text-navy">{title}</h2>
            <p className="mt-2 text-sm font-medium text-navy/70">{body}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
