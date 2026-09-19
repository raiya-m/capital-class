"use client";

import { resolveRedemption } from "@/lib/actions";
import { formatTokens } from "@/lib/utils";
import { useMemo, useState } from "react";
import { Avatar, Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Select } from "./ui/input";

type Row = {
  id: string;
  student: string;
  status: "pending" | "approved" | "denied";
  tokenCost: number;
  title: string;
};

export function RequestList({ rows }: { rows: Row[] }) {
  const [filter, setFilter] = useState("pending");
  const visible = useMemo(
    () => (filter === "all" ? rows : rows.filter((r) => r.status === filter)),
    [filter, rows],
  );

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-semibold text-navy">Reward requests</h2>
        <Select
          className="w-48"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          aria-label="Filter requests"
        >
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="denied">Denied</option>
          <option value="all">All</option>
        </Select>
      </div>
      <ul className="mt-4 space-y-3">
        {visible.length === 0 ? (
          <li className="text-base text-muted">Nothing in this list yet.</li>
        ) : (
          visible.map((row) => (
            <li
              key={row.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-[#F7FAF8] px-4 py-4"
            >
              <div className="flex items-center gap-3">
                <Avatar name={row.student} />
                <div>
                  <p className="text-base font-semibold text-navy">{row.student}</p>
                  <p className="text-base text-muted">{row.title}</p>
                </div>
              </div>
              <p className="text-base font-semibold">{formatTokens(row.tokenCost)}</p>
              {row.status === "pending" ? (
                <div className="flex gap-2">
                  <form action={resolveRedemption.bind(null, row.id, "approved")}>
                    <Button type="submit">Approve</Button>
                  </form>
                  <form action={resolveRedemption.bind(null, row.id, "denied")}>
                    <Button type="submit" tone="ghost">
                      Deny
                    </Button>
                  </form>
                </div>
              ) : (
                <Badge className={row.status === "approved" ? "" : "bg-[#FDECEC] text-coral"}>{row.status}</Badge>
              )}
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
