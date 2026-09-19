import { AppNav } from "@/components/app-nav";
import { EndOfDayModal } from "@/components/end-of-day-modal";
import { getSessionProfile } from "@/lib/auth";
import { studentContext } from "@/lib/queries";
import { redirect } from "next/navigation";

const items = [
  { href: "/student/portfolio", label: "Portfolio", emoji: "📈" },
  { href: "/student/class", label: "Class", emoji: "🏆" },
  { href: "/student/tokens", label: "Tokens", emoji: "⭐" },
  { href: "/student/news", label: "News", emoji: "📰" },
  { href: "/student/market", label: "Market", emoji: "🛒" },
  { href: "/student/powerups", label: "Power-ups", emoji: "⚡" },
  { href: "/student/coach", label: "Coach", emoji: "🎙️" },
];

export default async function StudentLayout({ children }: LayoutProps<"/student">) {
  const profile = await getSessionProfile();
  if (!profile) redirect("/login");
  if (profile.role !== "student") redirect("/teacher/summary");
  const ctx = await studentContext();
  const showRecap =
    ctx.wallet.lastSeenMarketDay < ctx.classroom.marketDay && ctx.wallet.lastTickSummary;

  return (
    <div className="mx-auto flex min-h-screen max-w-6xl flex-col gap-6 px-4 py-6 lg:flex-row">
      <AppNav items={items} name={profile.displayName} roleLabel={ctx.classroom.name} />
      <div className="min-w-0 flex-1 pb-10">{children}</div>
      {showRecap ? <EndOfDayModal summary={ctx.wallet.lastTickSummary!} /> : null}
    </div>
  );
}
