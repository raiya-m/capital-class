import { studentContext } from "@/lib/queries";
import { formatMoney, formatMoneyExact } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function PortfolioPage() {
  const { profile, wallet, holdings, invested, prices, rank, stats, classroom } = await studentContext();
  const total = wallet.investmentCash + invested;

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-sky">Your desk</p>
        <h1 className="text-4xl font-black text-navy">Hey {profile.displayName.split(" ")[0]}</h1>
      </header>
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <p className="text-xs font-bold uppercase text-navy/50">Portfolio</p>
          <p className="mt-2 text-3xl font-black text-navy">{formatMoney(total)}</p>
        </Card>
        <Card>
          <p className="text-xs font-bold uppercase text-navy/50">Investment cash</p>
          <p className="mt-2 text-3xl font-black text-sky">{formatMoneyExact(wallet.investmentCash)}</p>
        </Card>
        <Card>
          <p className="text-xs font-bold uppercase text-navy/50">Class rank</p>
          <p className="mt-2 text-3xl font-black text-gold">#{rank}</p>
          <p className="text-sm font-bold text-navy/50">of {stats.students.length}</p>
        </Card>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <p className="text-xs font-bold uppercase text-navy/50">Unspent tokens</p>
          <p className="mt-2 text-3xl font-black">{wallet.unspentTokens}</p>
        </Card>
        <Card>
          <p className="text-xs font-bold uppercase text-navy/50">Savings tokens</p>
          <p className="mt-2 text-3xl font-black">{wallet.savingsTokens}</p>
        </Card>
        <Card>
          <p className="text-xs font-bold uppercase text-navy/50">Rate</p>
          <p className="mt-2 text-lg font-black">1 token = ${classroom.tokenCashRate}</p>
        </Card>
      </div>
      <Card>
        <h2 className="text-xl font-black text-navy">Holdings</h2>
        <div className="mt-4 space-y-2">
          {holdings.length === 0 ? <p className="text-navy/60">No sectors yet. Visit the market!</p> : null}
          {holdings.map((h) => (
            <div key={h.sectorSlug} className="flex items-center justify-between rounded-2xl bg-navy/5 px-4 py-3">
              <div>
                <Badge className="capitalize">{h.sectorSlug}</Badge>
                <p className="mt-1 text-sm font-bold text-navy/70">{h.shares.toFixed(2)} shares</p>
              </div>
              <p className="font-black text-navy">{formatMoney(h.shares * (prices[h.sectorSlug] ?? 0))}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
