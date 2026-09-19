import { allocateTokens, requestReward } from "@/lib/actions";
import { studentContext } from "@/lib/queries";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export default async function StudentTokensPage() {
  const { wallet, classroom, rewards, redemptions, data } = await studentContext();

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-4xl font-black text-navy">Place your tokens</h1>
        <p className="font-medium text-navy/70">
          Savings buy rewards. Investing converts 1 token into ${classroom.tokenCashRate} of market cash.
          This cannot be undone.
        </p>
      </header>
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <p className="text-xs font-bold uppercase text-navy/50">Unspent</p>
          <p className="text-3xl font-black">{wallet.unspentTokens}</p>
        </Card>
        <Card>
          <p className="text-xs font-bold uppercase text-navy/50">Savings</p>
          <p className="text-3xl font-black">{wallet.savingsTokens}</p>
        </Card>
        <Card>
          <p className="text-xs font-bold uppercase text-navy/50">Investment cash</p>
          <p className="text-3xl font-black">${Math.round(wallet.investmentCash)}</p>
        </Card>
      </div>
      <Card>
        <form action={allocateTokens} className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label>To savings</Label>
            <Input name="savings" type="number" min={0} defaultValue={0} />
          </div>
          <div>
            <Label>To investments</Label>
            <Input name="invest" type="number" min={0} defaultValue={0} />
          </div>
          <Button type="submit" className="sm:col-span-2" tone="gold">
            Confirm placement
          </Button>
        </form>
      </Card>
      <h2 className="text-2xl font-black text-navy">Reward shop</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {rewards.map((reward) => (
          <Card key={reward.id}>
            <div className="text-4xl">{reward.emoji}</div>
            <h3 className="mt-2 text-xl font-black text-navy">{reward.title}</h3>
            <p className="text-sm font-medium text-navy/70">{reward.description}</p>
            <p className="mt-2 font-black text-gold">{reward.tokenCost} tokens</p>
            <form action={requestReward.bind(null, reward.id)} className="mt-3">
              <Button type="submit" disabled={wallet.savingsTokens < reward.tokenCost}>
                Request
              </Button>
            </form>
          </Card>
        ))}
      </div>
      <Card>
        <h2 className="text-xl font-black text-navy">Your requests</h2>
        <ul className="mt-3 space-y-2">
          {redemptions.map((r) => {
            const reward = data.rewards.find((rw) => rw.id === r.rewardId);
            return (
              <li key={r.id} className="flex justify-between rounded-2xl bg-white px-4 py-3">
                <span className="font-bold">{reward?.title}</span>
                <Badge>{r.status}</Badge>
              </li>
            );
          })}
        </ul>
      </Card>
    </div>
  );
}
