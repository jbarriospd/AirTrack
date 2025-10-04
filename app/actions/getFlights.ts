'use server'

import { readDBFile } from '@/db'
import { FlightStatus } from '@/lib/types'

export async function getFlights(date: string) {
  try {
    const flights = await readDBFile<FlightStatus[]>(`process_flight_${date}`)
    return { success: true, data: flights }
  } catch (error) {
    console.error('Error loading flights:', error)
    return { success: false, data: [], error: 'No data found' }
  }
}
