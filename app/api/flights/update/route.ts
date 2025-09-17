import { NextResponse } from "next/server";
import { processFlightExisting } from "@/app/actions/processFlightStatuses";

export async function GET() {
  const result = await processFlightExisting();
  return NextResponse.json(result);
}
