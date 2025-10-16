'use client'

import { cn, getTodayString } from '@/lib/utils'
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react'
import { useState, useEffect } from 'react'

interface DateSelectorProps {
  selectedDate: string
  onDateChange: (date: string) => void
  className?: string
}

function getSundayOfCurrentWeek(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  const dayOfWeek = date.getDay()
  const diff = dayOfWeek === 0 ? 0 : -dayOfWeek
  date.setDate(date.getDate() + diff)
  return date.toISOString().split('T')[0]
}

function formatDateDisplay(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const dateObj = new Date(year, month - 1, day)
  dateObj.setHours(0, 0, 0, 0)

  if (dateObj.getTime() === today.getTime()) {
    return 'Today'
  }

  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  if (dateObj.getTime() === yesterday.getTime()) {
    return 'Yesterday'
  }

  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  })
}

export default function DateSelector({
  selectedDate,
  onDateChange,
  className,
}: DateSelectorProps) {
  const today = getTodayString()
  const minDate = getSundayOfCurrentWeek(today)
  const maxDate = today
  const [showPicker, setShowPicker] = useState(false)

  const canGoPrevious = selectedDate > minDate
  const canGoNext = selectedDate < maxDate

  const handlePreviousDay = () => {
    if (!canGoPrevious) return
    const [year, month, day] = selectedDate.split('-').map(Number)
    const date = new Date(year, month - 1, day)
    date.setDate(date.getDate() - 1)
    onDateChange(date.toISOString().split('T')[0])
  }

  const handleNextDay = () => {
    if (!canGoNext) return
    const [year, month, day] = selectedDate.split('-').map(Number)
    const date = new Date(year, month - 1, day)
    date.setDate(date.getDate() + 1)
    onDateChange(date.toISOString().split('T')[0])
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement && e.target.type === 'date') {
        return
      }

      if (e.key === 'ArrowLeft' && canGoPrevious) {
        e.preventDefault()
        handlePreviousDay()
      } else if (e.key === 'ArrowRight' && canGoNext) {
        e.preventDefault()
        handleNextDay()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedDate, canGoPrevious, canGoNext])

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300" htmlFor="date-selector">
        Date:
      </label>

      <div className="flex items-center gap-1 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-1">
        {/* Previous Day Button */}
        <button
          onClick={handlePreviousDay}
          disabled={!canGoPrevious}
          aria-label="Previous day"
          className={cn(
            'p-1.5 rounded-md transition-colors',
            canGoPrevious
              ? 'hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
              : 'text-zinc-300 dark:text-zinc-700 cursor-not-allowed'
          )}
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div className="relative flex items-center gap-2">
          <button
            onClick={() => setShowPicker(!showPicker)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            aria-label="Select date"
          >
            <Calendar className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
            <span className="text-sm font-medium min-w-[100px] text-left font-tabular">
              {formatDateDisplay(selectedDate)}
            </span>
          </button>

          {showPicker && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowPicker(false)}
                aria-hidden="true"
              />
              <div className="absolute top-full left-0 mt-1 z-20">
                <input
                  id="date-selector"
                  type="date"
                  value={selectedDate}
                  onChange={(e) => {
                    onDateChange(e.target.value)
                    setShowPicker(false)
                  }}
                  min={minDate}
                  max={maxDate}
                  className="rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm shadow-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  aria-label={`Select date between ${minDate} and ${maxDate}`}
                />
              </div>
            </>
          )}
        </div>

        <button
          onClick={handleNextDay}
          disabled={!canGoNext}
          aria-label="Next day"
          className={cn(
            'p-1.5 rounded-md transition-colors',
            canGoNext
              ? 'hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
              : 'text-zinc-300 dark:text-zinc-700 cursor-not-allowed'
          )}
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <span className="text-xs text-zinc-500 dark:text-zinc-400">
        (This week)
      </span>
    </div>
  )
}
