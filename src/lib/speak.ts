let current: HTMLAudioElement | null = null;

export function stopSpeaking() {
  current?.pause();
  current = null;
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
}

function browserSpeak(text: string) {
  if (!("speechSynthesis" in window)) return Promise.resolve();
  return new Promise<void>((resolve) => {
    const utter = new SpeechSynthesisUtterance(text);
    utter.rate = 0.95;
    utter.onend = () => resolve();
    utter.onerror = () => resolve();
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utter);
  });
}

export async function speakText(text: string): Promise<"deepgram" | "browser"> {
  const spoken = text.replace(/\s+/g, " ").trim().slice(0, 800);
  if (!spoken) return "browser";
  stopSpeaking();
  try {
    const res = await fetch("/api/voice/tts", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ text: spoken }),
    });
    if (res.ok) {
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      current = audio;
      await new Promise<void>((resolve, reject) => {
        audio.onended = () => {
          URL.revokeObjectURL(url);
          if (current === audio) current = null;
          resolve();
        };
        audio.onerror = () => {
          URL.revokeObjectURL(url);
          if (current === audio) current = null;
          reject(new Error("playback"));
        };
        void audio.play().catch(reject);
      });
      return "deepgram";
    }
  } catch {
    /* browser fallback */
  }
  await browserSpeak(spoken);
  return "browser";
}
