import { Flight, FlightStatus } from '../lib/types'
import { calculateDelayCategory, getTodayString, getNowInColombia } from '../lib/utils'
import { writeDBFile, readDBFile } from '../db'

export async function processFlightInitial() {
  const todayStr = getTodayString()
  const initialFile = `flight_statuses_${todayStr}`

  // Leer el archivo de estados de vuelo del día
  let updatedFlights: Flight[]
  try {
    updatedFlights = await readDBFile(initialFile)
  } catch (err) {
    console.error(`❌ No se encontró el archivo ${initialFile} en /db`, {
      date: todayStr,
      count: 0,
      error: err instanceof Error ? err.message : err,
    })
    return
  }

  // Validar que el archivo contiene datos válidos
  if (!updatedFlights || !Array.isArray(updatedFlights) || updatedFlights.length === 0) {
    console.error(`❌ El archivo ${initialFile} está vacío o no contiene vuelos válidos`, {
      date: todayStr,
      count: 0,
    })
    return
  }

  // Procesar los vuelos
  const newStatuses: FlightStatus[] = updatedFlights.map((flight, idx) => {
    const delayInfo =
      flight.status === 'Departed' || flight.status === 'Landed' || flight.status === 'Delayed'
        ? calculateDelayCategory(flight.etd!, flight.atd!)
        : { delayMinutes: null, delayCategory: null }

    return {
      id: idx + 1,
      ...flight,
      delayMinutes: delayInfo.delayMinutes,
      delayCategory: delayInfo.delayCategory,
      lastUpdated: getNowInColombia().toISOString(),
    }
  })

  // Guardar el resultado procesado
  const processFileName = `process_flight_${todayStr}`
  try {
    await writeDBFile(processFileName, newStatuses)
    console.info(`✅ Processed ${newStatuses.length} flights for ${todayStr}`, {
      date: todayStr,
      count: newStatuses.length,
      fileName: processFileName,
    })
  } catch (error) {
    console.error('❌ Failed to update flight statuses', {
      error: error instanceof Error ? error.message : error,
    })
  }
}
