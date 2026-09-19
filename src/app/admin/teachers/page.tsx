import { adminContext } from "@/lib/queries";
import { TeacherAdminForms } from "@/components/teacher-admin-forms";

export default async function AdminTeachersPage() {
  const { teachers, data } = await adminContext();
  const rows = teachers.map((t) => {
    const classroom = data.classrooms.find((c) => c.id === t.classroomId);
    const students = data.profiles.filter((p) => p.classroomId === t.classroomId && p.role === "student").length;
    return {
      id: t.id,
      displayName: t.displayName,
      email: t.email,
      classroomName: classroom?.name ?? "No classroom",
      joinCode: classroom?.joinCode ?? "—",
      students,
    };
  });
  return <TeacherAdminForms teachers={rows} />;
}
