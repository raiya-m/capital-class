import { tradeSector } from "@/lib/actions";
import { studentContext } from "@/lib/queries";
import { formatMoneyExact } from "@/lib/utils";
import { Spark } from "@/components/spark";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default async function MarketPage() {
  const { data, holdings, wallet, history } = await studentContext();

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-4xl font-black text-navy">Sector market</h1>
        <p className="font-medium text-navy/70">
          Cash on hand {formatMoneyExact(wallet.investmentCash)}. Prices are classroom practice only.
        </p>
      </header>
      <div className="grid gap-4 lg:grid-cols-2">
        {data.sectors.map((sector) => {
          const held = holdings.find((h) => h.sectorSlug === sector.slug)?.shares ?? 0;
          const points = history
            .filter((p) => p.sectorSlug === sector.slug)
            .sort((a, b) => a.day - b.day)
            .map((p) => ({ day: p.day, price: p.price }));
          return (
            <Card key={sector.slug}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-3xl">{sector.emoji}</p>
                  <h2 className="text-2xl font-black text-navy">{sector.name}</h2>
                  <p className="font-bold text-navy/60">{formatMoneyExact(sector.price)} · {held.toFixed(2)} shares</p>
                </div>
              </div>
              <Spark points={points} color={sector.color} />
              <form action={tradeSector} className="mt-3 flex flex-wrap gap-2">
                <input type="hidden" name="sector" value={sector.slug} />
                <Input name="shares" type="number" min={0.1} step={0.1} defaultValue={1} className="w-24" />
                <Button name="side" value="buy" type="submit" tone="leaf">
                  Buy
                </Button>
                <Button name="side" value="sell" type="submit" tone="ghost">
                  Sell
                </Button>
              </form>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
