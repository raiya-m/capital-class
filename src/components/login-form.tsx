"use client";

import { useActionState } from "react";
import { loginAction } from "@/lib/actions";
import { Button } from "./ui/button";
import { Input, Label } from "./ui/input";

async function action(_prev: string | null, formData: FormData) {
  const error = await loginAction(formData);
  return typeof error === "string" ? error : null;
}

export function LoginForm() {
  const [error, formAction, pending] = useActionState(action, null);
  return (
    <form action={formAction} className="space-y-4">
      <div>
        <Label>Email</Label>
        <Input name="email" type="email" required defaultValue="teacher@capitalclass.local" />
      </div>
      <div>
        <Label>Password</Label>
        <Input name="password" type="password" required defaultValue="teacher" />
      </div>
      {error ? <p className="text-sm font-bold text-coral">{error}</p> : null}
      <Button className="w-full" disabled={pending} type="submit">
        {pending ? "Signing in..." : "Enter classroom"}
      </Button>
    </form>
  );
}
