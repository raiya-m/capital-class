# CapitalClass

HackMIT classroom economy: teachers award tokens. Students save, redeem rewards, or trade five live indexes. Kid-safe news incidents move the tape like a real market.

## Demo logins

| Role | Email | Password |
| --- | --- | --- |
| Teacher | teacher@capitalclass.local | teacher |
| Student | mia@capitalclass.local | student |

Join code **CLASS4B**. Teacher flow: award tokens, then publish a news incident on **Market and News**. Students allocate tokens, trade, and redeem rewards from savings.

## Voice (Deepgram)

Add this to `.env.local` and restart `npm run dev`:

```
DEEPGRAM_API_KEY=your_key
DEEPGRAM_TTS_MODEL=aura-2-asteria-en
```

Coach **Talk** transcribes with Deepgram, and every **Hear bulletin** button uses Deepgram Aura speech. Without a key, the browser speaker still reads.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

