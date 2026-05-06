'use client'
// Shows stats (Total Qty, Weighted Avg Price) on the left and the paginated details table on the right.
// On mount: fetches stats + page 1 in parallel. Changing page fetches only details.
import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Download } from "lucide-react"

type DetailRow = {
    Month: string
    Importer: string      // Django field name — displayed as "Customer" in the table header
    Exporter: string
    Description: string
    Quantity: string
    Price: number         // Django field name — displayed as "Rate" in the table header
}

type Stats = { quantity: string; price: number }

export default function ShipmentDetails() {
    const searchParams = useSearchParams()
    // Plain string used as useEffect dependency — string equality is reliable, object reference is not
    const searchParamsString = searchParams.toString()

    const [stats, setStats] = useState<Stats | null>(null)
    const [rows, setRows] = useState<DetailRow[]>([])

    // page = currently fetched page number
    // inputPage = string in the text input, kept separate so typing "3" → "39" doesn't fire two fetches
    const [page, setPage] = useState(1)
    const [inputPage, setInputPage] = useState('1')
    const [numberOfPages, setNumberOfPages] = useState(1)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // Copies all active filter params from the URL then sets the page number
    const buildDetailsQuery = (p: number) => {
        const params = new URLSearchParams(searchParams.toString())
        params.set('page', String(p))
        return params.toString()
    }

    // Returns the current URL filter params directly — used for stats fetch and download
    const buildStatsQuery = () => searchParams.toString()

    // Fetches one page of table rows from Django and updates rows + numberOfPages
    const fetchDetails = async (p: number) => {
        setLoading(true)
        setError(null)
        try {
            const res = await fetch(`/api/marketing/export-data/details?${buildDetailsQuery(p)}`)
            const data = await res.json()
            // Surface auth or server errors so they show instead of silently giving an empty table
            if (!res.ok) throw new Error(data.message || `Error ${res.status}`)
            setRows(Array.isArray(data.data) ? data.data : [])
            setNumberOfPages(data.numberOfPages ?? 1)
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    // Fetches stats and page 1 in parallel on first render so neither waits for the other
    useEffect(() => {
        // Reset to page 1 whenever filters change
        setPage(1)
        setInputPage('1')

        const fetchStats = async () => {
            try {
                const res = await fetch(`/api/marketing/export-data/stats?${buildStatsQuery()}`)
                const data = await res.json()
                if (res.ok) setStats(data)
            } catch {
                // silent — table still works without totals
            }
        }
        Promise.all([fetchStats(), fetchDetails(1)])
    }, [searchParamsString])   // ← reruns whenever the URL filter params change

    // Fires when user presses Enter or clicks away from the page input
    // Clamps value to 1–numberOfPages, resets to current page if user typed garbage
    const handlePageCommit = () => {
        const parsed = parseInt(inputPage, 10)
        if (isNaN(parsed)) { setInputPage(String(page)); return }
        const clamped = Math.max(1, Math.min(parsed, numberOfPages))
        setInputPage(String(clamped))
        if (clamped !== page) {
            setPage(clamped)
            fetchDetails(clamped)
        }
    }

    // Creates a temporary <a> tag pointing to the download route and clicks it
    // This triggers the browser's save-file dialog without navigating away from the page
    const handleDownload = () => {
        const a = document.createElement('a')
        // Include active filters so the download matches what's shown in the table
        a.href = `/api/marketing/export-data/download?${buildStatsQuery()}`
        a.click()
    }

    return (
        <div className="flex gap-8 mt-8">

            {/* ── Left column: stat blocks ── */}
            <div className="w-48 shrink-0 flex flex-col gap-6">
                <div>
                    <p className="text-sm opacity-60">Total Garment Quantity</p>
                    {/* Shows — while stats are still loading */}
                    <p className="text-4xl font-bold mt-1">{stats?.quantity ?? '—'}</p>
                    <p className="text-xs opacity-50 mt-1">Pieces</p>
                </div>
                <div>
                    <p className="text-sm opacity-60">Weighted Average Price</p>
                    <p className="text-4xl font-bold mt-1">{stats?.price ?? '—'}</p>
                    <p className="text-xs opacity-50 mt-1">USD</p>
                </div>
            </div>

            {/* ── Right column: table + pagination ── */}
            <div className="flex-1 min-w-0">

                {/* Error message — only shown when the details fetch fails */}
                {error && <p className="text-sm text-error mb-2">{error}</p>}

                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-base-300 text-left">
                                <th className="pb-2 pr-4 font-semibold whitespace-nowrap">Month</th>
                                <th className="pb-2 pr-4 font-semibold whitespace-nowrap">Customer</th>
                                <th className="pb-2 pr-4 font-semibold whitespace-nowrap">Exporter</th>
                                <th className="pb-2 pr-4 font-semibold">Description</th>
                                <th className="pb-2 pr-4 font-semibold text-right whitespace-nowrap">Qty</th>
                                <th className="pb-2 font-semibold text-right whitespace-nowrap">Rate</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                // 10 skeleton rows shown while data is loading — same height as real rows so layout doesn't jump
                                Array.from({ length: 10 }).map((_, i) => (
                                    <tr key={i} className="border-b border-base-200">
                                        {Array.from({ length: 6 }).map((_, j) => (
                                            <td key={j} className="py-2 pr-4">
                                                <div className="h-3 rounded bg-base-300 animate-pulse w-20" />
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            ) : (
                                rows.map((row, i) => (
                                    <tr key={i} className="border-b border-base-200 hover:bg-base-200/50">
                                        <td className="py-2 pr-4 whitespace-nowrap">{row.Month}</td>
                                        {/* max-w + truncate matches the backend's truncated display for long names */}
                                        <td className="py-2 pr-4 max-w-[120px] truncate">{row.Importer}</td>
                                        <td className="py-2 pr-4 max-w-[120px] truncate">{row.Exporter}</td>
                                        <td className="py-2 pr-4 max-w-[300px] truncate">{row.Description}</td>
                                        <td className="py-2 pr-4 text-right whitespace-nowrap">{row.Quantity}</td>
                                        <td className="py-2 text-right whitespace-nowrap">{row.Price}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* ── Pagination row — right-aligned under the table ── */}
                <div className="flex items-center justify-end gap-2 mt-3 text-sm">
                    <span className="opacity-60">Page:</span>
                    {/* Number input — fires fetch on Enter or blur, not on every keystroke */}
                    <input
                        type="number"
                        value={inputPage}
                        min={1}
                        max={numberOfPages}
                        onChange={e => setInputPage(e.target.value)}
                        onBlur={handlePageCommit}
                        onKeyDown={e => e.key === 'Enter' && handlePageCommit()}
                        className="input input-bordered input-sm w-16 text-center"
                    />
                    <span className="opacity-60">of {numberOfPages}</span>

                    {/* Download button — triggers browser save dialog via a temporary <a> tag */}
                    <button
                        onClick={handleDownload}
                        className="btn btn-ghost btn-sm btn-square"
                        title="Download CSV"
                    >
                        <Download size={16} />
                    </button>
                </div>

            </div>
        </div>
    )
}
