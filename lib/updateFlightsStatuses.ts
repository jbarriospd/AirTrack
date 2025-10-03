import { FlightStatus } from "./types";
import { readDBFile, writeDBFile } from "../db";
import { fetchFlightStatus } from "./fetchData";
import { transformFlightStatus, getTodayString, extractFlightNumber, calculateDelayCategory } from "./utils";

export async function updateFlightsStatuses() {
  const todayStr = getTodayString(); 
  const currentFile = `process_flight_${todayStr}`;
  let currentData: FlightStatus[] = [];

  try {
    currentData = await readDBFile(currentFile);
  } catch (e) {
    console.error("❌ No existing processed flight data found", {
      file: currentFile,
      error: e instanceof Error ? e.message : e,
    });
    return;
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
    console.info("✅ No flights need updating at this time", {
      date: todayStr,
      updated: 0,
      total: currentData.length,
    });
    return;
  }

  console.info(`🔄 Updating ${flightsToUpdate.length} flights...`);

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

    console.info(`✅ ${successMessage}`, {
      date: todayStr,
      updated: successfulUpdates,
      failed: failedFlights.length,
      total: finalData.length,
      failedFlights: failedFlights.length > 0 ? failedFlights : undefined,
    });
  } catch (error) {
    console.error("❌ Failed to save updated flight statuses", {
      error: error instanceof Error ? error.message : error,
    });
  }
}