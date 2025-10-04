'use client'

import { useEffect, useState } from 'react'
import { PlaneTakeoff } from 'lucide-react'
import { FlightStatus } from '@/lib/types'
import { getFlights } from '@/app/actions/getFlights'

interface FlightsListProps {
  date: string
}

export default function FlightsList({ date }: FlightsListProps) {
  const [flights, setFlights] = useState<FlightStatus[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'on-time' | 'delayed' | 'cancelled'>('all')

  useEffect(() => {
    setLoading(true)
    getFlights(date)
      .then((result) => {
        if (result.success) {
          const filteredFlights = result.data.filter(flight => flight.delayCategory !== null)
          setFlights(filteredFlights)
        } else {
          setFlights([])
        }
      })
      .finally(() => setLoading(false))
  }, [date])

  if (loading) {
    return (
      <div className="text-zinc-600 dark:text-zinc-400 animate-pulse">
        Loading flights...
      </div>
    )
  }

  if (flights.length === 0) {
    return (
      <div className="text-zinc-600 dark:text-zinc-400">
        No flights found for {date}
      </div>
    )
  }

  return (
    <div className="w-full max-w-4xl mt-8">
      <div className="flex justify-between items-center gap-2 mb-6">
        <p className="text-lg font-bold text-zinc-600 dark:text-zinc-50">Flights List</p>

        <div className="flex gap-2">
          <button
            onClick={() => setSelectedFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${selectedFilter === 'all'
              ? 'bg-blue-600 text-white dark:bg-blue-500'
              : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700'
              }`}
          >
            All
          </button>
          <button
            onClick={() => setSelectedFilter('on-time')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${selectedFilter === 'on-time'
              ? 'bg-green-600 text-white dark:bg-green-500'
              : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700'
              }`}
          >
            On-time
          </button>
          <button
            onClick={() => setSelectedFilter('delayed')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${selectedFilter === 'delayed'
              ? 'bg-red-600 text-white dark:bg-red-500'
              : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700'
              }`}
          >
            Delayed
          </button>
          <button
            onClick={() => setSelectedFilter('cancelled')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${selectedFilter === 'cancelled'
              ? 'bg-orange-600 text-white dark:bg-orange-500'
              : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700'
              }`}
          >
            Cancelled
          </button>
        </div>
      </div>
      <div className="grid gap-4">
        {flights.map((flight) => (
          <div
            key={flight.id}
            className="border border-zinc-200 dark:border-zinc-800 rounded-lg p-4 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <PlaneTakeoff
                  className={`w-6 h-6 ${flight.status === 'Delayed'
                    ? 'text-red-500'
                    : flight.status === 'Cancelled'
                      ? 'text-orange-500'
                      : flight.status === 'Landed'
                        ? 'text-green-500'
                        : 'text-blue-500'
                    }`}
                />
                <div className="text-left">
                  <p className="font-bold text-lg">
                    {flight.flightNumber} | {flight.from} → {flight.to}
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Departure: {flight.etd || 'N/A'}
                    {flight.atd && ` | Actual: ${flight.atd}`}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span
                  className="text-sm font-medium"
                >
                  {flight.status}
                </span>
                {flight.delayCategory && (
                  <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                    {flight.delayCategory}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
