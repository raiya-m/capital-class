import { studentContext } from "@/lib/queries";
import { formatMoneyExact } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { ackEndOfDay } from "@/lib/actions";
import { Button } from "@/components/ui/button";

export default async function EodPage() {
  const { wallet, rank, stats, classroom } = await studentContext();
  const summary = wallet.lastTickSummary;

  return (
    <div className="max-w-xl">
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
        <form action={ackEndOfDay} className="mt-6">
          <Button type="submit">Mark as reviewed</Button>
        </form>
      </Card>
    </div>
  );
}
