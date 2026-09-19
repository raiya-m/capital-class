"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOutAction } from "@/lib/actions";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";

type Item = { href: string; label: string; emoji: string };

export function AppNav({
  items,
  name,
  roleLabel,
}: {
  items: Item[];
  name: string;
  roleLabel: string;
}) {
  const pathname = usePathname();
  return (
    <aside className="flex w-full flex-col gap-4 lg:w-64">
      <div className="rounded-[28px] border-2 border-navy/10 bg-navy p-5 text-white shadow-[0_10px_0_rgba(18,38,63,0.35)]">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold">Capital Class</p>
        <h1 className="mt-2 font-black text-2xl leading-none">{name}</h1>
        <p className="mt-2 text-sm text-white/70">{roleLabel}</p>
      </div>
      <nav className="rounded-[28px] border-2 border-navy/10 bg-card p-3">
        {items.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "mb-1 flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-bold",
                active ? "bg-gold text-navy" : "text-navy/80 hover:bg-navy/5",
              )}
            >
              <span>{item.emoji}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>
      <form action={signOutAction}>
        <Button tone="ghost" className="w-full" type="submit">
          Sign out
        </Button>
      </form>
    </aside>
  );
}
