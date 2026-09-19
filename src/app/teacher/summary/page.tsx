import { teacherContext } from "@/lib/queries";
import { formatMoney } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function TeacherSummaryPage() {
  const { classroom, stats, pending, todayGrants, news } = await teacherContext();
  const target = classroom.baselineClassValue * (1 + classroom.goalReturnPct);
  const progress = classroom.baselineClassValue
    ? stats.classValue / target
    : 0;

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-sky">{classroom.name}</p>
        <h1 className="text-4xl font-black text-navy">Today in class</h1>
        <p className="mt-1 font-medium text-navy/70">
          Join code <Badge>{classroom.joinCode}</Badge> · Market day {classroom.marketDay}
        </p>
      </header>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card>
          <p className="text-xs font-bold uppercase text-navy/50">Tokens awarded</p>
          <p className="mt-2 text-3xl font-black text-navy">
            {todayGrants.reduce((s, t) => s + t.amount, 0)}
          </p>
        </Card>
        <Card>
          <p className="text-xs font-bold uppercase text-navy/50">Pending rewards</p>
          <p className="mt-2 text-3xl font-black text-coral">{pending.length}</p>
        </Card>
        <Card>
          <p className="text-xs font-bold uppercase text-navy/50">Class portfolio</p>
          <p className="mt-2 text-3xl font-black text-navy">{formatMoney(stats.classValue)}</p>
        </Card>
        <Card>
          <p className="text-xs font-bold uppercase text-navy/50">Goal (+{classroom.goalReturnPct * 100}%)</p>
          <p className="mt-2 text-3xl font-black text-leaf">{Math.round(Math.min(progress, 1) * 100)}%</p>
        </Card>
      </div>
      <Card>
        <h2 className="text-xl font-black text-navy">Investor board</h2>
        <div className="mt-4 space-y-2">
          {stats.students.map((row, i) => (
            <div key={row.student.id} className="flex items-center justify-between rounded-2xl bg-navy/5 px-4 py-3">
              <div>
                <span className="mr-3 font-black text-navy/40">#{i + 1}</span>
                <span className="font-bold text-navy">{row.student.displayName}</span>
              </div>
              <span className="font-black text-navy">{formatMoney(row.value)}</span>
            </div>
          ))}
        </div>
      </Card>
      <Card>
        <h2 className="text-xl font-black text-navy">Sector snapshot</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-5">
          {stats.prices &&
            Object.entries(stats.prices).map(([slug, price]) => (
              <div key={slug} className="rounded-2xl bg-white p-3 text-center">
                <p className="text-xs font-bold capitalize text-navy/60">{slug}</p>
                <p className="text-lg font-black text-navy">{formatMoney(price)}</p>
              </div>
            ))}
        </div>
      </Card>
      <Card>
        <h2 className="text-xl font-black text-navy">Today&apos;s news</h2>
        <ul className="mt-3 space-y-2">
          {news.map((item) => (
            <li key={item.id} className="rounded-2xl bg-white px-4 py-3">
              <p className="font-bold text-navy">{item.headline}</p>
              <p className="text-sm text-navy/70">{item.body}</p>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
