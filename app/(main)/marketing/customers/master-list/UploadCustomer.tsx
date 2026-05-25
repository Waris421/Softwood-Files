'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import { SingleDropdown } from "@/_components/Dropdown/Dropdown"

const months = [
    { value: '1', label: 'January' }, { value: '2', label: 'February' },
    { value: '3', label: 'March' }, { value: '4', label: 'April' },
    { value: '5', label: 'May' }, { value: '6', label: 'June' },
    { value: '7', label: 'July' }, { value: '8', label: 'August' },
    { value: '9', label: 'September' }, { value: '10', label: 'October' },
    { value: '11', label: 'November' }, { value: '12', label: 'December' },
]
const years = [2022, 2023, 2024, 2025, 2026].map(y => ({ value: String(y), label: String(y) }))

export default function UploadCustomer() {
    const router = useRouter()
    const [showSummaryMenu, setShowSummaryMenu] = useState(false)
    const [summaryMonth, setSummaryMonth] = useState<string | null>(null)
    const [summaryYear, setSummaryYear] = useState<string | null>(null)
    const [importerMonth, setImporterMonth] = useState<string | null>(null)
    const [importerYear, setImporterYear] = useState<string | null>(null)
    const [activePicker, setActivePicker] = useState<'summary' | 'importer' | null>(null)

    return (
        <div className="max-w-2xl py-6">
            <div className="flex gap-3">
                <button
                    onClick={() => { setShowSummaryMenu(!showSummaryMenu); setActivePicker(null) }}
                    className="btn btn-secondary"
                >
                    Summary ▼
                </button>
            </div>

            {showSummaryMenu && (
                <div className="mt-2 w-fit bg-base-200 rounded-lg p-2 flex flex-col gap-1">
                    <button onClick={() => { setShowSummaryMenu(false); setActivePicker('summary') }} className="text-left px-3 py-2 rounded hover:bg-base-300 text-sm">Exporter Data</button>
                    <button onClick={() => { setShowSummaryMenu(false); setActivePicker('importer') }} className="text-left px-3 py-2 rounded hover:bg-base-300 text-sm">Importer Data</button>
                    <button disabled className="text-left px-3 py-2 rounded text-sm opacity-40 cursor-not-allowed">Monthly Sales — Coming Soon</button>
                    <button disabled className="text-left px-3 py-2 rounded text-sm opacity-40 cursor-not-allowed">Yearly Sales — Coming Soon</button>
                </div>
            )}

            {activePicker === 'summary' && (
                <div className="mt-4 flex flex-col gap-3">
                    <p className="text-sm font-semibold">Select a month and year for Exporter Summary</p>
                    <div className="flex gap-3">
                        <SingleDropdown inputName="summaryMonth" isStatic staticOptions={months} placeholder="Month" widthClass="w-48" onSelect={(o) => setSummaryMonth(o?.value ?? null)} />
                        <SingleDropdown inputName="summaryYear" isStatic staticOptions={years} placeholder="Year" widthClass="w-36" onSelect={(o) => setSummaryYear(o?.value ?? null)} />
                    </div>
                    {summaryMonth && summaryYear && (
                        <button onClick={() => router.push(`/marketing/shipments/summary?month=${summaryMonth}&year=${summaryYear}`)} className="btn btn-secondary w-fit">View Summary</button>
                    )}
                </div>
            )}

            {activePicker === 'importer' && (
                <div className="mt-4 flex flex-col gap-3">
                    <p className="text-sm font-semibold">Select a month and year for Importer Summary</p>
                    <div className="flex gap-3">
                        <SingleDropdown inputName="importerMonth" isStatic staticOptions={months} placeholder="Month" widthClass="w-48" onSelect={(o) => setImporterMonth(o?.value ?? null)} />
                        <SingleDropdown inputName="importerYear" isStatic staticOptions={years} placeholder="Year" widthClass="w-36" onSelect={(o) => setImporterYear(o?.value ?? null)} />
                    </div>
                    {importerMonth && importerYear && (
                        <button onClick={() => router.push(`/marketing/shipments/importer-summary?month=${importerMonth}&year=${importerYear}`)} className="btn btn-secondary w-fit">View Summary</button>
                    )}
                </div>
            )}
        </div>
    )
}
