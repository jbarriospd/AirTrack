'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import BackgroundGradient from '@/app/components/BackgroungGradient'
import { cn, getTodayString } from '@/lib/utils'
import Footer from '@/app/components/Footer'
import Logo from '@/app/components/ui/Logo'
import DateSelector from '@/app/components/DateSelector'
import FlightTable from '@/app/components/FlightTable'
import DailySummary from '@/app/components/DailySummary'
import { useFlightSummary } from '@/lib/hooks/useFlightSummary'

function HomePageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [selectedDate, setSelectedDate] = useState(getTodayString())
  const { summary, loading } = useFlightSummary(selectedDate)

  useEffect(() => {
    const dateParam = searchParams.get('date')
    if (dateParam) {
      setSelectedDate(dateParam)
    }
  }, [searchParams])

  const handleDateChange = (newDate: string) => {
    setSelectedDate(newDate)
    router.push(`?date=${newDate}`, { scroll: false })
  }

  return (
    <main className="relative min-h-screen">
      <BackgroundGradient />
      <section className="relative flex w-full justify-center px-4 py-8 md:px-4 lg:px-8">
        <div className="w-full max-w-4xl items-center">
          <div className="flex flex-col items-center space-y-6 text-center">
            <Logo
              width={70}
              height={70}
              className="animate-in fill-mode-backwards fade-in slide-in-from-bottom-2 delay-100 duration-500"
            />
            <h1
              className={cn(
                'text-3xl font-bold tracking-tight text-zinc-900 md:text-5xl dark:text-white',
                'animate-in fill-mode-backwards fade-in slide-in-from-bottom-2 delay-200 duration-500'
              )}
            >
              AirTrack
            </h1>
            <p
              className={cn(
                'text-lg text-zinc-600 dark:text-zinc-400 font-mono',
                'animate-in fill-mode-backwards fade-in slide-in-from-bottom-2 delay-500 duration-500'
              )}
            >
              Daily Statistics and Status for Avianca Flights
            </p>

            <DateSelector
              selectedDate={selectedDate}
              onDateChange={handleDateChange}
              className="animate-in fill-mode-backwards fade-in slide-in-from-bottom-2 delay-700 duration-500"
            />
            <DailySummary
              totalFlights={summary.totalFlights}
              onTime={summary.onTime}
              delayed={summary.delayed}
              canceled={summary.canceled}
              averageDelay={summary.averageDelay}
              loading={loading}
            />

            <FlightTable date={selectedDate} />
          </div>
        </div>
      </section>
      <Footer />
    </main>
  )
}

export default function HomePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <HomePageContent />
    </Suspense>
  )
}
