import { resolveRedemption } from "@/lib/actions";
import { teacherContext } from "@/lib/queries";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function TeacherRequestsPage() {
  const { data, classroom } = await teacherContext();
  const rows = data.redemptions
    .filter((r) => r.classroomId === classroom.id)
    .map((r) => ({
      ...r,
      student: data.profiles.find((p) => p.id === r.studentId)?.displayName,
      reward: data.rewards.find((rw) => rw.id === r.rewardId),
    }));

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-4xl font-black text-navy">Reward requests</h1>
        <p className="font-medium text-navy/70">Approve sticker packs and classroom perks.</p>
      </header>
      <div className="space-y-3">
        {rows.length === 0 ? <Card>No requests yet.</Card> : null}
        {rows.map((row) => (
          <Card key={row.id} className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-lg font-black text-navy">
                {row.reward?.emoji} {row.reward?.title}
              </p>
              <p className="text-sm font-medium text-navy/70">
                {row.student} · {row.reward?.tokenCost} tokens
              </p>
            </div>
            {row.status === "pending" ? (
              <div className="flex gap-2">
                <form action={resolveRedemption.bind(null, row.id, "approved")}>
                  <Button type="submit" tone="leaf">
                    Approve
                  </Button>
                </form>
                <form action={resolveRedemption.bind(null, row.id, "denied")}>
                  <Button type="submit" tone="danger">
                    Deny
                  </Button>
                </form>
              </div>
            ) : (
              <Badge className={row.status === "approved" ? "bg-leaf/20 text-leaf" : "bg-coral/20 text-coral"}>
                {row.status}
              </Badge>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
