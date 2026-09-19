import { analyzeTeacherIncident, playNewsIncident, previewMarketDay, publishMarketDay, publishTeacherIncident } from "@/lib/actions";
import { teacherContext } from "@/lib/queries";
import { formatMoney, formatPct } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/input";
import { LiveTape } from "@/components/live-tape";
import { ImpactChips } from "@/components/impact-chips";
import { SpeakButton } from "@/components/speak-button";
import { MoverPills, TrendChart } from "@/components/trend-chart";
import { buildTrendData, previousClose, trendMovers } from "@/lib/trends";

export default async function TeacherMarketPage() {
  const { classroom, news, question, data } = await teacherContext();
  const pending = classroom.pendingTick;
  const trend = buildTrendData(data.prices, data.sectors);
  const movers = trendMovers(trend, data.sectors);
  const series = [
    { key: "INDEX", color: "#1b2330", width: 3, label: "Index" },
    ...data.sectors.map((s) => ({ key: s.ticker, color: s.color, label: s.name })),
  ];
  const prev = Object.fromEntries(
    data.sectors.map((s) => {
      const close = previousClose(data.prices, s.slug, s.price);
      return [s.slug, close ? (s.price - close) / close : 0];
    }),
  );

  return (
    <div className="space-y-4">
      <LiveTape
        indexOpen={trend[0]?.INDEX}
        initial={data.sectors.map((s) => ({
          slug: s.slug,
          ticker: s.ticker,
          name: s.name,
          price: s.price,
          color: s.color,
          prevClose: previousClose(data.prices, s.slug, s.price),
        }))}
      />
      <Card>
        <h2 className="font-semibold text-navy">Publish a classroom incident</h2>
        <p className="mt-1 text-base text-muted">
          Type what happened in class. AI rewrites it kid-safe and prices which sectors rise or drop. Surprise bulletin
          uses a canned story when you need a fast demo.
        </p>
        <form className="mt-4 space-y-3">
          <Textarea
            name="incident"
            required
            minLength={8}
            placeholder="Example: A surprise frost nipped the class garden overnight, but the coding club weather app warned everyone in time."
          />
          <div className="flex flex-wrap gap-2">
            <Button formAction={analyzeTeacherIncident} type="submit">
              Price this incident
            </Button>
            <Button formAction={publishTeacherIncident} type="submit" tone="sky">
              Price and publish
            </Button>
          </div>
        </form>
        <div className="mt-4 flex flex-wrap gap-2 border-t border-black/5 pt-4">
          <form action={playNewsIncident}>
            <Button type="submit" tone="ghost">
              Surprise bulletin
            </Button>
          </form>
          <form action={previewMarketDay}>
            <Button type="submit" tone="ghost">
              Preview surprise
            </Button>
          </form>
          <form action={publishMarketDay}>
            <Button type="submit" tone="sky" disabled={!pending}>
              Publish preview
            </Button>
          </form>
        </div>
      </Card>
      <Card>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="font-semibold text-navy">Trend over time</h2>
            <p className="text-sm text-muted">Index plus every sector. Spikes line up with news incidents.</p>
          </div>
          <MoverPills movers={movers} />
        </div>
        <div className="mt-3">
          <TrendChart data={trend} series={series} height={300} />
        </div>
      </Card>
      <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {data.sectors.map((sector) => {
          const change = prev[sector.slug] ?? 0;
          const up = change >= 0;
          return (
            <li key={sector.slug}>
              <Card className="flex items-start justify-between">
                <div>
                  <p className="eyebrow">{sector.ticker}</p>
                  <p className="text-base font-medium text-navy">{sector.name}</p>
                  <p className="mt-3 text-2xl font-semibold">{formatMoney(sector.price)}</p>
                </div>
                <span className={`text-base font-semibold ${up ? "text-mint" : "text-coral"}`}>{formatPct(change)}</span>
              </Card>
            </li>
          );
        })}
      </ul>
      {pending ? (
        <Card>
          <div className="flex items-center gap-2">
            <h2 className="font-semibold text-navy">Incident preview — session {classroom.marketDay + 1}</h2>
            <Badge className="bg-[#FFF4E5] text-[#D97706]">Not on the tape yet</Badge>
          </div>
          {pending.rationale ? (
            <p className="mt-3 rounded-2xl bg-[#F3FBF7] px-4 py-3 text-sm text-navy">
              <span className="font-semibold">AI tape call: </span>
              {pending.rationale}
            </p>
          ) : null}
          <div className="mt-4 space-y-3">
            {pending.news.map((item) => (
              <div key={item.headline} className="rounded-2xl bg-[#F7FAF8] p-4">
                <div className="flex items-start justify-between gap-3">
                  <p className="font-semibold text-navy">{item.headline}</p>
                  <SpeakButton text={`${item.headline}. ${item.body}`} label="Read to class" />
                </div>
                <p className="mt-1 text-sm text-muted">{item.body}</p>
                <ImpactChips impacts={item.impacts} />
              </div>
            ))}
          </div>
          <p className="mt-4 text-sm font-medium text-navy">QOTD: {pending.question.prompt}</p>
          <div className="mt-4 grid gap-2 sm:grid-cols-5">
            {data.sectors.map((sector) => {
              const next = pending.projectedPrices[sector.slug];
              const delta = next && sector.price ? (next - sector.price) / sector.price : 0;
              return (
                <div key={sector.slug} className="rounded-2xl bg-[#F7FAF8] p-3 text-center">
                  <p className="eyebrow">{sector.ticker}</p>
                  <p className="font-semibold">{formatMoney(next ?? sector.price)}</p>
                  <p className={`text-base ${delta >= 0 ? "text-mint" : "text-coral"}`}>{formatPct(delta)}</p>
                </div>
              );
            })}
          </div>
        </Card>
      ) : null}
      <div className="grid gap-4 lg:grid-cols-[1.3fr_0.9fr]">
        <Card>
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-navy">Why the tape moved</h2>
            <Badge>Session {classroom.marketDay}</Badge>
          </div>
          <ul className="mt-4 space-y-4">
            {news.map((item) => (
              <li key={item.id}>
                <div className="flex items-start justify-between gap-3">
                  <p className="text-lg font-semibold text-navy">{item.headline}</p>
                  <SpeakButton text={`${item.headline}. ${item.body}`} label="Hear it" />
                </div>
                <p className="text-base text-muted">{item.body}</p>
                <ImpactChips impacts={item.impacts} />
              </li>
            ))}
          </ul>
        </Card>
        <Card className="bg-navy text-white">
          <h2 className="font-semibold">Prediction window</h2>
          <p className="mt-2 text-sm text-white/60">
            Students read the incident, pick the sector that should rise, and earn extra cash if they are right. This is
            practice, not real money.
          </p>
          {question ? (
            <div className="mt-5 rounded-2xl bg-black/20 p-4">
              <p className="eyebrow text-mint">Question of the session</p>
              <p className="mt-2 text-base">{question.prompt}</p>
            </div>
          ) : null}
        </Card>
      </div>
    </div>
  );
}
