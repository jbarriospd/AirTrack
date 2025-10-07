'use client'

import { cn, getTodayString } from '@/lib/utils'

interface DateSelectorProps {
  selectedDate: string
  onDateChange: (date: string) => void
  className?: string
}

function getMondayOfCurrentWeek(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00')
  const day = date.getDay()
  const diff = day === 0 ? -6 : -(day - 1)
  date.setDate(date.getDate() + diff)
  return date.toISOString().split('T')[0]
}

export default function DateSelector({
  selectedDate,
  onDateChange,
  className,
}: DateSelectorProps) {
  const today = getTodayString()
  const minDate = getMondayOfCurrentWeek(today)
  const maxDate = today

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
