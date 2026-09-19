import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("rounded-[22px] border border-black/[0.04] bg-white p-6 shadow-sm", className)}
      {...props}
    />
  );
}
