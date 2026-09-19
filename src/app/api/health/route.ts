import { dbStats } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  const stats = await dbStats();
  return NextResponse.json({
    ...stats,
    voice: Boolean(process.env.DEEPGRAM_API_KEY),
  });
}
