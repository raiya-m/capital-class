import type { PricePoint, Sector } from "./types";

export type TrendRow = Record<string, number>;

export function previousClose(prices: PricePoint[], sectorSlug: string, fallback: number) {
  const dailies = prices
    .filter((p) => p.sectorSlug === sectorSlug && Number.isInteger(p.day))
    .sort((a, b) => a.day - b.day);
  if (dailies.length >= 2) return dailies[dailies.length - 2]!.price;
  return dailies[0]?.price ?? fallback;
}

// The move a single market day produced: the price the tick wrote for that day,
// against the last price recorded before it. Summing shares * (close - open) over
// a student's holdings reproduces their TickSummary.portfolioDelta exactly.
export function dayMove(prices: PricePoint[], sectorSlug: string, day: number) {
  const points = prices.filter((p) => p.sectorSlug === sectorSlug).sort((a, b) => a.day - b.day);
  const idx = points.findIndex((p) => p.day === day);
  if (idx === -1) {
    const last = points[points.length - 1]?.price ?? 0;
    return { open: last, close: last };
  }
  const close = points[idx]!.price;
  const open = points[idx - 1]?.price ?? close;
  return { open, close };
}

export function buildTrendData(prices: PricePoint[], sectors: Sector[]): TrendRow[] {
  const buckets = new Map<number, TrendRow>();
  const sorted = [...prices].sort((a, b) => a.day - b.day);
  for (const point of sorted) {
    const sector = sectors.find((s) => s.slug === point.sectorSlug);
    if (!sector) continue;
    const key = Math.round(point.day);
    const row = buckets.get(key) ?? { session: key };
    row[sector.ticker] = point.price;
    buckets.set(key, row);
  }

  const last: Record<string, number> = {};
  return [...buckets.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([, row]) => {
      const next = { ...row };
      for (const sector of sectors) {
        const value = next[sector.ticker];
        if (typeof value === "number") last[sector.ticker] = value;
        else if (last[sector.ticker] != null) next[sector.ticker] = last[sector.ticker];
      }
      const vals = sectors.map((s) => next[s.ticker]).filter((n): n is number => typeof n === "number");
      next.INDEX = vals.length ? Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 100) / 100 : 0;
      return next;
    });
}

export function trendMovers(rows: TrendRow[], sectors: Sector[]) {
  if (rows.length < 2) return [];
  const first = rows[0];
  const last = rows[rows.length - 1];
  return sectors
    .map((sector) => {
      const a = first[sector.ticker];
      const b = last[sector.ticker];
      const change = a ? (b - a) / a : 0;
      return { ticker: sector.ticker, name: sector.name, color: sector.color, change, last: b };
    })
    .sort((x, y) => y.change - x.change);
}
