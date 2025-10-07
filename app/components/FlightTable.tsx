'use client'

import { useEffect, useState, useMemo } from 'react'
import { FlightStatus } from '@/lib/types'
import { getFlights } from '@/app/actions/getFlights'

interface FlightTableProps {
  date: string
}

export default function FlightTable({ date }: FlightTableProps) {
  const [flights, setFlights] = useState<FlightStatus[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'on-time' | 'delayed' | 'cancelled'>('all')

  const getDelayColor = (delayMinutes: number | null): string => {
    if (delayMinutes === null) return 'text-slate-500'
    if (delayMinutes <= 0) return 'text-green-600 dark:text-green-500'
    if (delayMinutes <= 15) return 'text-yellow-600 dark:text-yellow-500'
    if (delayMinutes <= 30) return 'text-yellow-600 dark:text-yellow-500'
    if (delayMinutes <= 45) return 'text-orange-600 dark:text-orange-500'
    return 'text-red-600 dark:text-red-500'
  }

  const formatDelayDisplay = (delayMinutes: number | null, status: string): string => {
    if (status === 'Cancelled') return 'Cancelled'
    if (delayMinutes === null) return '-'
    if (delayMinutes > 0) return `+${delayMinutes} min`
    if (delayMinutes < 0) return `${delayMinutes} min`
    return 'On time'
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

  const sortedFlights = useMemo(() => {
    let filteredFlights = flights

    if (selectedFilter === 'on-time') {
      filteredFlights = flights.filter(flight =>
        flight.delayMinutes !== null && flight.delayMinutes <= 0
      )
    } else if (selectedFilter === 'delayed') {
      filteredFlights = flights.filter(flight =>
        flight.delayMinutes !== null && flight.delayMinutes > 0
      )
    } else if (selectedFilter === 'cancelled') {
      filteredFlights = flights.filter(flight =>
        flight.status === 'Cancelled'
      )
    }

    return [...filteredFlights].sort((a, b) => {
      if (a.status === 'Cancelled') return -1
      if (b.status === 'Cancelled') return 1
      return (b.delayMinutes ?? 0) - (a.delayMinutes ?? 0)
    })
  }, [flights, selectedFilter])

  if (loading) {
    return (
      <div className="w-full max-w-6xl mt-8" role="status" aria-live="polite" aria-label="Loading flights">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="h-7 w-32 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
          <div className="flex gap-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-10 w-20 bg-zinc-200 dark:bg-zinc-800 rounded-lg animate-pulse" />
            ))}
          </div>
        </div>

        {/* Desktop Table Skeleton */}
        <div className="hidden md:block overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
          <table className="w-full">
            <thead className="bg-zinc-100 dark:bg-zinc-800">
              <tr>
                {['Flight No', 'Route', 'Scheduled Time', 'Actual Time', 'Delay'].map((header) => (
                  <th key={header} className="px-4 py-3 text-left text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {[1, 2, 3, 4, 5].map((i) => (
                <tr key={i}>
                  <td className="px-4 py-3">
                    <div className="h-4 w-16 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
                  </td>
                  <td className="px-4 py-3">
                    <div className="h-4 w-24 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
                  </td>
                  <td className="px-4 py-3">
                    <div className="h-4 w-20 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
                  </td>
                  <td className="px-4 py-3">
                    <div className="h-4 w-20 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
                  </td>
                  <td className="px-4 py-3">
                    <div className="h-4 w-16 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Card Skeleton */}
        <div className="md:hidden space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="border border-zinc-200 dark:border-zinc-800 rounded-lg p-4 bg-white dark:bg-zinc-900">
              <div className="flex justify-between items-start mb-3">
                <div className="space-y-2">
                  <div className="h-5 w-20 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
                  <div className="h-4 w-32 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
                </div>
                <div className="h-4 w-16 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <div className="h-3 w-24 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
                  <div className="h-4 w-16 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
                </div>
                <div className="space-y-1">
                  <div className="h-3 w-20 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
                  <div className="h-4 w-16 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (flights.length === 0) {
    return (
      <div className="text-zinc-600 dark:text-zinc-400" role="status" aria-live="polite">
        No flights found for {date}
      </div>
    )
  }

  return (
    <div className="w-full max-w-6xl mt-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h2 className="text-lg font-bold text-zinc-600 dark:text-zinc-50">Flights Table</h2>
        <div className="flex flex-wrap gap-2 w-full sm:w-auto" role="group" aria-label="Filter flights by status">
          <button
            onClick={() => setSelectedFilter('all')}
            aria-label="Show all flights"
            aria-pressed={selectedFilter === 'all'}
            className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${selectedFilter === 'all'
              ? 'bg-blue-600 text-white dark:bg-blue-500'
              : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700'
              }`}
          >
            All
          </button>
          <button
            onClick={() => setSelectedFilter('on-time')}
            aria-label="Show on-time flights only"
            aria-pressed={selectedFilter === 'on-time'}
            className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${selectedFilter === 'on-time'
              ? 'bg-green-600 text-white dark:bg-green-500'
              : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700'
              }`}
          >
            On-time
          </button>
          <button
            onClick={() => setSelectedFilter('delayed')}
            aria-label="Show delayed flights only"
            aria-pressed={selectedFilter === 'delayed'}
            className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${selectedFilter === 'delayed'
              ? 'bg-yellow-600 text-white dark:bg-yellow-500'
              : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700'
              }`}
          >
            Delayed
          </button>
          <button
            onClick={() => setSelectedFilter('cancelled')}
            aria-label="Show cancelled flights only"
            aria-pressed={selectedFilter === 'cancelled'}
            className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${selectedFilter === 'cancelled'
              ? 'bg-red-600 text-white dark:bg-red-500'
              : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700'
              }`}
          >
            Cancelled
          </button>
        </div>
      </div>

      {sortedFlights.length === 0 ? (
        <div className="text-zinc-600 dark:text-zinc-400 text-center py-8" role="status" aria-live="polite">
          No flights match the selected filter
        </div>
      ) : (
        <>
          {/* Desktop Table View - Hidden on mobile */}
          <div className="hidden md:block overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
            <table className="w-full" role="table" aria-label="Flight status information">
              <thead className="bg-zinc-100 dark:bg-zinc-800">
                <tr>
                  <th scope="col" className="px-4 py-3 text-left text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    Flight No
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    Route
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    Scheduled Time
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    Actual Time
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    Delay to Departure
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {sortedFlights.map((flight) => (
                  <tr
                    key={flight.id}
                    className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors"
                  >
                    <td className="px-4 py-3 text-sm font-medium text-zinc-900 dark:text-zinc-100">
                      {flight.flightNumber}
                    </td>
                    <td className="px-4 py-3 text-sm text-zinc-700 dark:text-zinc-300">
                      {flight.from} → {flight.to}
                    </td>
                    <td className="px-4 py-3 text-sm text-zinc-700 dark:text-zinc-300">
                      {flight.etd}
                    </td>
                    <td className="px-4 py-3 text-sm text-zinc-700 dark:text-zinc-300">
                      {flight.status === 'Cancelled' ? '-' : flight.atd}
                    </td>
                    <td className={`px-4 py-3 text-sm font-semibold ${getDelayColor(flight.delayMinutes)}`}>
                      {formatDelayDisplay(flight.delayMinutes, flight.status)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View - Hidden on desktop */}
          <div className="md:hidden space-y-4" role="list" aria-label="Flight status cards">
            {sortedFlights.map((flight) => (
              <div
                key={flight.id}
                role="listitem"
                className="border border-zinc-200 dark:border-zinc-800 rounded-lg p-4 bg-white dark:bg-zinc-900"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="font-bold text-lg text-zinc-900 dark:text-zinc-100">
                      {flight.flightNumber}
                    </p>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                      {flight.from} → {flight.to}
                    </p>
                  </div>
                  <span className={`text-sm font-semibold ${getDelayColor(flight.delayMinutes)}`}>
                    {formatDelayDisplay(flight.delayMinutes, flight.status)}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-zinc-500 dark:text-zinc-400 text-xs mb-1">Scheduled Time</p>
                    <p className="font-medium text-zinc-900 dark:text-zinc-100">{flight.etd}</p>
                  </div>
                  <div>
                    <p className="text-zinc-500 dark:text-zinc-400 text-xs mb-1">Actual Time</p>
                    <p className="font-medium text-zinc-900 dark:text-zinc-100">
                      {flight.status === 'Cancelled' ? '-' : flight.atd}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
