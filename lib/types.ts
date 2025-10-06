import { z } from 'zod'

export const FlightSchema = z.object({
  flightNumber: z.string(),
  date: z.string(),
  from: z.string(),
  to: z.string(),
  status: z.string(),
  etd: z.string().optional(),
  atd: z.string().optional(),
})

export type Flight = z.infer<typeof FlightSchema>

export type RawFlightDorado = {
  qualifier: { code: string }
  airline: { code: string; name: string }
  flighttype: string
  status: { code: string; en: string; es: string }
  city: { code: string; en: string; es: string }
  gate: string
  adi: string
  claim: string | null
  estimatedDate: string
  actualDate: string
  scheduleDate: string
  number: string
  terminal: string
}

export interface FlightStatusResponse {
  FlightNumber: string
  Date: string
  From: string
  To: string
  Status: string
  EstimatedTimeDeparture: string
  ConfirmedTimeDeparture: string
  EstimatedTimeArrive: string
  ConfirmedTimeArrive: string
  AirportFrom: string
  AirportTo: string
  CityTo: string
  CityFrom: string
  IataTo: string
  IataFrom: string
  AircraftType: string
  OperatedBy: string
  SecondsActual: string
  SecondsSchedule: string
}

export interface SimplifiedFlightStatus {
  flightNumber: string
  date: string
  from: string
  to: string
  status: string
  etd: string // EstimatedTimeDeparture
  atd: string // ConfirmedTimeDeparture
}

export interface FlightStatus extends Flight {
  id?: number
  delayMinutes: number | null
  delayCategory: string | null
  lastUpdated: string
}
