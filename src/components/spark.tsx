"use client";

import { formatMoneyExact } from "@/lib/utils";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export function Spark({
  points,
  color,
}: {
  points: { day: number; price: number }[];
  color: string;
}) {
  return (
    <div className="h-28 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={points}>
          <XAxis dataKey="day" hide />
          <YAxis domain={["dataMin - 4", "dataMax + 4"]} hide />
          <Tooltip
            formatter={(value) => [formatMoneyExact(Number(value)), "Price"]}
            labelFormatter={(label) => `Tick ${Number(label).toFixed(2)}`}
          />
          <Line type="monotone" dataKey="price" stroke={color} strokeWidth={3} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
