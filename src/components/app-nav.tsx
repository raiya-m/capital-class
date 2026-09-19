"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn, formatMoney } from "@/lib/utils";
import {
  LayoutDashboard,
  Coins,
  Newspaper,
  Inbox,
  Gift,
  Wallet,
  Sparkles,
  ClipboardList,
  Bot,
  Users,
  Shield,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { BrandMark } from "./brand-mark";
import { AccountMenu } from "./account-menu";

const ICONS: Record<string, LucideIcon> = {
  dashboard: LayoutDashboard,
  coins: Coins,
  news: Newspaper,
  inbox: Inbox,
  gift: Gift,
  wallet: Wallet,
  sparkles: Sparkles,
  clipboard: ClipboardList,
  bot: Bot,
  users: Users,
  shield: Shield,
};

export type NavItem = { href: string; label: string; icon: keyof typeof ICONS };

export function AppShell({
  items,
  name,
  roleLabel,
  subtitle,
  title,
  crumb,
  circulating,
  extraPills,
  settingsHref,
  children,
}: {
  items: NavItem[];
  name: string;
  roleLabel: string;
  subtitle?: string;
  title: string;
  crumb: string;
  circulating?: number;
  extraPills?: ReactNode;
  settingsHref: string;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const titles: Record<string, { title: string; crumb: string }> = {
    "/teacher/summary": { title: "Classroom Command Center", crumb: "Room 4B" },
    "/teacher/tokens": { title: "Award Tokens", crumb: "Room 4B" },
    "/teacher/market": { title: "Market and News", crumb: "Room 4B" },
    "/teacher/requests": { title: "Reward Requests", crumb: "Room 4B" },
    "/teacher/rewards": { title: "Reward Store", crumb: "Room 4B" },
    "/teacher/roster": { title: "Students", crumb: "Room 4B" },
    "/teacher/settings": { title: "Settings", crumb: "Account" },
    "/student/portfolio": { title: "My Portfolio", crumb: "Trading Desk" },
    "/student/class": { title: "My Portfolio", crumb: "Trading Desk" },
    "/student/tokens": { title: "Token Wallet", crumb: "Trading Desk" },
    "/student/news": { title: "Market and News", crumb: "Trading Desk" },
    "/student/market": { title: "Market and News", crumb: "Trading Desk" },
    "/student/powerups": { title: "Power-Ups", crumb: "Trading Desk" },
    "/student/eod": { title: "Session Recap", crumb: "Trading Desk" },
    "/student/coach": { title: "AI Coach", crumb: "Trading Desk" },
    "/student/settings": { title: "Settings", crumb: "Account" },
    "/admin": { title: "School Console", crumb: "Access" },
    "/admin/teachers": { title: "Teachers", crumb: "Access" },
    "/admin/settings": { title: "Settings", crumb: "Account" },
  };
  const heading = titles[pathname] ?? { title, crumb };
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-white">
      <aside className="flex h-full w-60 shrink-0 flex-col bg-navy text-white">
        <div className="flex items-center gap-3 px-5 py-6">
          <BrandMark size={40} />
          <div>
            <p className="text-lg font-semibold leading-none">CapitalClass</p>
            <p className="mt-1 text-sm font-medium text-white/45">{subtitle ?? "Classroom economy"}</p>
          </div>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto px-3">
          {items.map((item) => {
            const active = pathname === item.href;
            const Icon = ICONS[item.icon];
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-2xl px-3 py-3 text-base font-semibold",
                  active ? "bg-mint text-white" : "text-white/75 hover:bg-white/5 hover:text-white",
                )}
              >
                <Icon className="size-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <AccountMenu name={name} roleLabel={roleLabel} settingsHref={settingsHref} />
      </aside>
      <div className="flex min-w-0 flex-1 flex-col bg-[#F6F8F7]">
        <header className="flex shrink-0 flex-wrap items-center justify-between gap-3 px-8 py-6">
          <div>
            <h1 className="text-3xl font-semibold text-navy">{heading.title}</h1>
            <p className="mt-1 text-base text-muted">
              Economics Lab <span className="text-black/20">/</span> {heading.crumb}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {circulating != null ? (
              <span className="rounded-full bg-[#E8F8F0] px-3 py-1.5 text-sm font-semibold text-[#1F9A63]">
                {formatMoney(circulating)} invested
              </span>
            ) : null}
            {extraPills}
          </div>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto px-8 pb-10">{children}</div>
      </div>
    </div>
  );
}
