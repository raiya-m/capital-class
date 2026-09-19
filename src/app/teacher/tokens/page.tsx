import { grantTokens } from "@/lib/actions";
import { teacherContext } from "@/lib/queries";
import { formatMoney, formatTokens } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input, Label, Textarea } from "@/components/ui/input";
import { Avatar } from "@/components/ui/badge";

export default async function TeacherTokensPage() {
  const { stats, todayGrants, data, classroom } = await teacherContext();
  const names = Object.fromEntries(data.profiles.map((p) => [p.id, p.displayName]));

  return (
    <div className="grid gap-4 lg:grid-cols-[1.3fr_0.9fr]">
      <Card>
        <h2 className="text-xl font-semibold text-navy">Award tokens</h2>
        <p className="mt-1 text-base text-muted">
          Tokens start unspent. Students send them to savings or convert them to market dollars.
        </p>
        <form action={grantTokens} className="mt-4">
          <div className="overflow-hidden rounded-2xl border border-black/5">
            <div className="grid grid-cols-[auto_1fr_auto] gap-3 bg-[#F7FAF8] px-4 py-2 text-sm font-semibold text-muted">
              <span />
              <span>Student</span>
              <span>Portfolio</span>
            </div>
            {stats.students.map((row) => (
              <label
                key={row.student.id}
                className="grid grid-cols-[auto_1fr_auto] items-center gap-3 border-t border-black/5 px-4 py-3"
              >
                <input type="checkbox" name="studentIds" value={row.student.id} className="size-4 accent-[#3ecf8e]" />
                <span className="flex items-center gap-3">
                  <Avatar name={row.student.displayName} />
                  <span className="text-base font-semibold text-navy">{row.student.displayName}</span>
                </span>
                <span className="text-base font-medium">{formatMoney(row.value)}</span>
              </label>
            ))}
          </div>
          <div className="mt-6">
            <Label>Tokens to award</Label>
            <Input name="amount" type="number" min={1} defaultValue={2} />
          </div>
          <div className="mt-4">
            <Label>Reason</Label>
            <Textarea name="reason" required placeholder="Helped a classmate, finished the lab, strong group work" />
          </div>
          <Button className="mt-5 w-full" type="submit">
            Award tokens
          </Button>
        </form>
      </Card>
      <div className="space-y-4">
        <Card>
          <h2 className="font-semibold text-navy">Conversion</h2>
          <p className="mt-2 text-sm text-muted">
            1 token becomes {formatMoney(classroom.tokenCashRate)} when a student allocates it to the market.
          </p>
        </Card>
        <Card>
          <h2 className="font-semibold text-navy">Recent awards</h2>
          <ul className="mt-4 space-y-3">
            {todayGrants.length === 0 ? (
              <li className="text-sm text-muted">No awards yet.</li>
            ) : (
              todayGrants.map((g) => (
                <li key={g.id} className="flex justify-between text-sm">
                  <span className="font-medium">
                    {names[g.studentId]} · {g.reason}
                  </span>
                  <span className="font-semibold text-mint">+{formatTokens(g.amount)}</span>
                </li>
              ))
            )}
          </ul>
        </Card>
      </div>
    </div>
  );
}
