"use client";

import { formatMoneyExact, formatPct } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { SpeakButton } from "./speak-button";

export type Quote = {
  slug: string;
  ticker: string;
  name: string;
  price: number;
  color: string;
  prevClose: number;
};

export function LiveTape({ initial, indexOpen }: { initial: Quote[]; indexOpen?: number }) {
  const [quotes, setQuotes] = useState(initial);
  const router = useRouter();

  useEffect(() => {
    setQuotes(initial);
  }, [initial]);

  useEffect(() => {
    const id = setInterval(async () => {
      try {
        const res = await fetch("/api/market/tick", { method: "POST" });
        if (!res.ok) return;
        const next = (await res.json()) as Quote[];
        if (!Array.isArray(next) || next.length === 0) return;
        setQuotes(next);
        router.refresh();
      } catch {
        /* keep last tape */
      }
    }, 4500);
    return () => clearInterval(id);
  }, [router]);

  const index = quotes.reduce((s, q) => s + q.price, 0) / Math.max(quotes.length, 1);
  const open = indexOpen && indexOpen > 0 ? indexOpen : quotes.reduce((s, q) => s + (q.prevClose || q.price), 0) / Math.max(quotes.length, 1);
  const indexChange = open ? (index - open) / open : 0;
  const indexDown = indexChange < -0.0005;
  const indexTone = indexDown ? "text-coral" : indexChange > 0.0005 ? "text-mint" : "text-white";
  const script = `CapitalClass live tape. Index ${index.toFixed(1)} dollars, ${
    indexDown ? "down" : indexChange > 0 ? "up" : "unchanged"
  } ${Math.abs(indexChange * 100).toFixed(1)} percent versus yesterday. ${quotes
    .map((q) => {
      const change = q.prevClose ? ((q.price - q.prevClose) / q.prevClose) * 100 : 0;
      const dir = change < 0 ? "down" : "up";
      return `${q.name} ${q.price.toFixed(2)} dollars, ${dir} ${Math.abs(change).toFixed(1)} percent`;
    })
    .join(". ")}.`;

  return (
    <div className="overflow-hidden rounded-[22px] bg-navy text-white">
      <div className="flex items-center justify-between gap-3 px-5 py-3">
        <div>
          <p className="eyebrow text-white/55">CapitalClass Index · vs start of the chart</p>
          <p className={`text-2xl font-semibold ${indexTone}`}>{formatMoneyExact(index)}</p>
          <p className={`text-sm font-semibold ${indexTone}`}>{formatPct(indexChange)}</p>
        </div>
        <div className="flex items-center gap-3">
          <p className="hidden text-sm text-white/70 sm:block">Green is up. Red is down. Not real money.</p>
          <SpeakButton text={script} label="Hear tape" tone="primary" />
        </div>
      </div>
      <div className="flex gap-0 overflow-x-auto border-t border-white/10">
        {quotes.map((q) => {
          const change = q.prevClose ? (q.price - q.prevClose) / q.prevClose : 0;
          const down = change < -0.0005;
          const tone = down ? "text-coral" : change > 0.0005 ? "text-mint" : "text-white/60";
          return (
            <div key={q.slug} className="min-w-[140px] flex-1 border-r border-white/10 px-4 py-3 last:border-r-0">
              <p className="text-sm font-semibold tracking-wide text-white/50">{q.ticker}</p>
              <p className="text-base font-medium">{q.name}</p>
              <p className="mt-1 text-xl font-semibold">{formatMoneyExact(q.price)}</p>
              <p className={`text-sm font-semibold ${tone}`}>{formatPct(change)}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
