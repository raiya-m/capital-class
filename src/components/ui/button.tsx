import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes } from "react";

const styles = {
  primary:
    "bg-navy text-white hover:bg-[#16314f] shadow-[0_4px_0_#12263f]",
  gold: "bg-gold text-navy hover:bg-[#d4a71c] shadow-[0_4px_0_#b8860b]",
  sky: "bg-sky text-white hover:bg-[#2f86c9] shadow-[0_4px_0_#246a9e]",
  leaf: "bg-leaf text-white hover:bg-[#26855a] shadow-[0_4px_0_#1d6a47]",
  ghost: "bg-white/70 text-navy border-2 border-navy/15 hover:bg-white",
  danger: "bg-coral text-white hover:bg-[#d44b3b] shadow-[0_4px_0_#b83c2e]",
};

export function Button({
  className,
  tone = "primary",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { tone?: keyof typeof styles }) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-bold transition active:translate-y-0.5 active:shadow-none disabled:opacity-50",
        styles[tone],
        className,
      )}
      {...props}
    />
  );
}
