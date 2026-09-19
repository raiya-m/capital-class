import { cn } from "@/lib/utils";

export function BrandMark({ className, size = 40 }: { className?: string; size?: number }) {
  return (
    <span
      className={cn(
        "relative inline-flex items-center justify-center rounded-2xl bg-mint text-white shadow-[0_10px_24px_rgba(62,207,142,0.38)]",
        className,
      )}
      style={{ width: size, height: size }}
      aria-hidden
    >
      <svg viewBox="0 0 24 24" className="h-[58%] w-[58%]" fill="none">
        <rect x="3.5" y="13.5" width="4" height="7" rx="1.2" fill="currentColor" opacity="0.75" />
        <rect x="10" y="8.5" width="4" height="12" rx="1.2" fill="currentColor" />
        <rect x="16.5" y="4.5" width="4" height="16" rx="1.2" fill="currentColor" />
      </svg>
    </span>
  );
}
