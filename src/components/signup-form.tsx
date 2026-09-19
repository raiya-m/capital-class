"use client";

import { useActionState } from "react";
import { signupAction } from "@/lib/actions";
import { Button } from "./ui/button";
import { Input, Label } from "./ui/input";

async function action(_prev: string | null, formData: FormData) {
  const error = await signupAction(formData);
  return typeof error === "string" ? error : null;
}

export function SignupForm() {
  const [error, formAction, pending] = useActionState(action, null);
  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="role" value="student" />
      <div>
        <Label htmlFor="displayName">Display name</Label>
        <Input id="displayName" name="displayName" required placeholder="Alex Rivera" />
      </div>
      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" required />
      </div>
      <div>
        <Label htmlFor="password">Password</Label>
        <Input id="password" name="password" type="password" required />
      </div>
      <div>
        <Label htmlFor="joinCode">Class join code</Label>
        <Input id="joinCode" name="joinCode" required placeholder="CLASS4B" />
      </div>
      {error ? <p className="text-sm font-bold text-coral">{error}</p> : null}
      <Button className="w-full" disabled={pending} type="submit">
        {pending ? "Creating..." : "Join class"}
      </Button>
    </form>
  );
}
