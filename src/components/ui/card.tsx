import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-[28px] border-2 border-navy/10 bg-card p-5 shadow-[0_10px_0_rgba(30,58,95,0.08)]",
        className,
      )}
      {...props}
    />
  );
}
