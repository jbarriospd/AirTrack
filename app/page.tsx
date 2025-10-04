'use client'

import { useState } from 'react'
import BackgroundGradient from '@/app/components/BackgroungGradient'
import { cn, getTodayString } from '@/lib/utils'
import Footer from '@/app/components/Footer'
import Logo from '@/app/components/ui/Logo'
import DateSelector from '@/app/components/DateSelector'
import FlightsList from '@/app/components/FlightsList'

export default function HomePage() {
  const [selectedDate, setSelectedDate] = useState(getTodayString())

  return (
    <main className="relative min-h-screen pb-16">
      <BackgroundGradient />
      <section className="relative flex w-full items-center justify-center px-4 py-8 md:px-4 lg:px-8 min-h-screen">
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
              Flight status Avianca
            </h1>
            <p
              className={cn(
                'text-lg text-zinc-600 dark:text-zinc-400 font-mono',
                'animate-in fill-mode-backwards fade-in slide-in-from-bottom-2 delay-500 duration-500'
              )}
            >
              Get flight status Avianca
            </p>

            <DateSelector
              selectedDate={selectedDate}
              onDateChange={setSelectedDate}
              className="animate-in fill-mode-backwards fade-in slide-in-from-bottom-2 delay-700 duration-500"
            />

            <FlightsList date={selectedDate} />
          </div>
        </div>
      </section>
      <Footer />
    </main>
  )
}
