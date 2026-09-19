"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Mic, Square, Volume2 } from "lucide-react";
import { speakText, stopSpeaking } from "@/lib/speak";

type Turn = { role: "you" | "coach"; text: string };

type Rec = {
  lang: string;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  onresult: ((ev: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
};

function getRecognizer(): Rec | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as { webkitSpeechRecognition?: new () => Rec; SpeechRecognition?: new () => Rec };
  const Ctor = w.SpeechRecognition || w.webkitSpeechRecognition;
  return Ctor ? new Ctor() : null;
}

export function VoiceCoach({ context, studioVoice }: { context: string; studioVoice?: boolean }) {
  const [log, setLog] = useState<Turn[]>([
    {
      role: "coach",
      text: "Tap Talk and ask about the tape. I speak the answer with Deepgram when a key is set.",
    },
  ]);
  const [text, setText] = useState("");
  const [listening, setListening] = useState(false);
  const [busy, setBusy] = useState(false);
  const recRef = useRef<Rec | null>(null);
  const mediaRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    return () => {
      recRef.current?.stop();
      mediaRef.current?.state === "recording" && mediaRef.current.stop();
      stopSpeaking();
    };
  }, []);

  async function ask(message: string) {
    const q = message.trim();
    if (!q || busy) return;
    setBusy(true);
    setLog((cur) => [...cur, { role: "you", text: q }]);
    setText("");
    try {
      const res = await fetch("/api/coach/reply", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ message: q, context }),
      });
      const json = (await res.json()) as { text?: string };
      const reply = json.text || "Let's look at the trend chart and the latest incident together.";
      setLog((cur) => [...cur, { role: "coach", text: reply }]);
      await speakText(reply);
    } finally {
      setBusy(false);
    }
  }

  async function finishDeepgram(blob: Blob) {
    const res = await fetch("/api/voice/stt", {
      method: "POST",
      headers: { "content-type": blob.type || "audio/webm" },
      body: blob,
    });
    const json = (await res.json()) as { transcript?: string };
    if (json.transcript) void ask(json.transcript);
  }

  async function toggleMic() {
    if (listening) {
      recRef.current?.stop();
      if (mediaRef.current?.state === "recording") mediaRef.current.stop();
      setListening(false);
      return;
    }

    if (studioVoice && navigator.mediaDevices?.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const recorder = new MediaRecorder(stream);
        chunksRef.current = [];
        recorder.ondataavailable = (ev) => {
          if (ev.data.size) chunksRef.current.push(ev.data);
        };
        recorder.onstop = () => {
          stream.getTracks().forEach((t) => t.stop());
          setListening(false);
          const blob = new Blob(chunksRef.current, { type: recorder.mimeType || "audio/webm" });
          void finishDeepgram(blob);
        };
        mediaRef.current = recorder;
        setListening(true);
        recorder.start();
        return;
      } catch {
        /* browser speech fallback */
      }
    }

    const rec = getRecognizer();
    if (!rec) {
      void ask("How should I read today's market news?");
      return;
    }
    rec.lang = "en-US";
    rec.interimResults = false;
    rec.onresult = (event) => {
      const said = event.results[0]?.[0]?.transcript;
      if (said) void ask(said);
    };
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    recRef.current = rec;
    setListening(true);
    rec.start();
  }

  return (
    <div className="space-y-4">
      <p
        className={`rounded-2xl px-4 py-3 text-base ${studioVoice ? "bg-[#F3FBF7] text-navy" : "bg-[#F7F9F8] text-muted"}`}
      >
        {studioVoice
          ? "Deepgram voice is on. Talk or type — replies play out loud."
          : "Voice works now with the browser speaker. Add DEEPGRAM_API_KEY in .env.local for Deepgram speech."}
      </p>
      <div className="space-y-3">
        {log.map((m, i) => (
          <div
            key={i}
            className={`max-w-[85%] rounded-2xl px-4 py-3 text-base font-medium ${
              m.role === "coach" ? "bg-navy text-white" : "ml-auto bg-mint text-white"
            }`}
          >
            {m.text}
          </div>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && void ask(text)}
          placeholder="Ask about news, trends, or your tokens"
          disabled={busy}
        />
        <Button type="button" onClick={() => void ask(text)} disabled={busy}>
          Send
        </Button>
        <Button type="button" tone={listening ? "danger" : "sky"} onClick={() => void toggleMic()} disabled={busy}>
          {listening ? <Square className="size-4" /> : <Mic className="size-4" />}
          {listening ? "Stop" : "Talk"}
        </Button>
        <Button
          type="button"
          tone="ghost"
          disabled={busy}
          onClick={() => {
            const last = [...log].reverse().find((t) => t.role === "coach");
            if (last) void speakText(last.text);
          }}
        >
          <Volume2 className="size-4" />
          Replay
        </Button>
      </div>
    </div>
  );
}
