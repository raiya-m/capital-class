import { AppShell } from "@/components/app-nav";
import { getSessionProfile, homeFor } from "@/lib/auth";
import { teacherContext } from "@/lib/queries";
import { redirect } from "next/navigation";
import Link from "next/link";

const items = [
  { href: "/teacher/summary", label: "Dashboard", icon: "dashboard" as const },
  { href: "/teacher/tokens", label: "Award Tokens", icon: "coins" as const },
  { href: "/teacher/market", label: "Market and News", icon: "news" as const },
  { href: "/teacher/roster", label: "Students", icon: "users" as const },
  { href: "/teacher/requests", label: "Reward Requests", icon: "inbox" as const },
  { href: "/teacher/rewards", label: "Reward Store", icon: "gift" as const },
];

export default async function TeacherLayout({ children }: LayoutProps<"/teacher">) {
  const profile = await getSessionProfile();
  if (!profile) redirect("/login");
  if (profile.role !== "teacher") redirect(homeFor(profile.role));
  const { classroom, stats, pending } = await teacherContext();

  return (
    <AppShell
      items={items}
      name={profile.displayName}
      roleLabel={classroom.name}
      subtitle={classroom.name}
      title="Classroom Command Center"
      crumb={classroom.name}
      circulating={stats.classValue}
      settingsHref="/teacher/settings"
      extraPills={
        pending.length ? (
          <Link
            href="/teacher/requests"
            className="rounded-full bg-[#FFF4E5] px-3 py-1.5 text-sm font-semibold text-[#D97706]"
          >
            {pending.length} pending rewards
          </Link>
        ) : (
          <span className="rounded-full bg-[#F3F5F4] px-3 py-1.5 text-sm font-semibold text-navy">
            Session {classroom.marketDay}
          </span>
        )
      }
    >
      {children}
    </AppShell>
  );
}
