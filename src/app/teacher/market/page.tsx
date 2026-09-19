import { previewMarketDay, publishMarketDay } from "@/lib/actions";
import { teacherContext } from "@/lib/queries";
import { formatMoney, formatPct } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default async function TeacherMarketPage() {
  const { classroom, stats, news, question } = await teacherContext();
  const pending = classroom.pendingTick;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-4xl font-black text-navy">Market simulation</h1>
        <p className="font-medium text-navy/70">
          Generate kid-safe news, preview prices, then publish the next day.
        </p>
      </header>
      <div className="flex flex-wrap gap-3">
        <form action={previewMarketDay}>
          <Button type="submit" tone="sky">
            Preview next day
          </Button>
        </form>
        <form action={publishMarketDay}>
          <Button type="submit" tone="gold" disabled={!pending}>
            Publish market day
          </Button>
        </form>
      </div>
      {pending ? (
        <Card className="border-gold">
          <h2 className="text-xl font-black text-navy">Preview — day {classroom.marketDay + 1}</h2>
          <p className="mt-1 text-sm font-medium text-navy/70">Students will not see this until you publish.</p>
          <div className="mt-4 space-y-3">
            {pending.news.map((item) => (
              <div key={item.headline} className="rounded-2xl bg-white p-4">
                <p className="font-black text-navy">{item.headline}</p>
                <p className="text-sm text-navy/70">{item.body}</p>
                <p className="mt-2 text-xs font-bold text-sky">
                  {Object.entries(item.impacts)
                    .map(([k, v]) => `${k} ${formatPct(v ?? 0)}`)
                    .join(" · ")}
                </p>
              </div>
            ))}
          </div>
          <p className="mt-4 font-bold text-navy">QOTD: {pending.question.prompt}</p>
          <div className="mt-4 grid gap-2 sm:grid-cols-5">
            {Object.entries(pending.projectedPrices).map(([slug, price]) => (
              <div key={slug} className="rounded-2xl bg-navy/5 p-3 text-center">
                <p className="text-xs font-bold capitalize">{slug}</p>
                <p className="font-black">{formatMoney(price)}</p>
              </div>
            ))}
          </div>
        </Card>
      ) : null}
      <Card>
        <h2 className="text-xl font-black text-navy">Live day {classroom.marketDay}</h2>
        <div className="mt-3 space-y-2">
          {news.map((item) => (
            <p key={item.id} className="rounded-2xl bg-white px-4 py-3 font-bold text-navy">
              {item.headline}
            </p>
          ))}
        </div>
        {question ? (
          <p className="mt-4 text-sm font-medium text-navy/70">Question: {question.prompt}</p>
        ) : null}
        <div className="mt-4 grid gap-2 sm:grid-cols-5">
          {Object.entries(stats.prices).map(([slug, price]) => (
            <div key={slug} className="rounded-2xl bg-white p-3 text-center">
              <p className="text-xs font-bold capitalize text-navy/60">{slug}</p>
              <p className="font-black text-navy">{formatMoney(price)}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
