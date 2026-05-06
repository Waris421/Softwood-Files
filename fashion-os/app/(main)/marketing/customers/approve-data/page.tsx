'use client'
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { AlertTriangle } from "lucide-react"

type PendingSummary = {
    numberOfEntries: string
    months: string
    totalQty: string
    Price: string
    frequentHSCode: string
    frequentItem: string
    addedMonths: string   // empty string means no conflict
}

export default function ApproveDataPage() {
    const router = useRouter()
    const [status, setStatus] = useState<'loading' | 'empty' | 'ready' | 'confirming' | 'error'>('loading')
    const [summary, setSummary] = useState<PendingSummary | null>(null)
    const [errorMsg, setErrorMsg] = useState<string | null>(null)

    // Fetch pending summary on page load
    useEffect(() => {
        const load = async () => {
            try {
                const res = await fetch('/api/marketing/export-data/pending')
                if (res.status === 404) { setStatus('empty'); return }
                if (!res.ok) throw new Error('Failed to load pending data.')
                const data = await res.json()
                setSummary(data)
                setStatus('ready')
            } catch (err: any) {
                setErrorMsg(err.message)
                setStatus('error')
            }
        }
        load()
    }, [])

    // Sends approve or reject then redirects on success
    const handleConfirm = async (action: 'approve' | 'reject') => {
        setStatus('confirming')
        setErrorMsg(null)
        try {
            const res = await fetch('/api/marketing/export-data/confirm', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action }),
            })
            const data = await res.json().catch(() => ({}))
            if (!res.ok) throw new Error(data.message || 'Action failed.')
            router.push('/marketing/customers/master-list')
        } catch (err: any) {
            setErrorMsg(err.message)
            setStatus('ready')   // re-enable buttons so user can retry
        }
    }

    return (
        <div className="w-full px-8 py-10">
            <h1 className="text-2xl font-bold mb-2">Approve Data</h1>
            <p className="text-sm opacity-60 mb-6">Review and approve pending shipment uploads.</p>

            {/* Loading spinner */}
            {status === 'loading' && <p className="text-sm opacity-60">Loading...</p>}

            {/* Empty state — 404 from backend */}
            {status === 'empty' && <p className="text-sm opacity-60">No data pending approval.</p>}

            {/* Fetch error */}
            {status === 'error' && <p className="text-sm text-error">{errorMsg}</p>}

            {/* Summary card — shown when data is ready or confirm is in flight */}
            {(status === 'ready' || status === 'confirming') && summary && (
                <div className="max-w-lg flex flex-col gap-3">

                    {/* Duplicate month warning — only shown when addedMonths is non-empty */}
                    {summary.addedMonths && (
                        <div className="flex items-start gap-2 text-sm p-3 rounded-lg bg-warning/20 text-warning">
                            <AlertTriangle size={16} className="mt-0.5 shrink-0" />
                            Data for the following months already exists: {summary.addedMonths}
                        </div>
                    )}

                    {/* Summary fields */}
                    <div className="p-4 rounded-lg bg-base-200 flex flex-col gap-2 text-sm">
                        <div>Months: <span className="font-bold">{summary.months}</span></div>
                        <div>Entries: <span className="font-bold">{summary.numberOfEntries}</span></div>
                        <div>Total Quantity: <span className="font-bold">{summary.totalQty}</span></div>
                        <div>Price: <span className="font-bold">{summary.Price}</span></div>
                        <div>Frequent HS Code: <span className="font-bold">{summary.frequentHSCode}</span></div>
                        <div>Frequent Item: <span className="font-bold">{summary.frequentItem}</span></div>
                    </div>

                    {/* Action error — shown if approve/reject POST fails */}
                    {errorMsg && (
                        <p className="text-sm text-error">{errorMsg}</p>
                    )}

                    {/* Approve and Reject buttons */}
                    <div className="flex gap-3">
                        <button
                            onClick={() => handleConfirm('approve')}
                            disabled={status === 'confirming'}
                            className="btn btn-success disabled:opacity-50"
                        >
                            {status === 'confirming' ? 'Saving...' : 'Approve'}
                        </button>
                        <button
                            onClick={() => handleConfirm('reject')}
                            disabled={status === 'confirming'}
                            className="btn btn-error disabled:opacity-50"
                        >
                            Reject
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
