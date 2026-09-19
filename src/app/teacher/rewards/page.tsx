import { toggleReward, upsertReward } from "@/lib/actions";
import { teacherContext } from "@/lib/queries";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input, Label, Textarea } from "@/components/ui/input";

export default async function TeacherRewardsPage() {
  const { rewards } = await teacherContext();

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-4xl font-black text-navy">Reward cards</h1>
        <p className="font-medium text-navy/70">Personal prizes students buy with savings tokens.</p>
      </header>
      <div className="grid gap-4 sm:grid-cols-2">
        {rewards.map((reward) => (
          <Card key={reward.id} className={reward.active ? "" : "opacity-60"}>
            <form action={upsertReward} className="space-y-3">
              <input type="hidden" name="id" value={reward.id} />
              <div className="text-4xl">{reward.emoji}</div>
              <Input name="emoji" defaultValue={reward.emoji} />
              <Input name="title" defaultValue={reward.title} />
              <Textarea name="description" defaultValue={reward.description} />
              <Input name="tokenCost" type="number" defaultValue={reward.tokenCost} />
              <div className="flex gap-2">
                <Button type="submit">Save</Button>
              </div>
            </form>
            <form action={toggleReward.bind(null, reward.id)} className="mt-3">
              <Button type="submit" tone="ghost">
                {reward.active ? "Remove from shop" : "Put back in shop"}
              </Button>
            </form>
          </Card>
        ))}
        <Card>
          <h2 className="font-black text-navy">Add a reward</h2>
          <form action={upsertReward} className="mt-3 space-y-3">
            <div>
              <Label>Emoji</Label>
              <Input name="emoji" defaultValue="🎁" />
            </div>
            <div>
              <Label>Title</Label>
              <Input name="title" required />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea name="description" />
            </div>
            <div>
              <Label>Token cost</Label>
              <Input name="tokenCost" type="number" min={1} defaultValue={5} />
            </div>
            <Button type="submit" tone="gold">
              Add card
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
