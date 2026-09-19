import { AppShell } from "@/components/app-nav";
import { EndOfDayModal } from "@/components/end-of-day-modal";
import { getSessionProfile, homeFor } from "@/lib/auth";
import { studentContext } from "@/lib/queries";
import { formatMoney } from "@/lib/utils";
import { redirect } from "next/navigation";

const items = [
  { href: "/student/portfolio", label: "Dashboard", icon: "dashboard" as const },
  { href: "/student/tokens", label: "Token Wallet", icon: "wallet" as const },
  { href: "/student/market", label: "Market and News", icon: "news" as const },
  { href: "/student/powerups", label: "Power-Ups", icon: "sparkles" as const },
  { href: "/student/eod", label: "Session Recap", icon: "clipboard" as const },
  { href: "/student/coach", label: "AI Coach", icon: "bot" as const },
];

export default async function StudentLayout({ children }: LayoutProps<"/student">) {
  const profile = await getSessionProfile();
  if (!profile) redirect("/login");
  if (profile.role !== "student") redirect(homeFor(profile.role));
  const ctx = await studentContext();
  const wealth = ctx.wallet.investmentCash + ctx.invested;
  const showRecap =
    ctx.wallet.lastSeenMarketDay < ctx.classroom.marketDay && ctx.wallet.lastTickSummary;

  return (
    <AppShell
      items={items}
      name={profile.displayName}
      roleLabel={`${ctx.classroom.name} · Student`}
      subtitle={ctx.classroom.name}
      title="Student Workspace"
      crumb={`${profile.displayName.split(" ")[0]}'s desk`}
      settingsHref="/student/settings"
      extraPills={
        <>
          <span className="rounded-full bg-[#E8F8F0] px-3 py-1.5 text-sm font-semibold text-[#1F9A63]">
            {formatMoney(wealth)} portfolio
          </span>
          <span className="rounded-full bg-[#F3F5F4] px-3 py-1.5 text-sm font-semibold text-navy">
            Session {ctx.classroom.marketDay}
          </span>
        </>
      }
    >
      {children}
      {showRecap ? <EndOfDayModal summary={ctx.wallet.lastTickSummary!} /> : null}
    </AppShell>
  );
}
