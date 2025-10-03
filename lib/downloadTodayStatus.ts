import { getSheetValues } from "../services/googleSheets";
import { fetchFlightStatus } from "../lib/fetchData";
import { writeDBFile } from "../db/index";
import { SimplifiedFlightStatus } from "../lib/types";
import { transformFlightStatus, getTodayString } from "../lib/utils";

const dayToColumn: { [key: number]: string } = {
  0: 'G', // Domingo
  1: 'A', // Lunes
  2: 'B', // Martes
  3: 'C', // Miércoles
  4: 'D', // Jueves
  5: 'E', // Viernes
  6: 'F', // Sábado
};

/**
 * Procesa una lista de números de vuelo en lotes para obtener su estado.
 * @param flightNumbers - Array de números de vuelo.
 * @param flightDate - Fecha de los vuelos en formato 'YYYY-MM-DD'.
 * @param batchSize - Tamaño de cada lote.
 * @returns Una promesa que se resuelve en un array de respuestas de estado de vuelo.
 */
async function processFlightsInBatches(
  flightNumbers: string[],
  flightDate: string,
  batchSize: number = 5
): Promise<{ statuses: SimplifiedFlightStatus[], unresolvedFlights: string[] }> {
  const allStatuses: SimplifiedFlightStatus[] = [];
  const unresolvedFlights: string[] = [];

  for (let i = 0; i < flightNumbers.length; i += batchSize) {
    const batch = flightNumbers.slice(i, i + batchSize);
    const batchPromises = batch.map(flightNumber =>
      fetchFlightStatus(flightNumber, flightDate)
    );

    const batchResults = await Promise.allSettled(batchPromises);

    batchResults.forEach((result, index) => {
      const flightNumber = batch[index];
      if (result.status === 'fulfilled') {
        if (result.value && Array.isArray(result.value) && result.value.length > 0) {
          // Transforma cada vuelo al formato simplificado y añádelo
          const simplifiedFlights = result.value.map(transformFlightStatus);
          allStatuses.push(...simplifiedFlights);
        } else if (result.value === null) {
          console.warn(`Flight ${flightNumber} returned null after retries - skipping`);
          unresolvedFlights.push(flightNumber);
        } else {
          console.warn(`Flight ${flightNumber} returned unexpected data:`, result.value);
          unresolvedFlights.push(flightNumber);
        }
      } else if (result.status === 'rejected') {
        console.error(`Error fetching flight status for ${flightNumber}:`, result.reason);
        unresolvedFlights.push(flightNumber);
      }
    });
    // Opcional: Pausa entre lotes para no saturar la API
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  return { statuses: allStatuses, unresolvedFlights };
}

/**
 * Orquesta el proceso de obtener vuelos de Google Sheets,
 * consultar su estado y guardar los resultados.
 */
export async function downloadFlightsFromSheet() {
  try {
    const todayStr = getTodayString(); 
    const dayOfWeek = new Date().getDay();
    const column = dayToColumn[dayOfWeek];
    
    if (!column) {
      return console.info('❌ Invalid day of week', { 
        dayOfWeek,
        date: todayStr
      });
    }

    const range = `logDailyFlights!${column}2:${column}`; 
    const sheetValues = await getSheetValues(process.env.GOOGLE_SPREADSHEET_ID!, range);

    const flightNumbers = sheetValues.flat().filter(String) as string[];

    if (flightNumbers.length === 0) {
      return console.info('✅ No flights to process today', {
        count: 0,
        date: todayStr,
        column
      });
    }
    
    const { statuses: flightStatuses, unresolvedFlights } = await processFlightsInBatches(flightNumbers, todayStr);

    const fileName = `flight_statuses_${todayStr}`;
    await writeDBFile(fileName, flightStatuses);

    const successMessage = unresolvedFlights.length > 0 
      ? `Successfully processed ${flightStatuses.length} flights, ${unresolvedFlights.length} failed`
      : `Successfully processed ${flightStatuses.length} flights`;

    return console.info('✅ ' + successMessage, {
      processed: flightStatuses.length,
      failed: unresolvedFlights.length,
      unresolvedFlights: unresolvedFlights.length > 0 ? unresolvedFlights : undefined,
      date: todayStr,
      fileName
    });

  } catch (error) {
    return console.error('❌ Failed to update flight statuses from sheet', {
      error: error instanceof Error ? error.message : error,
    });
  }
}