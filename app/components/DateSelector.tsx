'use client'

import { cn } from '@/lib/utils'

interface DateSelectorProps {
  selectedDate: string
  onDateChange: (date: string) => void
  className?: string
}

export default function DateSelector({
  selectedDate,
  onDateChange,
  className,
}: DateSelectorProps) {
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
        className="rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      />
    </div>
  )
}
