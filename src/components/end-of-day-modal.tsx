"use client";

import { ackEndOfDay } from "@/lib/actions";
import { formatMoneyExact } from "@/lib/utils";
import type { TickSummary } from "@/lib/types";
import { Button } from "./ui/button";
import { Card } from "./ui/card";

export function EndOfDayModal({ summary }: { summary: TickSummary }) {
  const up = summary.portfolioDelta >= 0;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/40 p-4">
      <Card className="max-w-md p-8">
        <p className="eyebrow text-mint">
          End of market day {summary.day}
        </p>
        <h2 className="mt-2 text-2xl font-semibold text-navy">Today&apos;s recap</h2>
        <p className={`mt-4 text-2xl font-semibold ${up ? "text-mint" : "text-coral"}`}>
          {up ? "Up" : "Down"} {formatMoneyExact(Math.abs(summary.portfolioDelta))}
        </p>
        <p className="mt-2 text-sm text-muted">
          You are #{summary.rank} of {summary.classmateCount} investors.
        </p>
        {summary.powerupNotes.map((note) => (
          <p key={note} className="mt-2 rounded-2xl bg-[#F3FBF7] px-3 py-2 text-sm">
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
