import { AppNav } from "@/components/app-nav";
import { getSessionProfile } from "@/lib/auth";
import { redirect } from "next/navigation";

const items = [
  { href: "/teacher/summary", label: "Summary", emoji: "🏠" },
  { href: "/teacher/tokens", label: "Tokens", emoji: "⭐" },
  { href: "/teacher/market", label: "Market day", emoji: "📰" },
  { href: "/teacher/requests", label: "Requests", emoji: "📬" },
  { href: "/teacher/rewards", label: "Rewards", emoji: "🎁" },
];

export default async function TeacherLayout({ children }: LayoutProps<"/teacher">) {
  const profile = await getSessionProfile();
  if (!profile) redirect("/login");
  if (profile.role !== "teacher") redirect("/student/portfolio");

  return (
    <div className="mx-auto flex min-h-screen max-w-6xl flex-col gap-6 px-4 py-6 lg:flex-row">
      <AppNav items={items} name={profile.displayName} roleLabel="Teacher dashboard" />
      <div className="min-w-0 flex-1 pb-10">{children}</div>
    </div>
  );
}
