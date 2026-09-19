"use client";

import { useActionState, useState } from "react";
import { loginAction } from "@/lib/actions";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { GraduationCap, Shield, User } from "lucide-react";
import { cn } from "@/lib/utils";

async function action(_prev: string | null, formData: FormData) {
  const error = await loginAction(formData);
  return typeof error === "string" ? error : null;
}

const PRESETS = {
  admin: { email: "admin@capitalclass.local", password: "admin" },
  teacher: { email: "teacher@capitalclass.local", password: "teacher" },
  student: { email: "mia@capitalclass.local", password: "student" },
} as const;

export function LoginForm() {
  const [role, setRole] = useState<"admin" | "teacher" | "student">("teacher");
  const [error, formAction, pending] = useActionState(action, null);
  const email = PRESETS[role].email;
  const password = PRESETS[role].password;

  return (
    <form action={formAction} className="space-y-4">
      <div className="grid grid-cols-3 gap-2">
        <button
          type="button"
          onClick={() => setRole("admin")}
          className={cn(
            "rounded-2xl border p-3 text-left",
            role === "admin" ? "border-mint bg-[#F3FBF7]" : "border-black/8 bg-white",
          )}
        >
          <Shield className="size-5 text-navy" />
          <p className="mt-2 text-sm font-semibold text-navy">Admin</p>
        </button>
        <button
          type="button"
          onClick={() => setRole("teacher")}
          className={cn(
            "rounded-2xl border p-3 text-left",
            role === "teacher" ? "border-mint bg-[#F3FBF7]" : "border-black/8 bg-white",
          )}
        >
          <GraduationCap className="size-5 text-mint" />
          <p className="mt-2 text-sm font-semibold text-navy">Teacher</p>
        </button>
        <button
          type="button"
          onClick={() => setRole("student")}
          className={cn(
            "rounded-2xl border p-3 text-left",
            role === "student" ? "border-mint bg-[#F3FBF7]" : "border-black/8 bg-white",
          )}
        >
          <User className="size-5 text-navy/40" />
          <p className="mt-2 text-sm font-semibold text-navy">Student</p>
        </button>
      </div>
      <Input key={email} name="email" type="email" required defaultValue={email} />
      <Input key={password} name="password" type="password" required defaultValue={password} />
      {error ? <p className="text-sm font-semibold text-coral">{error}</p> : null}
      <Button className="w-full py-3" disabled={pending} type="submit">
        {pending ? "Launching..." : "Launch Classroom Dashboard"}
      </Button>
    </form>
  );
}
