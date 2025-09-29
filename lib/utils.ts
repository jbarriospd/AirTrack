import { FlightStatusResponse, SimplifiedFlightStatus } from "./types";

import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getTodayString(): string {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export function getFlightStatusFileName(date?: string): string {
  const dateStr = date || getTodayString();
  return `flight_statuses_${dateStr}.json`;
}

export function getProcessFlightFileName(date?: string): string {
  const dateStr = date || getTodayString();
  return `process_flight_${dateStr}`;
}

export function createResponse(success: boolean, message: string, data?: any) {
  return {
    success,
    message,
    date: getTodayString(),
    ...data
  };
}

export function extractFlightNumber(flightNumber: string): string {
  const match = flightNumber.match(/\d+/);
  return match ? match[0] : '';
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
  };
}

export function calculateDelayCategory(etd: string, atd: string): string {
  const [etdH, etdM] = etd.split(':').map(Number);
  const [atdH, atdM] = atd.split(':').map(Number);

  const etdInMinutes = etdH * 60 + etdM;
  const atdInMinutes = atdH * 60 + atdM;

  let delay = atdInMinutes - etdInMinutes;

  // Handle cross-midnight flights
  if (delay > 720) {
    // ATD is previous day, so subtract 24 hours (1440 minutes) from ATD
    delay = atdInMinutes - 1440 - etdInMinutes;
  } else if (delay < -720) {
    // ETD is previous day, so add 24 hours (1440 minutes) to ATD
    delay = atdInMinutes + 1440 - etdInMinutes;
  }

  if (delay < 0) return `Early ${Math.abs(delay)} min`;
  if (delay === 0) return 'On time';
  if (delay <= 15) return '0-15 min';
  if (delay <= 30) return '15-30 min';
  if (delay <= 45) return '30-45 min';
  return '45+ min';
}

export function calculateFlightDelayCategory(flight: { etd?: string; atd?: string; status: string }): string | null {
  if ((flight.status === 'Departed' || flight.status === 'Landed' || flight.status === 'Delayed') && flight.etd && flight.atd) {
    return calculateDelayCategory(flight.etd, flight.atd);
  }
  
  return null;
}

export function shouldUpdateFlight(flight: { status: string; etd?: string; date?: string }): boolean {
  if (flight.status === "Landed" || flight.status === "Departed") return false;
  if (!flight.etd || !flight.date) return false;
  
  const etdDate = new Date(`${flight.date}T${flight.etd}:00`);
  if (isNaN(etdDate.getTime())) return false;
  
  const now = new Date();
  const oneHourAgo = new Date(now.getTime() - 1 * 60 * 60 * 1000);
  
  return etdDate >= oneHourAgo && etdDate <= now;
}

export const appConfig = {
  title: "FlightScope",
  description: "Real-time flight status tracking for Avianca flights.",
  prodUrl: "http://localhost:3000",
  repositoryUrl: "https://github.com/josebarrios/aviancafail",
};