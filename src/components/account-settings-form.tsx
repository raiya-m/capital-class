"use client";

import { useActionState } from "react";
import { updateAccount } from "@/lib/actions";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Input, Label } from "./ui/input";

async function action(_prev: string | null, formData: FormData) {
  const error = await updateAccount(formData);
  return typeof error === "string" ? error : "Saved.";
}

export function AccountSettingsForm({
  displayName,
  email,
}: {
  displayName: string;
  email: string;
}) {
  const [message, formAction, pending] = useActionState(action, null);
  return (
    <Card>
      <h2 className="text-xl font-semibold text-navy">Account</h2>
      <p className="mt-1 text-base text-muted">Update how your name appears, or set a new password.</p>
      <form action={formAction} className="mt-5 space-y-3">
        <div>
          <Label htmlFor="displayName">Display name</Label>
          <Input id="displayName" name="displayName" required defaultValue={displayName} />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" required defaultValue={email} />
        </div>
        <div>
          <Label htmlFor="password">New password</Label>
          <Input id="password" name="password" type="password" placeholder="Leave blank to keep the current password" />
        </div>
        {message ? (
          <p className={`text-sm font-semibold ${message === "Saved." ? "text-[#1F9A63]" : "text-coral"}`}>{message}</p>
        ) : null}
        <Button type="submit" disabled={pending}>
          {pending ? "Saving..." : "Save changes"}
        </Button>
      </form>
    </Card>
  );
}
