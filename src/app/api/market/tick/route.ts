import { tickMarket } from "@/lib/actions";

export async function POST() {
  const sectors = await tickMarket();
  return Response.json(sectors);
}
