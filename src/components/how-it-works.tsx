import { Card } from "./ui/card";

export function HowItWorks({ role }: { role: "teacher" | "student" | "admin" }) {
  const steps =
    role === "admin"
      ? [
          "Add teachers. Each one gets a classroom and a join code.",
          "Teachers add students, award tokens, and publish news that moves prices.",
          "Remove a teacher if they leave — their classroom roster is cleared with them.",
        ]
      : role === "teacher"
      ? [
          "Award tokens when students help, finish work, or make a smart choice.",
          "Publish a news incident. Some sectors rise. Others drop. That is the lesson.",
          "Approve reward requests that students pay for with savings tokens.",
        ]
      : [
          "Get tokens from your teacher. Split them: savings for rewards, market for trading.",
          "Read the bulletin. Buy the sector the story helps. Sell if your sector is dropping.",
          "A correct news guess adds cash. Savings tokens buy stickers, passes, and other class rewards.",
        ];

  return (
    <Card>
      <h2 className="text-xl font-semibold text-navy">How CapitalClass works</h2>
      <ol className="mt-4 space-y-3">
        {steps.map((step, i) => (
          <li key={step} className="flex gap-3 text-base text-ink">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[#1F9A63] text-sm font-bold text-white">
              {i + 1}
            </span>
            <span className="pt-0.5 leading-snug">{step}</span>
          </li>
        ))}
      </ol>
    </Card>
  );
}
