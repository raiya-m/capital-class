"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

const TIPS = [
  "Diversify: try not to put every token into one sector.",
  "Read the news first. The question of the day often follows the biggest story.",
  "Keep some savings tokens if you want a sticker this week.",
  "A Safety Net is handy before a risky market day.",
  "Prices here are pretend. The skill is noticing cause and effect.",
];

export function CoachChat() {
  const [log, setLog] = useState<{ role: "you" | "coach"; text: string }[]>([
    { role: "coach", text: "Hi! Ask me how to think about today's news or your portfolio." },
  ]);
  const [text, setText] = useState("");

  function send() {
    const q = text.trim();
    if (!q) return;
    const reply = TIPS[Math.floor(Math.random() * TIPS.length)];
    setLog((cur) => [...cur, { role: "you", text: q }, { role: "coach", text: reply }]);
    setText("");
  }

  return (
    <div>
      <div className="space-y-3">
        {log.map((m, i) => (
          <div
            key={i}
            className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm font-medium ${
              m.role === "coach" ? "bg-navy text-white" : "ml-auto bg-gold text-navy"
            }`}
          >
            {m.text}
          </div>
        ))}
      </div>
      <div className="mt-4 flex gap-2">
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="How should I use my tokens?"
        />
        <Button type="button" onClick={send}>
          Send
        </Button>
      </div>
    </div>
  );
}
