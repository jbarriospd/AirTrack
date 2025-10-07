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

// Get current date/time in Colombia timezone
export function getNowInColombia(): Date {
  const now = new Date()
  const colombiaTimeStr = now.toLocaleString('en-US', {
    timeZone: 'America/Bogota',
  })
  return new Date(colombiaTimeStr)
}

// Get date in Colombia timezone from date string
export function getDateInColombia(dateStr: string, timeStr?: string): Date {
  const fullDateStr = timeStr ? `${dateStr}T${timeStr}` : dateStr
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

  // Handle cross-midnight flights
  if (delay > 720) {
    // ATD is previous day, so subtract 24 hours (1440 minutes) from ATD
    delay = atdInMinutes - 1440 - etdInMinutes
  } else if (delay < -720) {
    // ETD is previous day, so add 24 hours (1440 minutes) to ATD
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
  title: 'FlightScope',
  description: 'Real-time flight status tracking for Avianca flights.',
  prodUrl: 'http://localhost:3000',
  repositoryUrl: 'https://github.com/josebarrios/aviancafail',
}
