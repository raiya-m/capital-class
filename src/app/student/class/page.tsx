import { studentContext } from "@/lib/queries";
import { formatMoney } from "@/lib/utils";
import { Card } from "@/components/ui/card";

export default async function ClassPage() {
  const { classroom, stats, rank } = await studentContext();
  const target = classroom.baselineClassValue * (1 + classroom.goalReturnPct);
  const pct = target ? Math.min(100, Math.round((stats.classValue / target) * 100)) : 0;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-4xl font-black text-navy">{classroom.name} goal</h1>
        <p className="font-medium text-navy/70">
          Grow the class portfolio by {classroom.goalReturnPct * 100}% by {classroom.goalDeadline}.
        </p>
      </header>
      <Card>
        <p className="text-sm font-bold text-navy/60">Class portfolio vs goal</p>
        <p className="mt-2 text-3xl font-black text-navy">
          {formatMoney(stats.classValue)} / {formatMoney(target)}
        </p>
        <div className="mt-4 h-4 overflow-hidden rounded-full bg-navy/10">
          <div className="h-full rounded-full bg-leaf" style={{ width: `${pct}%` }} />
        </div>
        <p className="mt-2 font-bold text-leaf">{pct}% of the way there</p>
      </Card>
      <Card>
        <h2 className="text-xl font-black text-navy">You are #{rank}</h2>
        <div className="mt-4 space-y-2">
          {stats.students.map((row, i) => (
            <div key={row.student.id} className="flex justify-between rounded-2xl bg-navy/5 px-4 py-3">
              <span className="font-bold text-navy">
                #{i + 1} {row.student.displayName}
              </span>
              <span className="font-black">{formatMoney(row.value)}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
