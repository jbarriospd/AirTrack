import { useEffect, useState } from 'react'
import { FlightStatus } from '@/lib/types'
import { getFlights } from '@/app/actions/getFlights'

export interface FlightSummary {
  totalFlights: number
  onTime: number
  delayed: number
  canceled: number
  averageDelay: number
}

export function useFlightSummary(date: string) {
  const [summary, setSummary] = useState<FlightSummary>({
    totalFlights: 0,
    onTime: 0,
    delayed: 0,
    canceled: 0,
    averageDelay: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    setError(null)

    getFlights(date)
      .then((result) => {
        if (result.success) {
          setSummary(calculateSummary(result.data))
        } else {
          setError('Failed to fetch flights')
          setSummary({
            totalFlights: 0,
            onTime: 0,
            delayed: 0,
            canceled: 0,
            averageDelay: 0,
          })
        }
      })
      .catch((err) => {
        setError(err.message || 'An error occurred')
        setSummary({
          totalFlights: 0,
          onTime: 0,
          delayed: 0,
          canceled: 0,
          averageDelay: 0,
        })
      })
      .finally(() => setLoading(false))
  }, [date])

  return { summary, loading, error }
}

function calculateSummary(flights: FlightStatus[]): FlightSummary {
  const totalFlights = flights.length

  const onTime = flights.filter(
    (flight) => flight.delayMinutes !== null && flight.delayMinutes <= 0
  ).length

  const delayed = flights.filter(
    (flight) => flight.delayMinutes !== null && flight.delayMinutes > 0
  ).length

  const canceled = flights.filter((flight) => flight.status === 'Cancelled').length

  // Calculate average delay in minutes
  const delayedFlights = flights.filter(
    (flight) => flight.delayMinutes !== null && flight.delayMinutes > 0
  )

  let totalDelayMinutes = 0
  delayedFlights.forEach((flight) => {
    totalDelayMinutes += flight.delayMinutes!
  })

  const averageDelay =
    delayedFlights.length > 0 ? Math.round(totalDelayMinutes / delayedFlights.length) : 0

  return {
    totalFlights,
    onTime,
    delayed,
    canceled,
    averageDelay,
  }
}
