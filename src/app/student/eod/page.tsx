import { studentContext } from "@/lib/queries";
import { formatMoneyExact, formatPct } from "@/lib/utils";
import { dayMove } from "@/lib/trends";
import { Card } from "@/components/ui/card";
import { ackEndOfDay } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function EodPage() {
  const { wallet, rank, stats, classroom, holdings, prices, history, data, invested } = await studentContext();
  const summary = wallet.lastTickSummary;

  const rows = holdings.map((h) => {
    const sector = data.sectors.find((s) => s.slug === h.sectorSlug);
    const { open, close } = summary
      ? dayMove(history, h.sectorSlug, summary.day)
      : { open: prices[h.sectorSlug] ?? 0, close: prices[h.sectorSlug] ?? 0 };
    const move = close - open;
    return {
      slug: h.sectorSlug,
      name: sector?.name ?? h.sectorSlug,
      ticker: sector?.ticker ?? h.sectorSlug,
      shares: h.shares,
      open,
      close,
      pct: open ? move / open : 0,
      value: h.shares * (prices[h.sectorSlug] ?? close),
      delta: h.shares * move,
    };
  });
  rows.sort((a, b) => b.delta - a.delta);

  const sectorsTotal = rows.reduce((sum, r) => sum + r.delta, 0);
  const residual = summary ? summary.portfolioDelta - sectorsTotal : 0;
  const powerupBonus = summary && summary.powerupNotes.length > 0 && Math.abs(residual) > 0.005 ? residual : 0;
  const unexplained = Math.abs(residual - powerupBonus) > 0.005;
  const up = rows.filter((r) => r.delta > 0).length;
  const down = rows.filter((r) => r.delta < 0).length;

  const askCoach = summary
    ? `My recap for market day ${summary.day} says ${summary.portfolioDelta >= 0 ? "up" : "down"} ${formatMoneyExact(Math.abs(summary.portfolioDelta))}. Which sector moved me the most, and what should I watch next?`
    : "Can you walk me through the shares I own right now?";

  return (
    <div className="max-w-3xl space-y-4">
      <Card>
        <p className="eyebrow text-mint">Market day {classroom.marketDay}</p>
        <h2 className="mt-2 text-2xl font-semibold text-navy">End of day recap</h2>
        {summary ? (
          <>
            <p className={`mt-6 text-3xl font-semibold ${summary.portfolioDelta >= 0 ? "text-mint" : "text-coral"}`}>
              {summary.portfolioDelta >= 0 ? "+" : ""}
              {formatMoneyExact(summary.portfolioDelta)}
            </p>
            <p className="mt-2 text-sm text-muted">
              Rank #{summary.rank} of {summary.classmateCount}
            </p>
            {summary.powerupNotes.map((note) => (
              <p key={note} className="mt-3 rounded-2xl bg-[#F3FBF7] px-3 py-2 text-sm">
                {note}
              </p>
            ))}
          </>
        ) : (
          <p className="mt-6 text-sm text-muted">
            You are #{rank} of {stats.students.length}. A recap appears after the teacher publishes a new market day.
          </p>
        )}
      </Card>

      <Card>
        <h3 className="font-semibold text-navy">
          {summary ? "Where that came from" : "What you are holding"}
        </h3>
        <p className="mt-1 text-base text-muted">
          {summary
            ? "Every sector you own, and what it added or took away on market day " + summary.day + "."
            : "Prices have not closed a new day yet, so there is nothing to add up."}
        </p>

        {rows.length === 0 ? (
          <p className="mt-6 rounded-2xl bg-[#F7F9F8] px-4 py-3 text-base text-muted">
            You owned no shares, so prices could not move your money. Your {formatMoneyExact(wallet.investmentCash)} of
            market cash stayed exactly the same.
          </p>
        ) : (
          <>
            <ul className="mt-5 space-y-2">
              {rows.map((r) => (
                <li key={r.slug} className="rounded-2xl bg-[#F7F9F8] px-4 py-3">
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="font-semibold text-navy">
                      {r.name} <span className="text-muted">({r.ticker})</span>
                    </span>
                    {summary ? (
                      <span className={`font-semibold ${r.delta >= 0 ? "text-mint" : "text-coral"}`}>
                        {r.delta >= 0 ? "+" : ""}
                        {formatMoneyExact(r.delta)}
                      </span>
                    ) : (
                      <span className="font-semibold text-navy">{formatMoneyExact(r.value)}</span>
                    )}
                  </div>
                  <div className="mt-1 flex items-baseline justify-between gap-3 text-base text-muted">
                    <span>{r.shares.toFixed(1)} shares, now worth {formatMoneyExact(r.value)}</span>
                    {summary ? (
                      <span>
                        {formatMoneyExact(r.open)} to {formatMoneyExact(r.close)} ({formatPct(r.pct)})
                      </span>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>

            {summary ? (
              <>
                {powerupBonus ? (
                  <div className="mt-2 flex items-baseline justify-between rounded-2xl bg-[#F3FBF7] px-4 py-3">
                    <span className="font-semibold text-navy">Power-up bonus</span>
                    <span className="font-semibold text-mint">+{formatMoneyExact(powerupBonus)}</span>
                  </div>
                ) : null}
                <div className="mt-4 flex items-baseline justify-between border-t border-[#E8EEEA] pt-4">
                  <span className="font-semibold text-navy">Total for the day</span>
                  <span
                    className={`text-lg font-semibold ${summary.portfolioDelta >= 0 ? "text-mint" : "text-coral"}`}
                  >
                    {summary.portfolioDelta >= 0 ? "+" : ""}
                    {formatMoneyExact(summary.portfolioDelta)}
                  </span>
                </div>
                <p className="mt-3 text-base text-muted">
                  {up} sector{up === 1 ? "" : "s"} up, {down} down.
                  {unexplained
                    ? " Your shares changed after the bell, so the sectors above may not add up to the total."
                    : ""}
                </p>
              </>
            ) : null}

            <div className="mt-4 flex items-baseline justify-between text-base text-muted">
              <span>Shares held right now</span>
              <span>{formatMoneyExact(invested)}</span>
            </div>
            <div className="mt-1 flex items-baseline justify-between text-base text-muted">
              <span>Market cash (prices do not move this)</span>
              <span>{formatMoneyExact(wallet.investmentCash)}</span>
            </div>
          </>
        )}
      </Card>

      <Card>
        <h3 className="font-semibold text-navy">Not sure why a sector moved?</h3>
        <p className="mt-1 text-base text-muted">
          Take this recap to your coach and ask. It already knows today&apos;s news and the shares you own.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link href={`/student/coach?ask=${encodeURIComponent(askCoach)}`}>
            <Button type="button">Ask the coach about today</Button>
          </Link>
          <Link href="/student/coach">
            <Button type="button" tone="ghost">
              Open coach
            </Button>
          </Link>
        </div>
      </Card>

      <form action={ackEndOfDay}>
        <Button type="submit" tone="ghost">
          Mark as reviewed
        </Button>
      </form>
    </div>
  );
}
