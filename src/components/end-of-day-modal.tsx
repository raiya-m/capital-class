"use client";

import { ackEndOfDay } from "@/lib/actions";
import { formatMoneyExact } from "@/lib/utils";
import type { TickSummary } from "@/lib/types";
import { Button } from "./ui/button";
import { Card } from "./ui/card";

export function EndOfDayModal({ summary }: { summary: TickSummary }) {
  const up = summary.portfolioDelta >= 0;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/50 p-4">
      <Card className="max-w-md">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-sky">End of market day {summary.day}</p>
        <h2 className="mt-2 text-3xl font-black text-navy">Today&apos;s recap</h2>
        <p className={`mt-4 text-2xl font-black ${up ? "text-leaf" : "text-coral"}`}>
          {up ? "Up" : "Down"} {formatMoneyExact(Math.abs(summary.portfolioDelta))}
        </p>
        <p className="mt-2 text-sm font-medium text-navy/70">
          You are #{summary.rank} of {summary.classmateCount} investors.
        </p>
        {summary.powerupNotes.map((note) => (
          <p key={note} className="mt-2 rounded-2xl bg-gold/30 px-3 py-2 text-sm font-bold text-navy">
            {note}
          </p>
        ))}
        <form action={ackEndOfDay} className="mt-6">
          <Button className="w-full" type="submit">
            Got it
          </Button>
        </form>
      </Card>
    </div>
  );
}
