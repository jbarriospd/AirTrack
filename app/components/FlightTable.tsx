'use client'

import { useEffect, useState, useMemo } from 'react'
import { FlightStatus } from '@/lib/types'
import { getFlights } from '@/app/actions/getFlights'
import { CheckCircle2, Clock, XCircle, List, Plane, MapPin, Calendar, AlertCircle } from 'lucide-react'

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

  const getStatusBadge = (delayMinutes: number | null, status: string) => {
    if (status === 'Cancelled') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
          <XCircle className="w-3 h-3" />
          Cancelled
        </span>
      )
    }
    if (delayMinutes === null) return null
    if (delayMinutes <= 0) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
          <CheckCircle2 className="w-3 h-3" />
          On time
        </span>
      )
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
        <Clock className="w-3 h-3" />
        Delayed
      </span>
    )
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
        <div className="flex flex-wrap gap-3 w-full sm:w-auto" role="group" aria-label="Filter flights by status">
          <button
            onClick={() => setSelectedFilter('all')}
            aria-label="Show all flights"
            aria-pressed={selectedFilter === 'all'}
            className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-zinc-900 ${selectedFilter === 'all'
              ? 'bg-blue-600 text-white dark:bg-blue-500 shadow-md scale-105'
              : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 hover:scale-105 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700'
              }`}
          >
            <List className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>All</span>
          </button>
          <button
            onClick={() => setSelectedFilter('on-time')}
            aria-label="Show on-time flights only"
            aria-pressed={selectedFilter === 'on-time'}
            className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 dark:focus:ring-offset-zinc-900 ${selectedFilter === 'on-time'
              ? 'bg-green-600 text-white dark:bg-green-500 shadow-md scale-105'
              : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 hover:scale-105 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700'
              }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>On-time</span>
          </button>
          <button
            onClick={() => setSelectedFilter('delayed')}
            aria-label="Show delayed flights only"
            aria-pressed={selectedFilter === 'delayed'}
            className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 dark:focus:ring-offset-zinc-900 ${selectedFilter === 'delayed'
              ? 'bg-yellow-600 text-white dark:bg-yellow-500 shadow-md scale-105'
              : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 hover:scale-105 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700'
              }`}
          >
            <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>Delayed</span>
          </button>
          <button
            onClick={() => setSelectedFilter('cancelled')}
            aria-label="Show cancelled flights only"
            aria-pressed={selectedFilter === 'cancelled'}
            className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:focus:ring-offset-zinc-900 ${selectedFilter === 'cancelled'
              ? 'bg-red-600 text-white dark:bg-red-500 shadow-md scale-105'
              : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 hover:scale-105 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700'
              }`}
          >
            <XCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>Cancelled</span>
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
          <div className="hidden md:block overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800 shadow-sm">
            <table className="w-full" role="table" aria-label="Flight status information">
              <thead className="bg-gradient-to-r from-zinc-50 to-zinc-100 dark:from-zinc-800 dark:to-zinc-800/80">
                <tr>
                  <th scope="col" className="px-4 py-3.5 text-left text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    <div className="flex items-center gap-2">
                      <Plane className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
                      Flight No
                    </div>
                  </th>
                  <th scope="col" className="px-4 py-3.5 text-left text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
                      Route
                    </div>
                  </th>
                  <th scope="col" className="px-4 py-3.5 text-left text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
                      Scheduled
                    </div>
                  </th>
                  <th scope="col" className="px-4 py-3.5 text-left text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
                      Actual
                    </div>
                  </th>
                  <th scope="col" className="px-4 py-3.5 text-left text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
                      Status
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 bg-white dark:bg-zinc-900">
                {sortedFlights.map((flight, index) => (
                  <tr
                    key={flight.id}
                    className={`group hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-all duration-150 ${index % 2 === 0 ? 'bg-white dark:bg-zinc-900' : 'bg-zinc-50/50 dark:bg-zinc-900/50'}`}
                  >
                    <td className="px-4 py-4 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                      <div className="flex items-center gap-2">
                        <div className="w-1 h-8 rounded-full bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                        {flight.flightNumber}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-zinc-700 dark:text-zinc-300">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{flight.from}</span>
                        <span className="text-zinc-400">→</span>
                        <span className="font-medium">{flight.to}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                      {flight.etd}
                    </td>
                    <td className="px-4 py-4 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                      {flight.status === 'Cancelled' ? (
                        <span className="text-zinc-400 dark:text-zinc-500">-</span>
                      ) : (
                        flight.atd
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        {getStatusBadge(flight.delayMinutes, flight.status)}
                        {flight.delayMinutes !== null && flight.delayMinutes > 0 && (
                          <span className={`text-xs font-medium ${getDelayColor(flight.delayMinutes)}`}>
                            +{flight.delayMinutes}m
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View - Hidden on desktop */}
          <div className="md:hidden space-y-3" role="list" aria-label="Flight status cards">
            {sortedFlights.map((flight) => (
              <div
                key={flight.id}
                role="listitem"
                className="relative border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 bg-white dark:bg-zinc-900 shadow-sm hover:shadow-md transition-shadow duration-200"
              >
                <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-blue-500 to-blue-600 rounded-l-xl" />

                <div className="flex justify-between items-start mb-3 pl-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Plane className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
                      <p className="font-bold text-lg text-zinc-900 dark:text-zinc-100">
                        {flight.flightNumber}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                      <MapPin className="w-3.5 h-3.5" />
                      <span className="font-medium">{flight.from}</span>
                      <span className="text-zinc-400">→</span>
                      <span className="font-medium">{flight.to}</span>
                    </div>
                  </div>
                  {getStatusBadge(flight.delayMinutes, flight.status)}
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm pl-2 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                  <div>
                    <div className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400 text-xs mb-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Scheduled</span>
                    </div>
                    <p className="font-semibold text-zinc-900 dark:text-zinc-100">{flight.etd}</p>
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400 text-xs mb-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Actual</span>
                    </div>
                    <p className="font-semibold text-zinc-900 dark:text-zinc-100">
                      {flight.status === 'Cancelled' ? (
                        <span className="text-zinc-400 dark:text-zinc-500">-</span>
                      ) : (
                        flight.atd
                      )}
                    </p>
                  </div>
                </div>

                {flight.delayMinutes !== null && flight.delayMinutes > 0 && (
                  <div className="mt-3 pl-2 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                    <span className={`text-xs font-semibold ${getDelayColor(flight.delayMinutes)}`}>
                      Delayed by {flight.delayMinutes} minutes
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
