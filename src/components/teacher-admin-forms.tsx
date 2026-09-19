"use client";

import { useActionState } from "react";
import { createTeacher, removeTeacher } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";

async function createAction(_prev: string | null, formData: FormData) {
  const error = await createTeacher(formData);
  return typeof error === "string" ? error : "Teacher added.";
}

export function TeacherAdminForms({
  teachers,
}: {
  teachers: { id: string; displayName: string; email: string; classroomName: string; joinCode: string; students: number }[];
}) {
  const [message, formAction, pending] = useActionState(createAction, null);
  return (
    <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
      <Card>
        <h2 className="text-xl font-semibold text-navy">Add a teacher</h2>
        <p className="mt-1 text-base text-muted">Creates a classroom and a login the teacher can use right away.</p>
        <form action={formAction} className="mt-4 space-y-3">
          <div>
            <Label htmlFor="displayName">Name</Label>
            <Input id="displayName" name="displayName" required placeholder="Ms. Chen" />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" required placeholder="chen@school.edu" />
          </div>
          <div>
            <Label htmlFor="password">Temporary password</Label>
            <Input id="password" name="password" type="password" required />
          </div>
          <div>
            <Label htmlFor="classroomName">Classroom name</Label>
            <Input id="classroomName" name="classroomName" placeholder="Room 5A" />
          </div>
          {message ? (
            <p className={`text-sm font-semibold ${message === "Teacher added." ? "text-[#1F9A63]" : "text-coral"}`}>
              {message}
            </p>
          ) : null}
          <Button type="submit" disabled={pending}>
            {pending ? "Adding..." : "Add teacher"}
          </Button>
        </form>
      </Card>
      <Card>
        <h2 className="text-xl font-semibold text-navy">Teachers</h2>
        <ul className="mt-4 divide-y divide-black/5">
          {teachers.length === 0 ? <li className="py-3 text-muted">No teachers yet.</li> : null}
          {teachers.map((t) => (
            <li key={t.id} className="flex items-start justify-between gap-3 py-3">
              <div>
                <p className="text-base font-semibold text-navy">{t.displayName}</p>
                <p className="text-base text-muted">
                  {t.email} · {t.classroomName} · join {t.joinCode} · {t.students} students
                </p>
              </div>
              <form action={removeTeacher}>
                <input type="hidden" name="teacherId" value={t.id} />
                <Button type="submit" tone="danger" className="px-4 py-2 text-sm">
                  Remove
                </Button>
              </form>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
