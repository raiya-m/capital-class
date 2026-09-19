import { AppShell } from "@/components/app-nav";
import { getSessionProfile, homeFor } from "@/lib/auth";
import { adminContext } from "@/lib/queries";
import { redirect } from "next/navigation";

const items = [
  { href: "/admin", label: "Overview", icon: "shield" as const },
  { href: "/admin/teachers", label: "Teachers", icon: "users" as const },
];

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  const profile = await getSessionProfile();
  if (!profile) redirect("/login");
  if (profile.role !== "admin") redirect(homeFor(profile.role));
  const { teachers, students } = await adminContext();

  return (
    <AppShell
      items={items}
      name={profile.displayName}
      roleLabel="School administrator"
      subtitle="School access"
      title="School Console"
      crumb="Access"
      settingsHref="/admin/settings"
      extraPills={
        <span className="rounded-full bg-[#F3F5F4] px-3 py-1.5 text-sm font-semibold text-navy">
          {teachers.length} teachers · {students.length} students
        </span>
      }
    >
      {children}
    </AppShell>
  );
}
