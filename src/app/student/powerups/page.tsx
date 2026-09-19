import { buyPowerup } from "@/lib/actions";
import { studentContext } from "@/lib/queries";
import { formatMoney } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function PowerupsPage() {
  const { data, powerups, wallet } = await studentContext();

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-4xl font-black text-navy">Chance cards</h1>
        <p className="font-medium text-navy/70">
          Buy with investment cash. Effects apply to your results on the next published market day.
        </p>
      </header>
      <p className="font-black text-navy">Cash {formatMoney(wallet.investmentCash)}</p>
      <div className="grid gap-4 sm:grid-cols-2">
        {data.powerupCatalog.map((item) => {
          const owned = powerups.find((p) => p.powerupId === item.id);
          return (
            <Card key={item.id}>
              <div className="text-4xl">{item.emoji}</div>
              <h2 className="mt-2 text-2xl font-black text-navy">{item.name}</h2>
              <p className="font-medium text-navy/70">{item.description}</p>
              <p className="mt-2 font-black text-gold">{formatMoney(item.costCash)}</p>
              {owned ? <Badge className="mt-2">Ready x{owned.charges}</Badge> : null}
              <form action={buyPowerup.bind(null, item.id)} className="mt-4">
                <Button type="submit" disabled={wallet.investmentCash < item.costCash}>
                  Buy card
                </Button>
              </form>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
