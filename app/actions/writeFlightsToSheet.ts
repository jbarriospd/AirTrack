"use server";

import { readDBFile } from "@/db";
import { writeFlightDataToSheet } from "@/services/googleSheets";
import { getTodayString, createResponse } from "@/lib/utils";
import { Flight } from "@/lib/types";

export async function writeFlightsToGoogleSheet(
  spreadsheetId: string,
  date?: string,
  sheetName?: string
) {
  try {
    const dateStr = date || getTodayString();
    const fileName = `process_flight_${dateStr}`;
    
    // Leer los datos de vuelos del archivo JSON
    let flights: Flight[];
    try {
      flights = await readDBFile(fileName);
    } catch (error) {
      return createResponse(false, `No se encontró el archivo ${fileName}`, {
        error: error instanceof Error ? error.message : error,
      });
    }

    if (!flights || flights.length === 0) {
      return createResponse(false, "No hay datos de vuelos para escribir", {
        count: 0,
      });
    }

    // Escribir los datos a Google Sheets
    await writeFlightDataToSheet(spreadsheetId, flights, sheetName);

    return createResponse(true, `Successfully wrote ${flights.length} flights to Google Sheet`, {
      count: flights.length,
      sheetName: sheetName || 'processData',
    });

  } catch (error) {
    return createResponse(false, "Failed to write flights to Google Sheet", {
      error: error instanceof Error ? error.message : error,
    });
  }
}
