import { readDBFile } from '../db'
import { writeFlightDataToSheet } from '../services/googleSheets'
import { getTodayString } from './utils'
import { FlightStatus } from './types'

export async function writeFlightsToGoogleSheet(
  spreadsheetId: string,
  date?: string,
  sheetName?: string
) {
  try {
    const dateStr = date || getTodayString()
    const fileName = `process_flight_${dateStr}`

    let flights: FlightStatus[]
    try {
      flights = await readDBFile(fileName)
    } catch (error) {
      console.error(`❌ No se encontró el archivo ${fileName}`, {
        error: error instanceof Error ? error.message : error,
      })
      return
    }

    if (!flights || flights.length === 0) {
      console.error('❌ No hay datos de vuelos para escribir', {
        count: 0,
      })
      return
    }

    await writeFlightDataToSheet(spreadsheetId, flights, sheetName)

    console.info(`✅ Successfully wrote ${flights.length} flights to Google Sheet`, {
      count: flights.length,
      sheetName: sheetName || 'processData',
    })
  } catch (error) {
    console.error('❌ Failed to write flights to Google Sheet', {
      error: error instanceof Error ? error.message : error,
    })
  }
}
