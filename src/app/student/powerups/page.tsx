import { buyPowerup } from "@/lib/actions";
import { studentContext } from "@/lib/queries";
import { formatMoney } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export default async function PowerupsPage() {
  const { data, powerups, wallet } = await studentContext();

  return (
    <div className="space-y-4">
      <p className="text-base text-muted">
        Spend investment cash on a card. It applies once, on the next published market day, then it is used up.
      </p>
      <p className="text-base font-semibold">
        Cash {formatMoney(wallet.investmentCash)}
        {wallet.investmentCash < 1 ? (
          <>
            {" · "}
            <Link href="/student/tokens" className="underline">
              Allocate tokens to get cash
            </Link>
          </>
        ) : null}
      </p>
      <ul className="grid gap-4 sm:grid-cols-2">
        {data.powerupCatalog.map((item) => {
          const owned = powerups.find((p) => p.powerupId === item.id);
          return (
            <li key={item.id}>
            <Card>
              <h2 className="text-xl font-semibold text-navy">{item.name}</h2>
              <p className="mt-1 text-base text-muted">{item.description}</p>
              <p className="mt-3 font-semibold text-mint">{formatMoney(item.costCash)}</p>
              {owned ? <Badge className="mt-2">Ready x{owned.charges}</Badge> : null}
              <form action={buyPowerup.bind(null, item.id)} className="mt-4">
                <Button type="submit" disabled={wallet.investmentCash < item.costCash} className="w-full">
                  Buy card
                </Button>
              </form>
            </Card>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
