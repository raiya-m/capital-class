"use client";

import { formatMoneyExact, formatPct } from "@/lib/utils";
import type { TrendRow } from "@/lib/trends";
import { useMemo, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export type Series = { key: string; color: string; label?: string; width?: number };

export function TrendChart({
  data,
  series,
  height = 280,
}: {
  data: TrendRow[];
  series: Series[];
  height?: number;
}) {
  const [locked, setLocked] = useState<string>("");
  const focus = locked || null;

  const visible = useMemo(() => {
    if (!focus) return data;
    return data.map((row) => ({ session: row.session, [focus]: row[focus] }));
  }, [data, focus]);

  const active = focus ? series.filter((s) => s.key === focus) : series;
  const focusLabel = series.find((s) => s.key === focus)?.label ?? focus;
  const sectors = series.filter((s) => s.key !== "INDEX");

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-3">
        <label className="eyebrow" htmlFor="sector-focus">
          Show on chart
        </label>
        <select
          id="sector-focus"
          className="min-w-48 rounded-2xl border border-black/8 bg-[#F7F9F8] px-4 py-2.5 text-base text-ink"
          value={locked}
          onChange={(e) => setLocked(e.target.value)}
        >
          <option value="">All sectors</option>
          {sectors.map((s) => (
            <option key={s.key} value={s.key}>
              {s.label ?? s.key}
            </option>
          ))}
        </select>
      </div>
      <p className="mb-3 text-base text-muted">
        {focus ? `Showing ${focusLabel} only.` : "Pick a sector to isolate that trend, or keep all sectors."}
      </p>
      <div style={{ height }} className="w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={visible} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
            <CartesianGrid stroke="#E8EEEA" strokeDasharray="3 3" />
            <XAxis
              dataKey="session"
              tick={{ fontSize: 13, fill: "#5c6570" }}
              tickFormatter={(v) => `${Number(v).toFixed(0)}`}
            />
            <YAxis tick={{ fontSize: 13, fill: "#5c6570" }} domain={["auto", "auto"]} width={52} />
            <Tooltip
              formatter={(value, name) => [formatMoneyExact(Number(value)), String(name)]}
              labelFormatter={(label) => `Session ${Number(label).toFixed(0)}`}
            />
            {active.map((s) => (
              <Line
                key={s.key}
                type="monotone"
                dataKey={s.key}
                stroke={s.color}
                strokeWidth={focus === s.key ? 3.5 : s.width ?? 2}
                dot={false}
                name={s.label ?? s.key}
                connectNulls
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function MoverPills({
  movers,
}: {
  movers: { ticker: string; name: string; change: number }[];
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {movers.map((m) => (
        <span
          key={m.ticker}
          className={`rounded-full px-3 py-1 text-sm font-semibold ${
            m.change >= 0 ? "bg-[#E8F8F0] text-[#1F9A63]" : "bg-[#FDECEC] text-coral"
          }`}
        >
          {m.ticker} {formatPct(m.change)}
        </span>
      ))}
    </div>
  );
}
