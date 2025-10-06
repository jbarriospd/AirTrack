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
    return (
        <div className="w-full space-y-4">
            <h2 className="text-left text-lg font-semibold">Day Summary</h2>
            <div className="w-full grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="p-4 bg-slate-200/50 dark:bg-slate-800/50 rounded-lg text-center">
                    <p className="text-sm text-slate-500 dark:text-slate-400">Total Flights</p>
                    <p className="text-2xl font-bold">{totalFlights.toLocaleString()}</p>
                </div>

                <div className="p-4 bg-green-100 dark:bg-green-900/30 rounded-lg text-center">
                    <p className="text-sm text-green-600 dark:text-green-400">On-time</p>
                    <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                        {onTime.toLocaleString()}
                    </p>
                </div>

                <div className="p-4 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg text-center">
                    <p className="text-sm text-yellow-600 dark:text-yellow-400">Delayed</p>
                    <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">
                        {delayed.toLocaleString()}
                    </p>
                </div>

                <div className="p-4 bg-red-100 dark:bg-red-900/30 rounded-lg text-center">
                    <p className="text-sm text-red-600 dark:text-red-400">Canceled</p>
                    <p className="text-2xl font-bold text-red-700 dark:text-red-300">
                        {canceled.toLocaleString()}
                    </p>
                </div>

                <div className="p-4 bg-slate-200/50 dark:bg-slate-800/50 rounded-lg text-center col-span-2 md:col-span-1">
                    <p className="text-sm text-slate-500 dark:text-slate-400">Average Delay</p>
                    <p className="text-2xl font-bold">{averageDelay} min</p>
                </div>
            </div>
        </div>
    )
}
