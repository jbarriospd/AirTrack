'use server'

import { readDBFile } from '@/db'
import { FlightStatus } from '@/lib/types'

export async function getFlights(date: string) {
  try {
    const flights = await readDBFile<FlightStatus[]>(`process_flight_${date}`)

    // Filter out flights with status 'Returned' or 'Confirmed'
    const filteredFlights = flights.filter(
      (flight) =>
        flight.status !== 'Returned' &&
        (flight.status === 'Cancelled' || flight.delayCategory !== null)
    )

    return { success: true, data: filteredFlights }
  } catch (error) {
    console.error('Error loading flights:', error)
    return { success: false, data: [], error: 'No data found' }
  }
}
