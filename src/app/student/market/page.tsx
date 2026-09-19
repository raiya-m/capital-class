import { answerQuestion, tradeSector } from "@/lib/actions";
import { studentContext } from "@/lib/queries";
import { formatMoney, formatMoneyExact, formatPct } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input, Label, Select } from "@/components/ui/input";
import Link from "next/link";
import { LiveTape } from "@/components/live-tape";
import { ImpactChips } from "@/components/impact-chips";
import { SpeakButton } from "@/components/speak-button";
import { MoverPills, TrendChart } from "@/components/trend-chart";
import { buildTrendData, previousClose, trendMovers } from "@/lib/trends";

export default async function MarketPage() {
  const { data, holdings, wallet, history, news, question, myAnswer, classroom } = await studentContext();
  const trend = buildTrendData(history, data.sectors);
  const movers = trendMovers(trend, data.sectors);
  const series = [
    { key: "INDEX", color: "#1b2330", width: 3, label: "Index" },
    ...data.sectors.map((s) => ({ key: s.ticker, color: s.color, label: s.name })),
  ];

  return (
    <div className="space-y-5">
      <LiveTape
        indexOpen={trend[0]?.INDEX}
        initial={data.sectors.map((s) => ({
          slug: s.slug,
          ticker: s.ticker,
          name: s.name,
          price: s.price,
          color: s.color,
          prevClose: previousClose(history, s.slug, s.price),
        }))}
      />
      <p className="text-base text-muted">
        Trading cash {formatMoneyExact(wallet.investmentCash)}. Percents are versus yesterday — red means that sector dropped.
        Read the bulletin, then place an order.{" "}
        {wallet.investmentCash < 1 ? (
          <Link href="/student/tokens" className="font-semibold text-navy underline">
            Allocate tokens first
          </Link>
        ) : null}
      </p>
      <Card>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-navy">Trend over time</h2>
            <p className="text-base text-muted">Pick a sector in the dropdown to isolate that line.</p>
          </div>
          <MoverPills movers={movers} />
        </div>
        <TrendChart data={trend} series={series} height={300} />
      </Card>
      <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <h2 className="text-xl font-semibold text-navy">Sector board</h2>
          <ul className="mt-4 divide-y divide-black/5">
            {data.sectors.map((sector) => {
              const held = holdings.find((h) => h.sectorSlug === sector.slug)?.shares ?? 0;
              const close = previousClose(history, sector.slug, sector.price);
              const change = close ? (sector.price - close) / close : 0;
              return (
                <li key={sector.slug} className="flex items-center justify-between gap-3 py-3">
                  <div>
                    <p className="text-base font-semibold text-navy">{sector.name}</p>
                    <p className="text-base text-muted">
                      {sector.ticker} · {held.toFixed(1)} shares
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold">{formatMoneyExact(sector.price)}</p>
                    <p className={`text-base font-semibold ${change < 0 ? "text-coral" : "text-[#1F9A63]"}`}>
                      {formatPct(change)}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        </Card>
        <Card>
          <h2 className="text-xl font-semibold text-navy">Place an order</h2>
          <form action={tradeSector} className="mt-4 space-y-3">
            <div>
              <Label htmlFor="sector">Sector</Label>
              <Select id="sector" name="sector" defaultValue={data.sectors[0]?.slug}>
                {data.sectors.map((s) => (
                  <option key={s.slug} value={s.slug}>
                    {s.name} · {formatMoneyExact(s.price)}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="side">Action</Label>
              <Select id="side" name="side" defaultValue="buy">
                <option value="buy">Buy</option>
                <option value="sell">Sell</option>
              </Select>
            </div>
            <div>
              <Label htmlFor="shares">Shares</Label>
              <Input id="shares" name="shares" type="number" min={0.1} step={0.1} defaultValue={1} />
            </div>
            <Button className="w-full" type="submit">
              Submit order
            </Button>
          </form>
        </Card>
      </div>
      <div className="grid gap-4 lg:grid-cols-[1.3fr_0.9fr]">
        <Card>
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-navy">Incident bulletin</h2>
            <Badge>Session {classroom.marketDay}</Badge>
          </div>
          <ul className="mt-4 space-y-5">
            {news.map((item) => (
              <li key={item.id}>
                <div className="flex items-start justify-between gap-3">
                  <p className="text-lg font-semibold text-navy">{item.headline}</p>
                  <SpeakButton text={`${item.headline}. ${item.body}`} label="Hear bulletin" />
                </div>
                <p className="mt-1 text-base text-muted">{item.body}</p>
                <ImpactChips impacts={item.impacts} />
              </li>
            ))}
          </ul>
        </Card>
        {question ? (
          <Card className="bg-navy text-white">
            <p className="eyebrow text-mint">Read the tape</p>
            <h2 className="mt-2 text-xl font-semibold">{question.prompt}</h2>
            <p className="mt-2 text-base text-white/70">
              Pick the sector the news should lift. A correct answer adds {formatMoney(question.rewardCash)} cash.
            </p>
            {myAnswer ? (
              <p className="mt-4 text-base">
                You picked {myAnswer.sector}.{" "}
                {myAnswer.correct ? "Nice read of the incident." : "The bulletin pointed somewhere else — try the next one."}
              </p>
            ) : (
              <form action={answerQuestion} className="mt-4 space-y-3">
                <Select name="sector" defaultValue={question.options[0]?.sector} className="bg-white text-navy">
                  {question.options.map((opt) => (
                    <option key={opt.sector} value={opt.sector}>
                      {opt.label}
                    </option>
                  ))}
                </Select>
                <Button type="submit" className="w-full">
                  Lock in guess
                </Button>
              </form>
            )}
          </Card>
        ) : null}
      </div>
    </div>
  );
}
