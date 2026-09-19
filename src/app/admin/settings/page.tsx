import { getSessionProfile } from "@/lib/auth";
import { AccountSettingsForm } from "@/components/account-settings-form";
import { redirect } from "next/navigation";

export default async function AdminSettingsPage() {
  const profile = await getSessionProfile();
  if (!profile) redirect("/login");
  return <AccountSettingsForm displayName={profile.displayName} email={profile.email} />;
}
