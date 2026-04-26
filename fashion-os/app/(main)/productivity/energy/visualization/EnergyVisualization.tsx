'use client'
import { useState, useEffect } from 'react'
import { DateRangePicker } from '@/_components/Datepicker/Datepicker'
import LoadingIcon from '@/_components/generic/Loading'
import ReactECharts from 'echarts-for-react'


export default function EnergyVisualization() {

    // Step 1: stores the date range Django has data for
    const [availableRange, setAvailableRange] = useState<{ from: string, to: string } | null>(null)

    // Step 2: stores the date range the user selects in the picker
    const [selectedRange, setSelectedRange] = useState<{ from: string | undefined, to: string | undefined }>({ from: undefined, to: undefined })

    // Step 3: true while waiting for the initial date-range fetch
    const [loading, setLoading] = useState(true)

    // Step 4: holds an error message if the date-range fetch fails
    const [error, setError] = useState<string | null>(null)

    // Step 5: holds all machines and their readings arrays
    const [machineReadings, setMachineReadings] = useState<{ machine: string, readings: { timestamp: string, value_kw: number }[] }[] | null>(null)

    // Step 6: true while fetching readings from Django
    const [chartLoading, setChartLoading] = useState(false)

    // Step 7: holds an error if the readings fetch fails
    const [chartError, setChartError] = useState<string | null>(null)
    
    // Step 8: holds the name of the machine the user picked from the dropdown
    const [selectedMachine, setSelectedMachine] = useState<string | null>(null)

    // Step 9: on page load, fetch the available date range from Django
    useEffect(() => {
        const fetchDateRange = async () => {
            try {
                const response = await fetch('/api/energy/date-range')
                if (!response.ok) throw new Error('Failed to load date range')
                const data = await response.json()
                setAvailableRange({ from: data.min_date, to: data.max_date })
                setSelectedRange({ from: data.min_date, to: data.max_date })
            } catch (err: any) {
                setError(err.message)
            } finally {
                setLoading(false)
            }
        }
        fetchDateRange()
    }, [])

    // Step 10: called when user clicks Proceed — fetches readings for all machines
    const handleProceed = async () => {
        if (!selectedRange.from || !selectedRange.to) return
        setChartLoading(true)
        setChartError(null)
        setMachineReadings(null)
        try {
            const res = await fetch(`/api/energy/readings?from=${selectedRange.from}&to=${selectedRange.to}`)
            if (!res.ok) throw new Error('Failed to load readings')
            const data: { machine: string, readings: { timestamp: string, value_kw: number }[] }[] = await res.json()
            // Step 11: store all machines directly — no filtering
            setMachineReadings(data)
        } catch (err: any) {
            setChartError(err.message)
        } finally {
            setChartLoading(false)
        }
    }

    // Step 12: compute buckets for one machine — dynamic last threshold based on its max value
    const computeBuckets = (readings: { timestamp: string, value_kw: number }[]) => {
        const maxKw = Math.max(...readings.map(r => r.value_kw))
        const lastThreshold = Math.floor(maxKw) - 1
        return [
            { label: '0 kW',                   minutes: readings.filter(r => r.value_kw === 0).length },
            { label: '≤ 0.5 kW',               minutes: readings.filter(r => r.value_kw > 0 && r.value_kw <= 0.5).length },
            { label: '≤ 0.8 kW',               minutes: readings.filter(r => r.value_kw > 0.5 && r.value_kw <= 0.8).length },
            { label: '≤ 1 kW',                 minutes: readings.filter(r => r.value_kw > 0.8 && r.value_kw <= 1).length },
            { label: '≤ 2 kW',                 minutes: readings.filter(r => r.value_kw > 1 && r.value_kw <= 2).length },
            { label: '> 2 kW',                 minutes: readings.filter(r => r.value_kw > 2).length },

            //{ label: `> ${lastThreshold} kW`,  minutes: readings.filter(r => r.value_kw > lastThreshold).length },
        ]
    }

    // Step 13: build the ECharts config for a given bucket array
    const buildChartOption = (buckets: { label: string, minutes: number }[]) => ({
        backgroundColor: '#1e1e2e',
        tooltip: {
            trigger: 'axis',
            formatter: (params: any) => `${params[0].name}: ${params[0].value} min`,
        },
        xAxis: {
            type: 'category',
            data: buckets.map(b => b.label),
            axisLabel: { color: '#e2e8f0', fontSize: 13 },
        },
        yAxis: {
            type: 'value',
            name: 'Minutes',
            nameTextStyle: { color: '#e2e8f0', fontSize: 13 },
            axisLabel: { color: '#e2e8f0', fontSize: 13 },
        },
        series: [{
            type: 'bar',
            data: buckets.map(b => b.minutes),
            name: 'Time spent',
        }],
    })

    return (
        <div className="w-full px-8 py-10">
            <h1 className="text-2xl font-bold mb-2">Energy Data Visualization</h1>
            <p className="text-sm opacity-60 mb-8">Select a date range to visualize energy consumption data.</p>

            {/* Step 14: spinner while the initial date range loads */}
            {loading && <LoadingIcon />}

            {/* Step 15: error banner if date-range fetch failed */}
            {error && (
                <div className="mt-4 text-sm p-3 rounded-lg bg-error/20 text-error">
                    {error}
                </div>
            )}
            {availableRange && (
                <div className="flex flex-col gap-6">
                    <div className="max-w-md flex flex-col gap-4">
                        <div className="text-sm p-3 rounded-lg bg-base-200">
                            Available data: <span className="font-bold">{availableRange.from}</span> — <span className="font-bold">{availableRange.to}</span>
                        </div>

                        {/* Step 16: when user changes dates, clear the chart and machine selection */}
                        <DateRangePicker
                            value={selectedRange}
                            onChange={(range) => {
                                setSelectedRange(range)
                                setMachineReadings(null)
                                setSelectedMachine(null)
                            }}

                            showClear={false}
                            disabledDates={(date) => {
                                const d = date.toISOString().split('T')[0]
                                return d < availableRange.from || d > availableRange.to
                            }}
                        />

                        {/* Step 17: Proceed button — only shown once both dates are picked */}
                        {selectedRange.from && selectedRange.to && (
                            <button className="btn btn-primary w-fit" onClick={handleProceed}>
                                Proceed
                            </button>
                        )}
                    </div>

                    {/* Step 18: spinner while readings are loading */}
                    {chartLoading && <LoadingIcon />}

                    {/* Step 19: machine selector — populated from Django's response */}
                    {machineReadings && (
                        <div className="max-w-md flex flex-col gap-2">
                            <label className="text-sm font-semibold">Select a machine</label>
                            <div className="dropdown w-full">
                                <div tabIndex={0} role="button" className="btn btn-outline w-full justify-between font-normal">
                                    {selectedMachine ?? 'Choose a machine...'}
                                </div>
                                <ul tabIndex={0} className="dropdown-content menu bg-black rounded-box z-50 w-full p-2 shadow-lg max-h-60 overflow-y-auto flex-nowrap">
                                    {machineReadings.map(m => (
                                        <li key={m.machine}>
                                            <button onClick={() => {
                                                setSelectedMachine(m.machine)
                                                ;(document.activeElement as HTMLElement)?.blur()
                                            }}>
                                                {m.machine}
                                            </button>

                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    )}

                    {/* Step 20: error banner if readings fetch failed */}
                    {chartError && (
                        <div className="text-sm p-3 rounded-lg bg-error/20 text-error">{chartError}</div>
                    )}

                    {/* Step 21: render the chart only for the selected machine */}
                    {machineReadings && selectedMachine && (() => {
                        const m = machineReadings.find(m => m.machine === selectedMachine)
                        if (!m) return null
                        return (
                            <div className="mt-4 bg-base-100 rounded-xl p-4">
                                <h2 className="text-lg font-semibold">{m.machine}</h2>
                                <p className="text-sm opacity-60 mb-3">
                                    {new Date(selectedRange.from!).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} – {new Date(selectedRange.to!).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                </p>

                                <ReactECharts option={buildChartOption(computeBuckets(m.readings))} style={{ height: 400 }} />
                            </div>
                        )
                    })()}
                </div>
            )}
        </div>
    )
}
