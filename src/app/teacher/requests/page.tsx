import { teacherContext } from "@/lib/queries";
import { formatMoney } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { RequestList } from "@/components/request-list";

export default async function TeacherRequestsPage() {
  const { data, classroom, stats } = await teacherContext();
  const rows = data.redemptions
    .filter((r) => r.classroomId === classroom.id)
    .map((r) => ({
      id: r.id,
      student: data.profiles.find((p) => p.id === r.studentId)?.displayName ?? "Student",
      status: r.status,
      tokenCost: data.rewards.find((rw) => rw.id === r.rewardId)?.tokenCost ?? 0,
      title: data.rewards.find((rw) => rw.id === r.rewardId)?.title ?? "Reward",
    }));

  return (
    <div className="grid gap-4 lg:grid-cols-[1.4fr_0.8fr]">
      <Card>
        <RequestList rows={rows} />
      </Card>
      <Card>
        <h2 className="text-xl font-semibold text-navy">Class rank</h2>
        <ol className="mt-4 space-y-3">
          {stats.students.map((row, i) => (
            <li key={row.student.id} className="flex items-center justify-between text-base">
              <span>
                <span className="mr-2 font-semibold text-mint">#{i + 1}</span>
                {row.student.displayName}
              </span>
              <span className="font-semibold">{formatMoney(row.value)}</span>
            </li>
          ))}
        </ol>
      </Card>
    </div>
  );
}
