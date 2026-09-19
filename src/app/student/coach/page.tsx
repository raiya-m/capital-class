import { Card } from "@/components/ui/card";
import { CoachChat } from "@/components/coach-chat";

export default function CoachPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-4xl font-black text-navy">Coach</h1>
        <p className="font-medium text-navy/70">
          Practice talking about your plan. This is a classroom helper, not real financial advice.
          Voice (ElevenLabs / Deepgram) can plug in later.
        </p>
      </header>
      <Card>
        <CoachChat />
      </Card>
    </div>
  );
}
