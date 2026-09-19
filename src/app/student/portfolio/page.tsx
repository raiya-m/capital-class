import { studentContext } from "@/lib/queries";
import { formatMoney, formatMoneyExact, formatTokens } from "@/lib/utils";
import { buildTrendData, trendMovers } from "@/lib/trends";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MoverPills, TrendChart } from "@/components/trend-chart";
import { HowItWorks } from "@/components/how-it-works";
import Link from "next/link";

export default async function PortfolioPage() {
  const { profile, wallet, invested, rank, stats, classroom, holdings, prices, data } = await studentContext();
  const total = wallet.investmentCash + invested;
  const target = classroom.baselineClassValue * (1 + classroom.goalReturnPct);
  const pct = target ? Math.min(100, Math.round((stats.classValue / target) * 100)) : 0;
  const sectors = holdings.map((h) => data.sectors.find((s) => s.slug === h.sectorSlug)?.name).filter(Boolean);
  const trend = buildTrendData(data.prices, data.sectors);
  const movers = trendMovers(trend, data.sectors);
  const series = [
    { key: "INDEX", color: "#1b2330", width: 3, label: "Index" },
    ...data.sectors.map((s) => ({ key: s.ticker, color: s.color, label: s.name })),
  ];

  return (
    <div className="space-y-4">
      <HowItWorks role="student" />
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-[#FFF8EE]">
          <p className="eyebrow">Unspent tokens</p>
          <p className="mt-3 text-3xl font-semibold text-mint">{formatTokens(wallet.unspentTokens)}</p>
          <p className="mt-1 text-base text-muted">
            Allocate these on{" "}
            <Link href="/student/tokens" className="font-semibold text-navy underline">
              Token Wallet
            </Link>
          </p>
        </Card>
        <Card className="bg-[#EEF3FF]">
          <p className="eyebrow">Savings tokens</p>
          <p className="mt-3 text-3xl font-semibold text-sky">{formatTokens(wallet.savingsTokens)}</p>
          <p className="mt-1 text-base text-muted">Spend these on classroom rewards</p>
        </Card>
        <Card className="bg-[#F1FBF6]">
          <p className="eyebrow">Market value</p>
          <p className="mt-3 text-3xl font-semibold text-mint">{formatMoney(total)}</p>
          <p className="mt-1 text-base text-muted">
            Cash {formatMoneyExact(wallet.investmentCash)}
            {sectors.length ? ` · ${sectors.join(", ")}` : " · no shares yet"}
          </p>
        </Card>
      </div>
      <div className="grid gap-4 lg:grid-cols-[1.4fr_0.9fr]">
        <Card>
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-semibold text-navy">Class field trip fund</h2>
              <p className="mt-1 text-base text-muted">Everyone&apos;s invested dollars toward the class target.</p>
            </div>
            <Badge>Session {classroom.marketDay}</Badge>
          </div>
          <div className="mt-5 flex justify-between text-sm">
            <span className="font-semibold text-mint">{formatMoney(stats.classValue)} raised</span>
            <span className="text-muted">Target: {formatMoney(target)}</span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#E8EEEA]">
            <div className="h-full rounded-full bg-mint" style={{ width: `${pct}%` }} />
          </div>
        </Card>
        <Card className="bg-[#F1FBF6]">
          <h2 className="text-xl font-semibold text-navy">Class rank</h2>
          <ol className="mt-4 space-y-3">
            {stats.students.slice(0, 3).map((row, i) => (
              <li key={row.student.id} className="flex justify-between text-base">
                <span>
                  <span className="mr-2 font-semibold text-mint">#{i + 1}</span>
                  {row.student.displayName}
                  {row.student.id === profile.id ? " (you)" : ""}
                </span>
                <span className="font-semibold">{formatMoney(row.value)}</span>
              </li>
            ))}
          </ol>
          <p className="mt-4 text-base text-muted">
            You are #{rank} of {stats.students.length}
          </p>
        </Card>
      </div>
      <div className="grid gap-4 lg:grid-cols-[1.4fr_0.9fr]">
        <Card>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold text-navy">Market trend</h2>
              <p className="text-base text-muted">Your book marks to these prices</p>
            </div>
            <MoverPills movers={movers.slice(0, 3)} />
          </div>
          <TrendChart data={trend} series={series} height={240} />
        </Card>
        <Card className="bg-[#FFF8EE]">
          <h2 className="text-xl font-semibold text-navy">Your holdings</h2>
          <ul className="mt-4 space-y-3 text-base">
            <li>
              <p className="font-medium">Cash {formatMoneyExact(wallet.investmentCash)}</p>
              <p className="text-base text-muted">Use this on Market and News to buy shares</p>
            </li>
            {holdings.length === 0 ? (
              <li className="text-muted">No shares yet. Buy a sector after you allocate tokens.</li>
            ) : (
              holdings.map((h) => (
                <li key={h.sectorSlug}>
                  <p className="font-medium">
                    {data.sectors.find((s) => s.slug === h.sectorSlug)?.name ?? h.sectorSlug} · {h.shares.toFixed(1)} shares
                  </p>
                  <p className="text-base text-muted">{formatMoney(h.shares * (prices[h.sectorSlug] ?? 0))}</p>
                </li>
              ))
            )}
          </ul>
        </Card>
      </div>
    </div>
  );
}
