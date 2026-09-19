import { answerQuestion } from "@/lib/actions";
import { studentContext } from "@/lib/queries";
import { formatPct } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function NewsPage() {
  const { news, question, myAnswer, classroom } = await studentContext();

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-4xl font-black text-navy">Classroom Gazette</h1>
        <p className="font-medium text-navy/70">Day {classroom.marketDay} · made-up stories that move our practice market.</p>
      </header>
      {news.map((item) => (
        <Card key={item.id}>
          <h2 className="text-2xl font-black text-navy">{item.headline}</h2>
          <p className="mt-2 font-medium text-navy/70">{item.body}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {Object.entries(item.impacts).map(([slug, value]) => (
              <Badge key={slug} className="capitalize">
                {slug} {formatPct(value ?? 0)}
              </Badge>
            ))}
          </div>
        </Card>
      ))}
      {question ? (
        <Card>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold">Question of the day</p>
          <h2 className="mt-2 text-2xl font-black text-navy">{question.prompt}</h2>
          <p className="text-sm font-medium text-navy/70">
            Correct answers add ${question.rewardCash} of investment cash. This is practice, not real money.
          </p>
          {myAnswer ? (
            <p className="mt-4 font-black text-navy">
              You picked {myAnswer.sector}. {myAnswer.correct ? "Nice read!" : "The news pointed somewhere else — you will get the next one."}
            </p>
          ) : (
            <form action={answerQuestion} className="mt-4 grid gap-2 sm:grid-cols-2">
              {question.options.map((opt) => (
                <Button key={opt.sector} name="sector" value={opt.sector} type="submit" tone="ghost">
                  {opt.label}
                </Button>
              ))}
            </form>
          )}
        </Card>
      ) : null}
    </div>
  );
}
