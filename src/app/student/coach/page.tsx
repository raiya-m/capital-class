import { Card } from "@/components/ui/card";
import { VoiceCoach } from "@/components/voice-coach";

export default async function CoachPage() {
  const deepgram = Boolean(process.env.DEEPGRAM_API_KEY);
  const openai = Boolean(process.env.OPENAI_API_KEY);

  return (
    <div className="max-w-2xl space-y-4">
      <p className="text-base text-muted">
        CapitalClass Coach talks like your class teacher. Ask why a price moved, what the news means, or what you own.
        For Talk, use Chrome or Safari at http://127.0.0.1:3000 and click Allow on the microphone prompt. Cursor&apos;s
        in-app window usually cannot hear you even if Cursor has Mac mic access. You can always type instead.
      </p>
      <Card>
        <VoiceCoach deepgram={deepgram} openai={openai} />
      </Card>
    </div>
  );
}
