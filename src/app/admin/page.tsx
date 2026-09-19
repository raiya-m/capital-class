import { adminContext } from "@/lib/queries";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { HowItWorks } from "@/components/how-it-works";

export default async function AdminHomePage() {
  const { teachers, students, data } = await adminContext();
  return (
    <div className="space-y-5">
      <HowItWorks role="admin" />
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <p className="text-base text-muted">Teachers</p>
          <p className="mt-2 text-3xl font-semibold text-navy">{teachers.length}</p>
        </Card>
        <Card>
          <p className="text-base text-muted">Students</p>
          <p className="mt-2 text-3xl font-semibold text-navy">{students.length}</p>
        </Card>
        <Card>
          <p className="text-base text-muted">Classrooms</p>
          <p className="mt-2 text-3xl font-semibold text-navy">{data.classrooms.length}</p>
        </Card>
      </div>
      <Card>
        <h2 className="text-xl font-semibold text-navy">Role control</h2>
        <p className="mt-2 text-base text-muted">
          Administrators add and remove teachers. Each teacher runs one classroom and can add or remove their own
          students. Students trade only inside that classroom.
        </p>
        <Link href="/admin/teachers" className="mt-4 inline-block font-semibold text-[#1F9A63] underline">
          Manage teachers
        </Link>
      </Card>
    </div>
  );
}
