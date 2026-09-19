import { Card } from "@/components/ui/card";
import { VoiceCoach } from "@/components/voice-coach";
import { studentContext } from "@/lib/queries";

export default async function CoachPage() {
  const { profile, rank, wallet, invested, news, holdings, data, stats } = await studentContext();
  const top = news[0]?.headline ?? "No incident yet";
  const names = holdings
    .map((h) => data.sectors.find((s) => s.slug === h.sectorSlug)?.ticker)
    .filter(Boolean)
    .join(", ");
  const context = `${profile.displayName} is rank ${rank} of ${stats.students.length}. Cash ${Math.round(wallet.investmentCash)} dollars, holdings ${Math.round(invested)} dollars in ${names || "cash only"}. Latest incident: ${top}.`;
  const studioVoice = Boolean(process.env.DEEPGRAM_API_KEY);

  return (
    <div className="max-w-2xl space-y-4">
      <p className="text-base text-muted">
        CapitalClass Coach talks about your tape and news incidents. This is a classroom helper, not real financial
        advice.
      </p>
      <Card>
        <VoiceCoach context={context} studioVoice={studioVoice} />
      </Card>
    </div>
  );
}
