"use client";

import { useState } from "react";
import { Volume2, Square } from "lucide-react";
import { speakText, stopSpeaking } from "@/lib/speak";
import { Button } from "./ui/button";

export function SpeakButton({
  text,
  label = "Hear it",
  tone = "ghost",
}: {
  text: string;
  label?: string;
  tone?: "ghost" | "sky" | "primary";
}) {
  const [playing, setPlaying] = useState(false);

  async function toggle() {
    if (playing) {
      stopSpeaking();
      setPlaying(false);
      return;
    }
    setPlaying(true);
    try {
      await speakText(text);
    } finally {
      setPlaying(false);
    }
  }

  return (
    <Button type="button" tone={tone} className="h-10 px-4 text-sm" onClick={() => void toggle()} disabled={!text.trim()}>
      {playing ? <Square className="size-3.5" /> : <Volume2 className="size-3.5" />}
      {playing ? "Stop" : label}
    </Button>
  );
}
