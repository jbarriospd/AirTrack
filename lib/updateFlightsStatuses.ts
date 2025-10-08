import { FlightStatus } from './types'
import { readDBFile, writeDBFile } from '../db'
import { fetchFlightStatus } from './fetchData'
import {
  transformFlightStatus,
  getTodayString,
  extractFlightNumber,
  calculateDelayCategory,
  getNowInColombia,
  getDateInColombia,
} from './utils'

export async function updateFlightsStatuses(targetDate?: string) {
  const currentDate = getNowInColombia()

  let dateToProcess: string
  if (targetDate) {
    dateToProcess = targetDate
  } else {
    const currentHour = currentDate.getHours()
    if (currentHour < 6) {
      const yesterday = new Date(currentDate)
      yesterday.setDate(yesterday.getDate() - 1)
      dateToProcess = yesterday.toISOString().split('T')[0]
    } else {
      dateToProcess = getTodayString()
    }
  }

  const currentFile = `process_flight_${dateToProcess}`
  let currentData: FlightStatus[] = []

  try {
    currentData = await readDBFile(currentFile)
  } catch (e) {
    console.error('❌ No existing processed flight data found', {
      file: currentFile,
      error: e instanceof Error ? e.message : e,
    })
    return
  }

  const now = getNowInColombia()
  const oneHourAgo = new Date(now.getTime() - 1 * 60 * 60 * 1000)

  const flightsToUpdate = currentData.filter((f) => {
    if (f.status === 'Landed' || f.status === 'Departed') return false
    if (!f.etd || !f.date) return false
    const etdDate = getDateInColombia(f.date, `${f.etd}:00`)
    if (isNaN(etdDate.getTime())) return false
    return etdDate >= oneHourAgo && etdDate <= now
  })

  if (flightsToUpdate.length === 0) {
    console.info('✅ No flights need updating at this time', {
      date: dateToProcess,
      updated: 0,
      total: currentData.length,
    })
    return
  }

  console.info(`🔄 Updating ${flightsToUpdate.length} flights...`)

  const flightResults = await Promise.allSettled(
    flightsToUpdate.map(async (flight) => {
      try {
        const apiResponse = await fetchFlightStatus(
          extractFlightNumber(flight.flightNumber),
          flight.date
        )

        let refreshed
        if (apiResponse && Array.isArray(apiResponse) && apiResponse.length > 0) {
          refreshed = transformFlightStatus(apiResponse[0])
        } else {
          console.warn(
            `No valid API response for flight ${flight.flightNumber}, keeping current data`
          )
          return {
            ...flight,
            lastUpdated: getNowInColombia().toISOString(),
          }
        }

        let delayMinutes = flight.delayMinutes
        let delayCategory = flight.delayCategory

        if (
          refreshed.status === 'Departed' ||
          refreshed.status === 'Landed' ||
          refreshed.status === 'Delayed'
        ) {
          console.info(
            `Calculating delay for flight ${flight.flightNumber} with ETD: ${refreshed.etd} and ATD: ${refreshed.atd}`
          )
          const delayInfo = calculateDelayCategory(refreshed.etd, refreshed.atd)
          delayMinutes = delayInfo.delayMinutes
          delayCategory = delayInfo.delayCategory
        }

        return {
          ...flight,
          ...refreshed,
          delayMinutes,
          delayCategory,
          lastUpdated: getNowInColombia().toISOString(),
        }
      } catch (error) {
        console.error(`Failed to update flight ${flight.flightNumber}:`, error)

        return {
          ...flight,
          lastUpdated: getNowInColombia().toISOString(),
        }
      }
    })
  )

  const updatedFlights: FlightStatus[] = []
  const failedFlights: string[] = []

  flightResults.forEach((result, index) => {
    const flight = flightsToUpdate[index]
    if (result.status === 'fulfilled') {
      updatedFlights.push(result.value)
    } else {
      console.error(`Promise rejected for flight ${flight.flightNumber}:`, result.reason)
      failedFlights.push(flight.flightNumber)
      updatedFlights.push({
        ...flight,
        lastUpdated: getNowInColombia().toISOString(),
      })
    }
  })

  const updatedFlightsMap = new Map()
  updatedFlights.forEach((flight) => {
    updatedFlightsMap.set(flight.id, flight)
  })

  const finalData = currentData.map((flight) => {
    return updatedFlightsMap.get(flight.id) || flight
  })

  try {
    await writeDBFile(currentFile, finalData)

    const successfulUpdates = updatedFlights.length - failedFlights.length
    const successMessage =
      failedFlights.length > 0
        ? `Updated ${successfulUpdates} flights, ${failedFlights.length} failed`
        : `Updated ${updatedFlights.length} flights`

    console.info(`✅ ${successMessage}`, {
      date: dateToProcess,
      updated: successfulUpdates,
      failed: failedFlights.length,
      total: finalData.length,
      failedFlights: failedFlights.length > 0 ? failedFlights : undefined,
    })
  } catch (error) {
    console.error('❌ Failed to save updated flight statuses', {
      error: error instanceof Error ? error.message : error,
    })
  }
}
