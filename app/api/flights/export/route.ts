import { writeFlightsToGoogleSheet } from "@/app/actions/writeFlightsToSheet";

export async function GET() {
    const result = await writeFlightsToGoogleSheet(
      process.env.GOOGLE_SPREADSHEET_ID!,
    );
    
    return Response.json(result);
  }