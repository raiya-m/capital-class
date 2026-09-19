import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes } from "react";

const styles = {
  primary:
    "bg-mint text-white hover:bg-[#2db57a] shadow-none",
  gold: "bg-mint text-white hover:bg-[#2db57a]",
  sky: "bg-navy text-white hover:bg-[#111821]",
  leaf: "bg-mint text-white hover:bg-[#2db57a]",
  ghost: "bg-[#F3F5F4] text-navy hover:bg-[#e8ecea]",
  danger: "bg-white text-coral border border-coral/20 hover:bg-coral/5",
};

export function Button({
  className,
  tone = "primary",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { tone?: keyof typeof styles }) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-base font-semibold transition disabled:opacity-50 cursor-pointer",
        styles[tone],
        className,
      )}
      {...props}
    />
  );
}
