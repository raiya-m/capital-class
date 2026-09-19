import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

export function Badge({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full bg-[#E8F8F0] px-3 py-1 text-sm font-semibold text-[#1F9A63]",
        className,
      )}
      {...props}
    />
  );
}

export function Avatar({ name, className }: { name: string; className?: string }) {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
  return (
    <span
      className={cn(
        "inline-flex size-10 items-center justify-center rounded-full bg-[#D8F3E6] text-sm font-bold text-[#1F9A63]",
        className,
      )}
    >
      {initials}
    </span>
  );
}
