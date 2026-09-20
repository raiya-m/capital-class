"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Mic, Square, Volume2 } from "lucide-react";
import { speakText, stopSpeaking } from "@/lib/speak";

type Turn = { role: "you" | "coach"; text: string };
type Phase = "idle" | "listening" | "transcribing" | "thinking" | "speaking";

function pickMime() {
  if (typeof MediaRecorder === "undefined") return "";
  const options = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4"];
  return options.find((type) => MediaRecorder.isTypeSupported(type)) ?? "";
}

function inCursorBrowser() {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  return /Electron/i.test(ua) || /Cursor/i.test(ua);
}

function micErrorMessage(err: unknown) {
  const name = err && typeof err === "object" && "name" in err ? String((err as { name?: string }).name) : "";
  if (!window.isSecureContext) {
    return "Talk needs a secure page. Open http://127.0.0.1:3000 in Chrome or Safari — not an http IP on the LAN.";
  }
  if (name === "NotAllowedError" || name === "PermissionDeniedError") {
    if (inCursorBrowser()) {
      return "Cursor's in-app browser cannot use the mic, even if Cursor has Mac permission. Open this same site in Chrome or Safari, then click Allow when the browser asks.";
    }
    return "This browser blocked the microphone for CapitalClass. Click the padlock or Site settings, allow Microphone, then tap Talk again.";
  }
  if (name === "NotFoundError") {
    return "No microphone was found. Plug one in, then tap Talk again.";
  }
  if (name === "NotReadableError") {
    return "The microphone is busy in another app. Close that app, then tap Talk again.";
  }
  if (inCursorBrowser()) {
    return "Talk works in Chrome or Safari. Cursor's preview window often cannot record audio.";
  }
  return "I couldn't start the microphone. Type your question, or open the app in Chrome or Safari and allow the mic.";
}

export function VoiceCoach({
  deepgram,
  openai,
  initialQuestion,
}: {
  deepgram?: boolean;
  openai?: boolean;
  initialQuestion?: string;
}) {
  const [log, setLog] = useState<Turn[]>([
    {
      role: "coach",
      text: "Hi! Tap Talk, ask your question, then tap Stop. I'll listen, think like your class teacher, and read the answer out loud.",
    },
  ]);
  const [text, setText] = useState(initialQuestion ?? "");
  const [phase, setPhase] = useState<Phase>("idle");
  const [error, setError] = useState<string | null>(null);
  const mediaRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      if (mediaRef.current?.state === "recording") mediaRef.current.stop();
      stopSpeaking();
    };
  }, []);

  async function ask(message: string) {
    const q = message.trim();
    if (!q || phase === "thinking" || phase === "speaking") return;
    setError(null);
    setPhase("thinking");
    setLog((cur) => [...cur, { role: "you", text: q }]);
    setText("");
    try {
      const history = [...log, { role: "you" as const, text: q }].slice(-8);
      const res = await fetch("/api/coach/reply", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ message: q, history }),
      });
      const json = (await res.json()) as { text?: string; source?: string };
      const reply = json.text || "Let's look at the trend chart and the latest incident together.";
      setLog((cur) => [...cur, { role: "coach", text: reply }]);
      setPhase("speaking");
      await speakText(reply);
    } catch {
      setError("The coach could not answer just now. Try again.");
    } finally {
      setPhase("idle");
    }
  }

  async function finishDeepgram(blob: Blob) {
    setPhase("transcribing");
    try {
      const res = await fetch("/api/voice/stt", {
        method: "POST",
        headers: { "content-type": blob.type?.split(";")[0] || "audio/webm" },
        body: blob,
      });
      const json = (await res.json()) as { transcript?: string; error?: string };
      const transcript = json.transcript?.trim();
      if (!res.ok || !transcript) {
        setError("I didn't catch that. Tap Talk and try again, or type your question.");
        setPhase("idle");
        return;
      }
      await ask(transcript);
    } catch {
      setError("I couldn't hear that just now. You can type your question instead.");
      setPhase("idle");
    }
  }

  async function toggleMic() {
    if (phase === "listening") {
      if (mediaRef.current?.state === "recording") mediaRef.current.stop();
      return;
    }
    if (phase !== "idle") return;
    if (!deepgram) {
      setError("Talk needs a microphone. You can still type your question.");
      return;
    }
    if (!navigator.mediaDevices?.getUserMedia) {
      setError("This browser cannot record audio. Type your question instead.");
      return;
    }

    try {
      stopSpeaking();
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true },
      });
      streamRef.current = stream;
      if (typeof MediaRecorder === "undefined") {
        stream.getTracks().forEach((t) => t.stop());
        setError("This window cannot record audio. Open http://127.0.0.1:3000 in Chrome or Safari to use Talk.");
        setPhase("idle");
        return;
      }
      const mimeType = pickMime();
      const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (ev) => {
        if (ev.data.size) chunksRef.current.push(ev.data);
      };
      recorder.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || "audio/webm" });
        void finishDeepgram(blob);
      };
      mediaRef.current = recorder;
      setError(null);
      setPhase("listening");
      recorder.start();
    } catch (err) {
      setError(micErrorMessage(err));
      setPhase("idle");
    }
  }

  const busy = phase !== "idle";
  const status =
    phase === "listening"
      ? "I'm listening. Tap Stop when you finish talking."
      : phase === "transcribing"
        ? "Got it. I'm turning your words into text…"
        : phase === "thinking"
          ? "Let me look at your class news and prices…"
          : phase === "speaking"
            ? "Here's the answer out loud."
            : deepgram && openai
              ? "Ask me like you would ask your teacher. I can see today's news and your shares."
              : "You can still type a question. Talk works when voice is set up.";

  return (
    <div className="space-y-4">
      <p className={`rounded-2xl px-4 py-3 text-base ${deepgram && openai ? "bg-[#F3FBF7] text-navy" : "bg-[#F7F9F8] text-muted"}`}>
        {status}
      </p>
      {error ? <p className="text-base font-semibold text-coral">{error}</p> : null}
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
          placeholder="Why did agriculture drop today?"
          disabled={busy}
        />
        <Button type="button" onClick={() => void ask(text)} disabled={busy}>
          Send
        </Button>
        <Button type="button" tone={phase === "listening" ? "danger" : "sky"} onClick={() => void toggleMic()} disabled={busy && phase !== "listening"}>
          {phase === "listening" ? <Square className="size-4" /> : <Mic className="size-4" />}
          {phase === "listening" ? "Stop" : "Talk"}
        </Button>
        <Button
          type="button"
          tone="ghost"
          disabled={busy}
          onClick={() => {
            const last = [...log].reverse().find((t) => t.role === "coach");
            if (last) {
              setPhase("speaking");
              void speakText(last.text).finally(() => setPhase("idle"));
            }
          }}
        >
          <Volume2 className="size-4" />
          Replay
        </Button>
      </div>
    </div>
  );
}
