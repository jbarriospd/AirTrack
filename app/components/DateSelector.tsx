'use client'

import { cn } from '@/lib/utils'

interface DateSelectorProps {
  selectedDate: string
  onDateChange: (date: string) => void
  className?: string
}

// Get Monday of current week
function getMonday(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1) // Adjust when day is Sunday
  return new Date(d.setDate(diff))
}

// Get Sunday of current week
function getSunday(date: Date): Date {
  const monday = getMonday(date)
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)
  return sunday
}

// Format date as YYYY-MM-DD
function formatDate(date: Date): string {
  return date.toISOString().split('T')[0]
}

export default function DateSelector({
  selectedDate,
  onDateChange,
  className,
}: DateSelectorProps) {
  const today = new Date()
  const monday = getMonday(today)
  const sunday = getSunday(today)

  const minDate = formatDate(monday)
  const maxDate = formatDate(sunday)

  return (
    <div className={cn('flex items-center gap-4', className)}>
      <label className="text-sm font-medium" htmlFor="date-selector">
        Date:
      </label>
      <input
        id="date-selector"
        type="date"
        value={selectedDate}
        onChange={(e) => onDateChange(e.target.value)}
        min={minDate}
        max={maxDate}
        className="rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      />
    </div>
  )
}
