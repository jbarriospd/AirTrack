'use server'

import { readDBFile } from '@/db'
import { FlightStatus } from '@/lib/types'

export async function getFlights(date: string) {
  try {
    const flights = await readDBFile<FlightStatus[]>(`process_flight_${date}`)

    if (!flights || flights.length === 0) {
      return { success: true, data: [], error: `No flight data available for ${date}` }
    }

    const filteredFlights = flights.filter(
      (flight) =>
        flight.status !== 'Returned' &&
        (flight.status === 'Cancelled' || flight.delayCategory !== null)
    )

    return { success: true, data: filteredFlights }
  } catch (error) {
    console.error('Error loading flights:', error)
    return { success: false, data: [], error: 'Failed to load flight data' }
  }
}
