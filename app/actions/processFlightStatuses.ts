"use server";

import { FlightStatus } from "@/lib/types";
import { calculateDelayCategory, extractFlightNumber, transformFlightStatus } from "@/lib/utils";
import { fetchFlightStatus } from "@/lib/fetchData";
import { 
  getFlightStatusesByDate,
  getFlightsNeedingUpdate,
  upsertMultipleFlights,
  updateFlightById 
} from "@/lib/dal";
import type { NewFlightStatus } from "@/db/schema";

const today = new Date();
const yyyy = today.getFullYear();
const mm = String(today.getMonth() + 1).padStart(2, "0");
const dd = String(today.getDate()).padStart(2, "0");
const dateStr = `${yyyy}-${mm}-${dd}`;

export async function processFlightInitial(flights: FlightStatus[]) {
  // Validar que hay vuelos para procesar
  if (!flights || !Array.isArray(flights) || flights.length === 0) {
    return {
      success: false,
      message: "No se proporcionaron vuelos válidos para procesar",
      date: dateStr,
      count: 0,
    };
  }

  // Procesar los vuelos y calcular delay category
  const newStatuses: NewFlightStatus[] = flights.map((flight) => {
    const delayCategory = (flight.status === 'Departed' || flight.status === 'Landed' || flight.status === 'Delayed') 
      ? calculateDelayCategory(flight.etd!, flight.atd!)
      : null;

    return {
      flightNumber: flight.flightNumber,
      date: flight.date,
      from: flight.from,
      to: flight.to,
      status: flight.status,
      etd: flight.etd,
      atd: flight.atd,
      delayCategory,
      lastUpdated: new Date().toISOString(),
    };
  });

  // Guardar en la base de datos usando upsert
  try {
    await upsertMultipleFlights(newStatuses);
    return {
      success: true,
      message: `Processed ${newStatuses.length} flights for ${dateStr}.`,
      date: dateStr,
      count: newStatuses.length,
    };
  } catch (error) {
    return {
      success: false,
      message: "Failed to save flight statuses to database.",
      error: error instanceof Error ? error.message : error,
    };
  }
}

