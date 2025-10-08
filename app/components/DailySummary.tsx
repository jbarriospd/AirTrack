import { Plane, CheckCircle2, Clock, XCircle, TrendingUp } from 'lucide-react'

interface DailySummaryProps {
    totalFlights: number
    onTime: number
    delayed: number
    canceled: number
    averageDelay: number
}

export default function DailySummary({
    totalFlights,
    onTime,
    delayed,
    canceled,
    averageDelay,
}: DailySummaryProps) {
    const onTimePercentage = totalFlights > 0 ? ((onTime / totalFlights) * 100).toFixed(1) : '0'
    const delayedPercentage = totalFlights > 0 ? ((delayed / totalFlights) * 100).toFixed(1) : '0'
    const canceledPercentage = totalFlights > 0 ? ((canceled / totalFlights) * 100).toFixed(1) : '0'

    return (
        <div className="w-full space-y-4">
            <h2 className="text-left text-lg font-semibold">Daily Summary</h2>
            <div className="w-full grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                <div className="p-4 bg-slate-200/50 dark:bg-slate-800/50 rounded-lg border border-slate-300/50 dark:border-slate-700/50 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-slate-500 dark:text-slate-400">Total Flights</p>
                        <Plane className="w-4 h-4 text-slate-400" />
                    </div>
                    <p className="text-3xl font-bold">{totalFlights.toLocaleString()}</p>
                </div>

                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800/50 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-green-600 dark:text-green-400">On-time</p>
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                    </div>
                    <p className="text-3xl font-bold text-green-700 dark:text-green-300">
                        {onTime.toLocaleString()}
                    </p>
                    <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                        {onTimePercentage}% of total
                    </p>
                </div>

                <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800/50 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-yellow-600 dark:text-yellow-400">Delayed</p>
                        <Clock className="w-4 h-4 text-yellow-500" />
                    </div>
                    <p className="text-3xl font-bold text-yellow-700 dark:text-yellow-300">
                        {delayed.toLocaleString()}
                    </p>
                    <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                        {delayedPercentage}% of total
                    </p>
                </div>

                <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800/50 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-red-600 dark:text-red-400">Canceled</p>
                        <XCircle className="w-4 h-4 text-red-500" />
                    </div>
                    <p className="text-3xl font-bold text-red-700 dark:text-red-300">
                        {canceled.toLocaleString()}
                    </p>
                    <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                        {canceledPercentage}% of total
                    </p>
                </div>

                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800/50 hover:shadow-md transition-shadow col-span-2 md:col-span-1">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-blue-600 dark:text-blue-400">Avg Delay</p>
                        <TrendingUp className="w-4 h-4 text-blue-500" />
                    </div>
                    <p className="text-3xl font-bold text-blue-700 dark:text-blue-300">
                        {averageDelay}
                    </p>
                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">minutes</p>
                </div>
            </div>
        </div>
    )
}
