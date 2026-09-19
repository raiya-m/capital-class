import { formatPct } from "@/lib/utils";
import type { SectorSlug } from "@/lib/types";

export function ImpactChips({ impacts }: { impacts: Partial<Record<SectorSlug, number>> }) {
  return (
    <div className="mt-2 flex flex-wrap gap-1.5">
      {Object.entries(impacts).map(([slug, value]) => {
        const up = (value ?? 0) >= 0;
        return (
          <span
            key={slug}
            className={`rounded-full px-2.5 py-1 text-sm font-semibold uppercase ${
              up ? "bg-[#E8F8F0] text-[#1F9A63]" : "bg-[#FDECEC] text-coral"
            }`}
          >
            {slug} {formatPct(value ?? 0)}
          </span>
        );
      })}
    </div>
  );
}
