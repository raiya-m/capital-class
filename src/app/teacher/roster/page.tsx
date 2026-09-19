import { teacherContext } from "@/lib/queries";
import { RosterForms } from "@/components/roster-forms";

export default async function TeacherRosterPage() {
  const { classroom, data } = await teacherContext();
  const students = data.profiles
    .filter((p) => p.classroomId === classroom.id && p.role === "student")
    .map((p) => {
      const wallet = data.wallets.find((w) => w.profileId === p.id);
      return {
        id: p.id,
        displayName: p.displayName,
        email: p.email,
        tokens: wallet?.unspentTokens ?? 0,
      };
    });
  return <RosterForms joinCode={classroom.joinCode} students={students} />;
}
