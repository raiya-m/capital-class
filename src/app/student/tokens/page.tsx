import { allocateTokens, convertCashToSavings, requestReward } from "@/lib/actions";
import { studentContext } from "@/lib/queries";
import { formatMoney, formatTokens } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input, Label, Select } from "@/components/ui/input";

export default async function StudentTokensPage() {
  const { wallet, classroom, rewards, redemptions, data } = await studentContext();
  const tokenTotal = Math.max(wallet.unspentTokens + wallet.savingsTokens, 1);
  const spendPct = Math.round((wallet.unspentTokens / tokenTotal) * 100);
  const savePct = Math.round((wallet.savingsTokens / tokenTotal) * 100);
  const wealth = wallet.investmentCash + wallet.unspentTokens * classroom.tokenCashRate + wallet.savingsTokens * classroom.tokenCashRate;
  const investPct = wealth ? Math.round((wallet.investmentCash / wealth) * 100) : 0;
  const convertibleTokens = Math.floor(wallet.investmentCash / classroom.tokenCashRate);

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <h2 className="font-semibold text-navy">Split your tokens</h2>
        <p className="mt-1 text-base text-muted">
          Teacher awards land in unspent tokens. Move them to savings (rewards) or the market (1 token ={" "}
          {formatMoney(classroom.tokenCashRate)}).
        </p>
        <div className="mt-6 space-y-4">
          <div>
            <div className="mb-1 flex justify-between text-base">
              <span>Unspent tokens</span>
              <span className="font-semibold">{formatTokens(wallet.unspentTokens)}</span>
            </div>
            <div className="h-2 rounded-full bg-[#E8EEEA]">
              <div className="h-full rounded-full bg-mint" style={{ width: `${spendPct}%` }} />
            </div>
          </div>
          <div>
            <div className="mb-1 flex justify-between text-base">
              <span>Savings (for rewards)</span>
              <span className="font-semibold">{formatTokens(wallet.savingsTokens)}</span>
            </div>
            <div className="h-2 rounded-full bg-[#E8EEEA]">
              <div className="h-full rounded-full bg-sky" style={{ width: `${savePct}%` }} />
            </div>
          </div>
          <div>
            <div className="mb-1 flex justify-between text-base">
              <span>Investment cash</span>
              <span className="font-semibold">{formatMoney(wallet.investmentCash)}</span>
            </div>
            <div className="h-2 rounded-full bg-[#E8EEEA]">
              <div className="h-full rounded-full bg-navy" style={{ width: `${investPct}%` }} />
            </div>
          </div>
        </div>
        <form action={allocateTokens} className="mt-6 space-y-3">
          <div>
            <Label htmlFor="destination">Send tokens to</Label>
            <Select id="destination" name="destination" defaultValue="invest">
              <option value="invest">Market cash ({formatMoney(classroom.tokenCashRate)} each)</option>
              <option value="savings">Savings (for rewards)</option>
            </Select>
          </div>
          <div>
            <Label htmlFor="amount">How many tokens</Label>
            <Input id="amount" name="amount" type="number" min={1} max={wallet.unspentTokens} defaultValue={1} />
          </div>
          <Button className="w-full" type="submit" disabled={wallet.unspentTokens < 1}>
            Allocate tokens
          </Button>
        </form>
        <form action={convertCashToSavings} className="mt-6 space-y-3 border-t border-[#E8EEEA] pt-6">
          <h3 className="font-semibold text-navy">Move market cash to savings</h3>
          <p className="text-base text-muted">
            Trade {formatMoney(classroom.tokenCashRate)} of spare market cash for 1 savings token. Whole tokens only, and
            shares have to be sold first.
          </p>
          <div>
            <Label htmlFor="tokens">How many tokens</Label>
            <Input id="tokens" name="tokens" type="number" min={1} max={convertibleTokens} defaultValue={1} />
          </div>
          <Button className="w-full" tone="sky" type="submit" disabled={convertibleTokens < 1}>
            {convertibleTokens < 1
              ? `Need ${formatMoney(classroom.tokenCashRate)} in market cash`
              : `Convert to savings (up to ${formatTokens(convertibleTokens)})`}
          </Button>
        </form>
      </Card>
      <div className="space-y-4">
        <Card>
          <h2 className="font-semibold text-navy">Reward activity</h2>
          <ul className="mt-4 space-y-3">
            {redemptions.length === 0 ? (
              <li className="text-sm text-muted">No reward requests yet. Savings tokens buy the store items below.</li>
            ) : (
              redemptions.slice(0, 4).map((r) => {
                const reward = data.rewards.find((rw) => rw.id === r.rewardId);
                return (
                  <li key={r.id} className="flex justify-between rounded-2xl bg-[#F7FAF8] px-4 py-3 text-sm">
                    <span>
                      {reward?.title}
                      <span className="block text-base text-muted">{r.status}</span>
                    </span>
                    <span className="font-semibold">{formatTokens(reward?.tokenCost ?? 0)}</span>
                  </li>
                );
              })
            )}
          </ul>
        </Card>
        <div className="grid gap-3 sm:grid-cols-2">
          {rewards.map((reward) => (
            <Card key={reward.id}>
              <p className="text-sm font-semibold text-navy">{reward.title}</p>
              <p className="mt-1 text-base text-muted">{reward.description}</p>
              <p className="mt-2 text-sm font-semibold">{formatTokens(reward.tokenCost)}</p>
              <form action={requestReward.bind(null, reward.id)} className="mt-3">
                <Button type="submit" tone="sky" disabled={wallet.savingsTokens < reward.tokenCost} className="w-full">
                  Request reward
                </Button>
              </form>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
