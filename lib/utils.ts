import { FlightStatusResponse, SimplifiedFlightStatus } from './types'

import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getTodayString(): string {
  const today = new Date()
  return today.toLocaleDateString('sv-SE', {
    timeZone: 'America/Bogota',
  })
}

export function getNowInColombia(): Date {
  const now = new Date()
  const colombiaTimeStr = now.toLocaleString('en-US', {
    timeZone: 'America/Bogota',
  })
  return new Date(colombiaTimeStr)
}

export function getDateInColombia(dateStr: string, timeStr?: string): Date {
  const fullDateStr = timeStr ? `${dateStr}T${timeStr}` : `${dateStr}T12:00:00`
  const date = new Date(fullDateStr)
  const colombiaTimeStr = date.toLocaleString('en-US', {
    timeZone: 'America/Bogota',
  })
  return new Date(colombiaTimeStr)
}

export function getFlightStatusFileName(date?: string): string {
  const dateStr = date || getTodayString()
  return `flight_statuses_${dateStr}.json`
}

export function getProcessFlightFileName(date?: string): string {
  const dateStr = date || getTodayString()
  return `process_flight_${dateStr}`
}

export function extractFlightNumber(flightNumber: string): string {
  const match = flightNumber.match(/\d+/)
  return match ? match[0] : ''
}

export function transformFlightStatus(flight: FlightStatusResponse): SimplifiedFlightStatus {
  return {
    flightNumber: extractFlightNumber(flight.FlightNumber),
    date: flight.Date,
    from: flight.From,
    to: flight.To,
    status: flight.Status,
    etd: flight.EstimatedTimeDeparture,
    atd: flight.ConfirmedTimeDeparture,
  }
}

export function calculateDelayCategory(
  etd: string,
  atd: string
): { delayMinutes: number; delayCategory: string } {
  const [etdH, etdM] = etd.split(':').map(Number)
  const [atdH, atdM] = atd.split(':').map(Number)

  const etdInMinutes = etdH * 60 + etdM
  const atdInMinutes = atdH * 60 + atdM

  let delay = atdInMinutes - etdInMinutes

  // Handle cross-midnight flights: only when ETD is late at night and ATD is early morning next day
  if (delay < -720) {
    // ETD is late at night, ATD is early morning next day
    delay = atdInMinutes + 1440 - etdInMinutes
  }

  return {
    delayMinutes: delay,
    delayCategory: delay > 0 ? `+ ${delay}` : `Early ${Math.abs(delay)}`,
  }
}

export function shouldUpdateFlight(flight: {
  status: string
  etd?: string
  date?: string
}): boolean {
  if (flight.status === 'Landed' || flight.status === 'Departed') return false
  if (!flight.etd || !flight.date) return false

  const etdDate = getDateInColombia(flight.date, `${flight.etd}:00`)
  if (isNaN(etdDate.getTime())) return false

  const now = getNowInColombia()
  const oneHourAgo = new Date(now.getTime() - 1 * 60 * 60 * 1000)

  return etdDate >= oneHourAgo && etdDate <= now
}

export const appConfig = {
  title: 'AirTrack: Daily Statistics and Status for Avianca Flights',
  description:
    "Stay informed with up-to-date performance indicators for Avianca flights — punctuality, delay trends, active routes, and more. Explore today's flight data in one place on AirTrack.",
  prodUrl: 'https://air-track-seven.vercel.app/',
  repositoryUrl: 'https://github.com/josebarrios/airtrack',
}
