import { NextResponse } from "next/server";
import { processFlightInitial } from "@/app/actions/processFlightStatuses";

export async function GET() {
  const result = await processFlightInitial();
  return NextResponse.json(result);
}
