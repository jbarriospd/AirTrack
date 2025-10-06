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

  const getDelayColor = (delayMinutes: number | null): string => {
    if (delayMinutes === null) return 'text-slate-500'
    if (delayMinutes <= 0) return 'text-green-500'
    if (delayMinutes <= 15) return 'text-yellow-500'
    if (delayMinutes <= 30) return 'text-yellow-500'
    if (delayMinutes <= 45) return 'text-orange-500'
    return 'text-red-500'
  }

  const formatDelayDisplay = (delayMinutes: number | null, status: string): string => {
    if (status === 'Cancelled') return ''
    if (delayMinutes === null) return ''
    if (delayMinutes > 0) return `+ ${delayMinutes} min`
    if (delayMinutes < 0) return `Early ${Math.abs(delayMinutes)} min`
    return 'On time'
  }

  const filterFlightsByCategory = (flights: FlightStatus[]): FlightStatus[] => {
    if (selectedFilter === 'all') return flights

    if (selectedFilter === 'on-time') {
      return flights.filter(flight =>
        flight.delayMinutes !== null && flight.delayMinutes <= 0
      )
    }

    if (selectedFilter === 'delayed') {
      return flights.filter(flight =>
        flight.delayMinutes !== null && flight.delayMinutes > 0
      )
    }

    if (selectedFilter === 'cancelled') {
      return flights.filter(flight =>
        flight.status === 'Cancelled'
      )
    }

    return flights
  }

  useEffect(() => {
    setLoading(true)
    getFlights(date)
      .then((result) => {
        if (result.success) {
          setFlights(result.data)
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

  const filteredFlights = filterFlightsByCategory(flights)
  
  // Sort flights by delay: worst delays first, then on-time/early
  const sortedFlights = [...filteredFlights].sort((a, b) => {
    const delayA = a.delayMinutes ?? 0
    const delayB = b.delayMinutes ?? 0
    return delayB - delayA
  })

  return (
    <div className="w-full max-w-4xl mt-8">
      <p className="text-lg font-bold text-zinc-600 dark:text-zinc-50 mb-4">Flights List</p>
      <div className="flex justify-end items-center gap-2 mb-6">
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
              ? 'bg-yellow-600 text-white dark:bg-yellow-500'
              : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700'
              }`}
          >
            Delayed
          </button>
          <button
            onClick={() => setSelectedFilter('cancelled')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${selectedFilter === 'cancelled'
              ? 'bg-red-600 text-white dark:bg-red-500'
              : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700'
              }`}
          >
            Cancelled
          </button>
        </div>
      </div>

      {sortedFlights.length === 0 ? (
        <div className="text-zinc-600 dark:text-zinc-400 text-center py-8">
          No flights match the selected filter
        </div>
      ) : (
        <div className="grid gap-4">
          {sortedFlights.map((flight) => (
            <div
              key={flight.id}
              className="border border-zinc-200 dark:border-zinc-800 rounded-lg p-4 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <PlaneTakeoff
                    className={`w-6 h-6 ${getDelayColor(flight.delayMinutes)}`}
                  />
                  <div className="text-left">
                    <p className="font-bold text-sm md:text-md lg:text-lg">
                      {flight.flightNumber} | {flight.from} → {flight.to}
                    </p>
                    <p className="text-sm md:text-md text-slate-500 dark:text-slate-400">
                      Departure: {flight.etd}
                    </p>
                  </div>
                </div>
                <div className="text-right font-bold">
                  <span
                    className={`text-sm ${getDelayColor(flight.delayMinutes)}`}>
                    {formatDelayDisplay(flight.delayMinutes, flight.status)}
                  </span>
                  <p className='text-sm font-bold'>
                    {flight.status}
                    <span className={`${getDelayColor(flight.delayMinutes)}`}>
                      {flight.status !== 'Cancelled' ? ` | ${flight.atd}` : ''}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
