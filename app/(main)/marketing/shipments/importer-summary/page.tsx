'use client'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import ReactECharts from 'echarts-for-react'
import LoadingIcon from '@/_components/generic/Loading'

type ImporterEntry = {
    Importer: string        // <-- was Exporter
    TotalQuantity: number
    TotalValue: number
    Currency: string
    Percentage: number
}

type SummaryData = {
    month: number
    year: number
    totalQuantity: number
    currency: string
    data: ImporterEntry[]   // <-- was ExporterEntry[]
}

export default function ImporterSummary() {   // <-- was ShipmentSummary
    const searchParams = useSearchParams()
    const month = searchParams.get('month')
    const year = searchParams.get('year')

    const [summary, setSummary] = useState<SummaryData | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (!month || !year) return
        const fetchSummary = async () => {
            try {
                const res = await fetch(`/api/marketing/shipments/importer-summary?month=${month}&year=${year}`)  // <-- new API route
                if (!res.ok) throw new Error('Failed to load summary')
                const data = await res.json()
                setSummary(data)
            } catch (err: any) {
                setError(err.message)
            } finally {
                setLoading(false)
            }
        }
        fetchSummary()
    }, [month, year])

    const toMillions = (n: number) => `${(n / 1_000_000).toFixed(1)}M`

    const buildPieOption = (data: ImporterEntry[]) => ({
        backgroundColor: '#1e1e2e',
        tooltip: {
            trigger: 'item',
            formatter: (params: any) => {
                const entry = data[params.dataIndex]
                return `${params.name}<br/>Share: ${params.percent}%<br/>Quantity: ${toMillions(entry.TotalQuantity)}`
            }
        },
        legend: { show: false },
        series: [{
            type: 'pie',
            radius: '70%',
            center: ['50%', '50%'],
            data: data.map(e => ({ name: e.Importer, value: e.Percentage })),  // <-- was e.Exporter
            label: { color: '#e2e8f0' },
            emphasis: {
                itemStyle: { shadowBlur: 10, shadowColor: 'rgba(0,0,0,0.5)' }
            }
        }]
    })

    const monthName = month ? new Date(2000, parseInt(month) - 1).toLocaleString('en-US', { month: 'long' }) : ''

    return (
        <div className="w-full px-8 py-10">
            <h1 className="text-2xl font-bold mb-1">Importer Summary</h1>   {/* <-- was Exporter Summary */}
            <p className="text-sm opacity-60 mb-8">{monthName} {year}</p>

            {loading && <LoadingIcon />}
            {error && <div className="text-sm p-3 rounded-lg bg-error/20 text-error">{error}</div>}

            {summary && (
                <div className="flex flex-col gap-6">
                    <div className="text-sm p-4 rounded-lg bg-base-200 w-fit">
                        Total Quantity: <span className="font-bold">{toMillions(summary.totalQuantity)}</span>
                    </div>
                    <div className="bg-base-100 rounded-xl p-4">
                        <ReactECharts option={buildPieOption(summary.data)} style={{ height: 650 }} />
                    </div>
                </div>
            )}
        </div>
    )
}
