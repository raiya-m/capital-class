"use client";

import { useActionState, useState } from "react";
import { signupAction } from "@/lib/actions";
import { Button } from "./ui/button";
import { Input, Label } from "./ui/input";

async function action(_prev: string | null, formData: FormData) {
  const error = await signupAction(formData);
  return typeof error === "string" ? error : null;
}

export function SignupForm() {
  const [role, setRole] = useState<"teacher" | "student">("student");
  const [error, formAction, pending] = useActionState(action, null);
  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="role" value={role} />
      <div className="grid grid-cols-2 gap-2">
        <Button type="button" tone={role === "student" ? "gold" : "ghost"} onClick={() => setRole("student")}>
          Student
        </Button>
        <Button type="button" tone={role === "teacher" ? "gold" : "ghost"} onClick={() => setRole("teacher")}>
          Teacher
        </Button>
      </div>
      <div>
        <Label>Display name</Label>
        <Input name="displayName" required placeholder="Alex Rivera" />
      </div>
      <div>
        <Label>Email</Label>
        <Input name="email" type="email" required />
      </div>
      <div>
        <Label>Password</Label>
        <Input name="password" type="password" required />
      </div>
      {role === "student" ? (
        <div>
          <Label>Class join code</Label>
          <Input name="joinCode" required placeholder="CLASS4B" />
        </div>
      ) : (
        <div>
          <Label>Classroom name</Label>
          <Input name="classroomName" placeholder="Room 4B" />
        </div>
      )}
      {error ? <p className="text-sm font-bold text-coral">{error}</p> : null}
      <Button className="w-full" disabled={pending} type="submit">
        {pending ? "Creating..." : "Create account"}
      </Button>
    </form>
  );
}
