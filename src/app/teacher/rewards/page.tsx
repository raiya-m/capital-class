import { toggleReward, upsertReward } from "@/lib/actions";
import { teacherContext } from "@/lib/queries";
import { formatTokens } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input, Label, Textarea } from "@/components/ui/input";

export default async function TeacherRewardsPage() {
  const { rewards, data, classroom } = await teacherContext();
  const classRedemptions = data.redemptions.filter((r) => r.classroomId === classroom.id);
  const counts = new Map<string, number>();
  for (const row of classRedemptions) {
    counts.set(row.rewardId, (counts.get(row.rewardId) ?? 0) + 1);
  }
  const popular = [...rewards].sort((a, b) => (counts.get(b.id) ?? 0) - (counts.get(a.id) ?? 0))[0];
  const trades = data.trades.filter((t) => data.profiles.some((p) => p.id === t.studentId && p.classroomId === classroom.id));
  const perSession = classroom.marketDay ? (trades.length / classroom.marketDay).toFixed(1) : "0";

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <p className="eyebrow">Redemptions</p>
          <p className="mt-2 text-3xl font-semibold">{classRedemptions.length}</p>
        </Card>
        <Card>
          <p className="eyebrow">Trades per session</p>
          <p className="mt-2 text-3xl font-semibold text-mint">{perSession}</p>
        </Card>
        <Card>
          <p className="eyebrow">Most requested</p>
          <p className="mt-2 text-2xl font-semibold text-[#E2A100]">{popular?.title ?? "None yet"}</p>
        </Card>
      </div>
      <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-3">
          <h2 className="font-semibold text-navy">Store inventory</h2>
          {rewards.map((reward) => (
            <Card key={reward.id} className={reward.active ? "" : "opacity-50"}>
              <form action={upsertReward} className="space-y-3">
                <input type="hidden" name="id" value={reward.id} />
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-navy">{reward.title}</p>
                    <p className="text-sm text-muted">{formatTokens(reward.tokenCost)}</p>
                  </div>
                  <span className="text-base text-muted">{reward.active ? "In store" : "Hidden"}</span>
                </div>
                <Input name="title" defaultValue={reward.title} />
                <Textarea name="description" defaultValue={reward.description} />
                <Input name="tokenCost" type="number" defaultValue={reward.tokenCost} />
                <Button type="submit" tone="ghost">
                  Save
                </Button>
              </form>
              <form action={toggleReward.bind(null, reward.id)} className="mt-2">
                <Button type="submit" tone="ghost">
                  {reward.active ? "Hide from store" : "Show in store"}
                </Button>
              </form>
            </Card>
          ))}
        </div>
        <Card>
          <h2 className="font-semibold text-navy">Add a reward</h2>
          <form action={upsertReward} className="mt-4 space-y-3">
            <div>
              <Label>Name</Label>
              <Input name="title" required />
            </div>
            <div>
              <Label>Cost in tokens</Label>
              <Input name="tokenCost" type="number" min={1} defaultValue={5} />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea name="description" />
            </div>
            <Button className="w-full" type="submit">
              Add reward
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
