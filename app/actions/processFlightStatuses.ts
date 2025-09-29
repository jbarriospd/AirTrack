"use server";

import { Flight, FlightStatus } from "@/lib/types";
import { calculateDelayCategory, extractFlightNumber, transformFlightStatus } from "@/lib/utils";
import { writeDBFile, readDBFile } from "@/db";
import { fetchFlightStatus } from "@/lib/fetchData";

const today = new Date();
const yyyy = today.getFullYear();
const mm = String(today.getMonth() + 1).padStart(2, "0");
const dd = String(today.getDate()).padStart(2, "0");

export async function processFlightInitial() {
  const initialFile = `flight_statuses_${yyyy}-${mm}-${dd}`;

  // Leer el archivo de estados de vuelo del día
  let updatedFlights: Flight[];
  try {
    updatedFlights = await readDBFile(initialFile);
  } catch (err) {
    return {
      success: false,
      message: `No se encontró el archivo ${initialFile} en /db`,
      date: `${yyyy}-${mm}-${dd}`,
      count: 0,
      error: err instanceof Error ? err.message : err,
    };
  }

  // Validar que el archivo contiene datos válidos
  if (!updatedFlights || !Array.isArray(updatedFlights) || updatedFlights.length === 0) {
    return {
      success: false,
      message: `El archivo ${initialFile} está vacío o no contiene vuelos válidos`,
      date: `${yyyy}-${mm}-${dd}`,
      count: 0,
    };
  }

  // Procesar los vuelos
  const newStatuses: FlightStatus[] = updatedFlights.map((flight, idx) => {
    const delayCategory = (flight.status === 'Departed' || flight.status === 'Landed' || flight.status === 'Delayed') 
      ? calculateDelayCategory(flight.etd!, flight.atd!)
      : null;

    return {
      id: idx + 1,
      ...flight,
      delayCategory,
      lastUpdated: new Date().toISOString(),
    };
  });

  // Guardar el resultado procesado
  const processFileName = `process_flight_${yyyy}-${mm}-${dd}`;
  try {
    await writeDBFile(processFileName, newStatuses);
    return {
      success: true,
      message: `Processed ${newStatuses.length} flights for ${yyyy}-${mm}-${dd}.`,
      date: `${yyyy}-${mm}-${dd}`,
      count: newStatuses.length,
      fileName: processFileName,
    };
  } catch (error) {
    return {
      success: false,
      message: "Failed to update flight statuses.",
      error: error instanceof Error ? error.message : error,
    };
  }
}

export async function processFlightExisting() {
  const currentFile = `process_flight_${yyyy}-${mm}-${dd}`;
  let currentData: FlightStatus[] = [];

  try {
    currentData = await readDBFile(currentFile);
  } catch (e) {
    return {
      success: false,
      message: "No existing processed flight data found.",
      error: e instanceof Error ? e.message : e,
    };
  }

  const now = new Date();
  const oneHourAgo = new Date(now.getTime() - 1 * 60 * 60 * 1000);

  // 1. Filtrar vuelos que necesitan ser actualizados (próximos a salir y que no han aterrizado)
  const flightsToUpdate = currentData.filter((f) => {
    if (f.status === "Landed" || f.status === "Departed") return false;
    if (!f.etd || !f.date) return false;
    const etdDate = new Date(`${f.date}T${f.etd}:00`);
    if (isNaN(etdDate.getTime())) return false;
    // Considerar vuelos en la próxima hora
    return etdDate >= oneHourAgo && etdDate <= now;
  });

  // Validación temprana: si no hay vuelos para actualizar
  if (flightsToUpdate.length === 0) {
    return {
      success: true,
      message: "No flights need updating at this time.",
      date: `${yyyy}-${mm}-${dd}`,
      updated: 0,
      total: currentData.length,
    };
  }

  // 2. Hacer fetch y procesar solo los vuelos filtrados usando Promise.allSettled
  const flightResults = await Promise.allSettled(
    flightsToUpdate.map(async (flight) => {
      try {
        const apiResponse = await fetchFlightStatus(
          extractFlightNumber(flight.flightNumber),
          flight.date
        );

        // Transformar la respuesta de la API al formato simplificado
        let refreshed;
        if (apiResponse && Array.isArray(apiResponse) && apiResponse.length > 0) {
          refreshed = transformFlightStatus(apiResponse[0]); // Tomar el primer vuelo de la respuesta
        } else {
          // Si no hay respuesta válida, mantener los datos actuales
          console.warn(`No valid API response for flight ${flight.flightNumber}, keeping current data`);
          return {
            ...flight,
            lastUpdated: new Date().toISOString(),
          };
        }

        let delayCategory = flight.delayCategory;

        // Si el nuevo estado es Departed o Landed, calcular el delay con los valores actualizados
        if (refreshed.status === "Departed" || refreshed.status === "Landed") {
          console.info(
            `Calculating delay for flight ${flight.flightNumber} with ETD: ${refreshed.etd} and ATD: ${refreshed.atd}`
          );
          delayCategory = calculateDelayCategory(refreshed.etd, refreshed.atd);
        }

        return {
          ...flight,
          ...refreshed, // Esto actualiza status, atd y etd con el formato transformado
          delayCategory,
          lastUpdated: new Date().toISOString(),
        };
      } catch (error) {
        console.error(`Failed to update flight ${flight.flightNumber}:`, error);
        // Retornar datos existentes con timestamp actualizado
        return {
          ...flight,
          lastUpdated: new Date().toISOString(),
        };
      }
    })
  );

  // 3. Procesar resultados y separar exitosos de fallidos
  const updatedFlights: FlightStatus[] = [];
  const failedFlights: string[] = [];

  flightResults.forEach((result, index) => {
    const flight = flightsToUpdate[index];
    if (result.status === 'fulfilled') {
      updatedFlights.push(result.value);
    } else {
      console.error(`Promise rejected for flight ${flight.flightNumber}:`, result.reason);
      failedFlights.push(flight.flightNumber);
      // Mantener datos existentes para vuelos fallidos
      updatedFlights.push({
        ...flight,
        lastUpdated: new Date().toISOString(),
      });
    }
  });

  // 4. Crear un mapa de vuelos actualizados por ID para facilitar la búsqueda
  const updatedFlightsMap = new Map();
  updatedFlights.forEach(flight => {
    updatedFlightsMap.set(flight.id, flight);
  });

  // 5. Combinar los datos actualizados con los existentes
  const finalData = currentData.map(flight => {
    return updatedFlightsMap.get(flight.id) || flight;
  });

  // 6. Guardar los datos actualizados
  try {
    await writeDBFile(currentFile, finalData);
    
    const successfulUpdates = updatedFlights.length - failedFlights.length;
    const successMessage = failedFlights.length > 0 
      ? `Updated ${successfulUpdates} flights, ${failedFlights.length} failed`
      : `Updated ${updatedFlights.length} flights`;

    return {
      success: true,
      message: successMessage,
      date: `${yyyy}-${mm}-${dd}`,
      updated: successfulUpdates,
      failed: failedFlights.length,
      total: finalData.length,
      failedFlights: failedFlights.length > 0 ? failedFlights : undefined,
    };
  } catch (error) {
    return {
      success: false,
      message: "Failed to save updated flight statuses.",
      error: error instanceof Error ? error.message : error,
    };
  }
}
