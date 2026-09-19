import { dbStats } from "@/lib/db";
import { readStore } from "@/lib/store";
import { NextResponse } from "next/server";

export async function GET() {
  await readStore();
  const stats = await dbStats();
  return NextResponse.json({
    ...stats,
    voice: Boolean(process.env.DEEPGRAM_API_KEY),
    openai: Boolean(process.env.OPENAI_API_KEY),
  });
}
