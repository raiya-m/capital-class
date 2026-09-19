import { grantTokens } from "@/lib/actions";
import { teacherContext } from "@/lib/queries";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input, Label, Textarea } from "@/components/ui/input";

export default async function TeacherTokensPage() {
  const { stats, todayGrants, data } = await teacherContext();
  const names = Object.fromEntries(data.profiles.map((p) => [p.id, p.displayName]));

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-4xl font-black text-navy">Award tokens</h1>
        <p className="font-medium text-navy/70">Catch students being excellent.</p>
      </header>
      <Card>
        <form action={grantTokens} className="space-y-4">
          <Label>Students</Label>
          <div className="grid gap-2 sm:grid-cols-2">
            {stats.students.map((row) => (
              <label key={row.student.id} className="flex items-center gap-2 rounded-2xl bg-navy/5 px-3 py-2 font-bold">
                <input type="checkbox" name="studentIds" value={row.student.id} className="size-4" />
                {row.student.displayName}
              </label>
            ))}
          </div>
          <div>
            <Label>Amount</Label>
            <Input name="amount" type="number" min={1} defaultValue={1} />
          </div>
          <div>
            <Label>Reason</Label>
            <Textarea name="reason" required placeholder="Held the door and helped clean up" />
          </div>
          <Button type="submit" tone="gold">
            Give tokens
          </Button>
        </form>
      </Card>
      <Card>
        <h2 className="text-xl font-black text-navy">Recent awards</h2>
        <ul className="mt-4 space-y-2">
          {todayGrants.map((g) => (
            <li key={g.id} className="flex justify-between rounded-2xl bg-white px-4 py-3">
              <span className="font-bold text-navy">
                {names[g.studentId]} · {g.reason}
              </span>
              <span className="font-black text-gold">+{g.amount}</span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
