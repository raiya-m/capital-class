import { teacherContext } from "@/lib/queries";
import { formatMoney, formatPct } from "@/lib/utils";
import { buildTrendData, trendMovers } from "@/lib/trends";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { HowItWorks } from "@/components/how-it-works";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MoverPills, TrendChart } from "@/components/trend-chart";

export default async function TeacherSummaryPage() {
  const { classroom, stats, pending, todayGrants, data } = await teacherContext();
  const target = classroom.baselineClassValue * (1 + classroom.goalReturnPct);
  const raised = stats.classValue;
  const progress = target ? Math.min(100, Math.round((raised / target) * 100)) : 0;
  const names = Object.fromEntries(data.profiles.map((p) => [p.id, p.displayName]));
  const investedStudents = stats.students.filter((s) => s.value > 0).length;
  const participation = stats.students.length
    ? Math.round((investedStudents / stats.students.length) * 100)
    : 0;
  const vsBaseline = classroom.baselineClassValue
    ? (stats.classValue - classroom.baselineClassValue) / classroom.baselineClassValue
    : 0;
  const trend = buildTrendData(data.prices, data.sectors);
  const movers = trendMovers(trend, data.sectors);
  const series = [
    { key: "INDEX", color: "#1b2330", width: 3, label: "Index" },
    ...data.sectors.map((s) => ({ key: s.ticker, color: s.color, label: s.name })),
  ];

  return (
    <div className="space-y-4">
      <HowItWorks role="teacher" />
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <p className="eyebrow">Class portfolio</p>
          <p className="mt-3 text-3xl font-semibold text-mint">{formatMoney(stats.classValue)}</p>
          <p className={`mt-1 text-base font-semibold ${vsBaseline >= 0 ? "text-mint" : "text-coral"}`}>
            {formatPct(vsBaseline)} vs starting book
          </p>
          <p className="mt-2 text-base text-muted">
            Average {formatMoney(stats.classValue / Math.max(stats.students.length, 1))} per student
          </p>
        </Card>
        <Card>
          <p className="eyebrow">Invested students</p>
          <p className="mt-3 text-3xl font-semibold text-navy">{participation}%</p>
          <p className="mt-2 text-base text-muted">
            {investedStudents}/{stats.students.length} have cash or shares in the market
          </p>
        </Card>
        <Card>
          <p className="eyebrow">Pending rewards</p>
          <p className="mt-3 text-3xl font-semibold text-[#E2A100]">{pending.length}</p>
          <p className="mt-2 text-base text-muted">
            {pending.length ? "Approve or deny on Reward Requests." : "No open redemptions."}
          </p>
        </Card>
      </div>
      <div className="grid gap-4 lg:grid-cols-[1.4fr_0.9fr]">
        <Card>
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold text-navy">Class field trip fund</h2>
              <p className="mt-1 text-base text-muted">Invested classroom dollars toward the trip target.</p>
            </div>
            <Badge>Session {classroom.marketDay}</Badge>
          </div>
          <div className="mt-5 flex items-end justify-between text-sm">
            <span className="font-semibold text-mint">{formatMoney(raised)} raised</span>
            <span className="text-muted">Target: {formatMoney(target)}</span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#E8EEEA]">
            <div className="h-full rounded-full bg-mint" style={{ width: `${progress}%` }} />
          </div>
        </Card>
        <Card className="bg-navy text-white">
          <h2 className="text-xl font-semibold">Next actions</h2>
          <p className="mt-2 text-base text-white/70">Award tokens, then publish a news incident so the tape can move.</p>
          <Link href="/teacher/tokens" className="mt-4 block">
            <Button className="w-full" type="button">
              Award tokens
            </Button>
          </Link>
          <Link href="/teacher/market" className="mt-3 block">
            <Button className="w-full bg-white/10 text-white hover:bg-white/15" tone="ghost" type="button">
              Publish a news incident
            </Button>
          </Link>
        </Card>
      </div>
      <div className="grid gap-4 lg:grid-cols-[1.4fr_0.9fr]">
        <Card>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold text-navy">CapitalClass Index</h2>
              <p className="mt-1 text-base text-muted">Use the dropdown to isolate a sector trend.</p>
            </div>
            <MoverPills movers={movers} />
          </div>
          <div className="mt-4">
            <TrendChart data={trend} series={series} />
          </div>
        </Card>
        <Card>
          <h2 className="text-xl font-semibold text-navy">Class feed</h2>
          <ul className="mt-4 space-y-3">
            {todayGrants.slice(0, 5).map((g) => (
              <li key={g.id} className="flex items-start justify-between gap-3 text-sm">
                <div>
                  <p className="font-medium text-navy">
                    {names[g.studentId]} earned {g.amount} {g.amount === 1 ? "token" : "tokens"}
                  </p>
                  <p className="text-base text-muted">{g.reason}</p>
                </div>
              </li>
            ))}
            {pending.slice(0, 2).map((p) => (
              <li key={p.id} className="text-sm">
                <p className="font-medium text-navy">{names[p.studentId]} requested a reward</p>
                <p className="text-base text-muted">Waiting on Reward Requests</p>
              </li>
            ))}
            {!todayGrants.length && !pending.length ? (
              <li className="text-base text-muted">No awards or requests yet this session.</li>
            ) : null}
          </ul>
        </Card>
      </div>
    </div>
  );
}
