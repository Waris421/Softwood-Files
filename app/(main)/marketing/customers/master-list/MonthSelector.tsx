'use client'
import { useState, useEffect, useMemo } from "react"
import { Check } from "lucide-react"

type MonthItem = { Month: string; Quantity: string; Checked: boolean }
type Props = {
    selected: string[]
    onChange: (months: string[]) => void
    contextParams: string
}

export default function MonthSelector({ selected, onChange, contextParams }: Props) {
    const [items, setItems] = useState<MonthItem[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')

    useEffect(() => {
        setLoading(true)
        fetch(`/api/marketing/export-data/months?${contextParams}`)
            .then(r => r.json())
            .then(data => {
                if (!Array.isArray(data)) return
                setItems(data)
                if (selected.length === 0) {
                    const defaults = data
                        .filter((m: MonthItem) => m.Checked)
                        .map((m: MonthItem) => m.Month)
                    if (defaults.length > 0) onChange(defaults)
                }
            })
            .catch(() => {})
            .finally(() => setLoading(false))
    }, [contextParams])
    const filtered = useMemo(() => {
        const q = search.toLowerCase()
        return q ? items.filter(m => m.Month.toLowerCase().includes(q)) : items
    }, [items, search])

    const allSelected = filtered.length > 0 && filtered.every(m => selected.includes(m.Month))

    const handleSelectAll = () => {
        if (allSelected) {
            const filteredSet = new Set(filtered.map(m => m.Month))
            onChange(selected.filter(s => !filteredSet.has(s)))
        } else {
            onChange([...new Set([...selected, ...filtered.map(m => m.Month)])])
        }
    }
    const toggle = (month: string) =>
        onChange(selected.includes(month) ? selected.filter(m => m !== month) : [...selected, month])
    return (
        <div className="border border-base-300 rounded-lg p-4 shrink-0 w-56 flex flex-col gap-3">
            <div className="flex justify-between items-center">
                <span className="font-bold text-sm">Month</span>
                <button
                    onClick={handleSelectAll}
                    className={`btn btn-sm btn-square ${allSelected ? 'btn-primary' : 'btn-outline'}`}
                    title={allSelected ? 'Deselect all' : 'Select all'}
                >
                    <Check size={14} />
                </button>
            </div>
            <input
                type="text"
                placeholder="Search months"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="input input-bordered input-sm w-full"
            />
            <div className="overflow-y-auto max-h-48 flex flex-col gap-1">
                {loading
                    ? Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="h-4 rounded bg-base-300 animate-pulse" />
                    ))
                    : filtered.map(item => (
                        <label key={item.Month} className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={selected.includes(item.Month)}
                                onChange={() => toggle(item.Month)}
                                className="checkbox checkbox-xs"
                            />
                            <span className="text-xs flex-1">{item.Month}</span>
                            <span className="text-xs opacity-50">{item.Quantity}</span>
                        </label>
                    ))}
            </div>
        </div>
    )
}

