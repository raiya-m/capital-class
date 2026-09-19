"use client";

import { useActionState } from "react";
import { createStudent, removeStudent } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";

async function createAction(_prev: string | null, formData: FormData) {
  const error = await createStudent(formData);
  return typeof error === "string" ? error : "Student added.";
}

export function RosterForms({
  joinCode,
  students,
}: {
  joinCode: string;
  students: { id: string; displayName: string; email: string; tokens: number }[];
}) {
  const [message, formAction, pending] = useActionState(createAction, null);
  return (
    <div className="space-y-4">
      <Card>
        <h2 className="text-xl font-semibold text-navy">Class roster</h2>
        <p className="mt-1 text-base text-muted">
          Add a student here, or share join code <span className="font-semibold text-navy">{joinCode}</span> so they can
          sign up themselves.
        </p>
      </Card>
      <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <h2 className="text-xl font-semibold text-navy">Add a student</h2>
          <form action={formAction} className="mt-4 space-y-3">
            <div>
              <Label htmlFor="displayName">Name</Label>
              <Input id="displayName" name="displayName" required placeholder="Jordan Blake" />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" required placeholder="jordan@school.edu" />
            </div>
            <div>
              <Label htmlFor="password">Temporary password</Label>
              <Input id="password" name="password" type="password" required />
            </div>
            {message ? (
              <p className={`text-sm font-semibold ${message === "Student added." ? "text-[#1F9A63]" : "text-coral"}`}>
                {message}
              </p>
            ) : null}
            <Button type="submit" disabled={pending}>
              {pending ? "Adding..." : "Add student"}
            </Button>
          </form>
        </Card>
        <Card>
          <h2 className="text-xl font-semibold text-navy">Students</h2>
          <ul className="mt-4 divide-y divide-black/5">
            {students.length === 0 ? <li className="py-3 text-muted">No students yet.</li> : null}
            {students.map((s) => (
              <li key={s.id} className="flex items-start justify-between gap-3 py-3">
                <div>
                  <p className="text-base font-semibold text-navy">{s.displayName}</p>
                  <p className="text-base text-muted">
                    {s.email} · {s.tokens} unspent tokens
                  </p>
                </div>
                <form action={removeStudent}>
                  <input type="hidden" name="studentId" value={s.id} />
                  <Button type="submit" tone="danger" className="px-4 py-2 text-sm">
                    Remove
                  </Button>
                </form>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}
