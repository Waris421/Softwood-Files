'use client'
// Generic selector for Importers and Exporters — same layout as CountrySelector.
// nameKey tells it which response field to use as display label and URL value.
import { useState, useEffect, useMemo } from "react"
import { Check } from "lucide-react"
import { useSearchParams } from "next/navigation"

const chunk = <T,>(arr: T[], n: number): T[][] =>
    Array.from({ length: Math.ceil(arr.length / n) }, (_, i) => arr.slice(i * n, (i + 1) * n))

type Props = {
    title: string
    endpoint: string
    nameKey: string
    selected: string[]
    onChange: (vals: string[]) => void
}

export default function EntitySelector({ title, endpoint, nameKey, selected, onChange }: Props) {
    const searchParams = useSearchParams()
    const searchParamsString = searchParams.toString()
    const [items, setItems] = useState<string[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')

    // Fetch on mount — plucks nameKey from each response object to get a flat string array
    // Re-fetches when applied URL filters change — Django uses them to filter and sort the list
    useEffect(() => {
        setLoading(true)
        fetch(`${endpoint}?${searchParamsString}`)
            .then(r => r.json())
            .then(data => setItems(
                Array.isArray(data) ? data.map((d: Record<string, string>) => d[nameKey]).filter(Boolean) : []
            ))
            .catch(() => {})
            .finally(() => setLoading(false))
    }, [endpoint, nameKey, searchParamsString])

    // Selected names float to top, then unselected in original (quantity-desc) order
    const filtered = useMemo(() => {
        const q = search.toLowerCase()
        const matches = q ? items.filter(name => name.toLowerCase().includes(q)) : items
        const sel = new Set(selected)
        return [
            ...matches.filter(name => sel.has(name)),
            ...matches.filter(name => !sel.has(name)),
        ]
    }, [items, selected, search])

    const allFilteredSelected = filtered.length > 0 && filtered.every(name => selected.includes(name))

    // Deselects filtered items if all selected; otherwise adds all filtered to selection
    const handleSelectAll = () => {
        if (allFilteredSelected) {
            const filteredSet = new Set(filtered)
            onChange(selected.filter(n => !filteredSet.has(n)))
        } else {
            onChange([...new Set([...selected, ...filtered])])
        }
    }

    const toggle = (name: string) =>
        onChange(selected.includes(name) ? selected.filter(n => n !== name) : [...selected, name])

    return (
        <div className="border border-base-300 rounded-lg p-4 w-72 shrink-0">

            <div className="flex justify-between items-center mb-3">
                <span className="font-bold">{title}</span>
                <button
                    onClick={handleSelectAll}
                    className={`btn btn-sm btn-square ${allFilteredSelected ? 'btn-primary' : 'btn-outline'}`}
                    title={allFilteredSelected ? 'Deselect all' : 'Select all'}
                >
                    <Check size={14} />
                </button>
            </div>

            <input
                type="text"
                placeholder="Type to search"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="input input-bordered input-sm w-full mb-3"
            />

            {/* Names in columns of 5, scrolling horizontally — w-40 for longer importer/exporter names */}
            <div className="overflow-x-auto pb-2">
                <div className="flex gap-4" style={{ minWidth: 'max-content' }}>
                    {loading
                        ? Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="flex flex-col gap-2 w-40">
                                {Array.from({ length: 5 }).map((_, j) => (
                                    <div key={j} className="h-4 rounded bg-base-300 animate-pulse" />
                                ))}
                            </div>
                        ))
                        : filtered.length === 0
                            ? <p className="text-sm opacity-50 py-4">No results found</p>
                            : chunk(filtered, 5).map((group, i) => (
                                <div key={i} className="flex flex-col gap-2 w-40">
                                    {group.map(name => (
                                        <label key={name} className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={selected.includes(name)}
                                                onChange={() => toggle(name)}
                                                className="checkbox checkbox-xs"
                                            />
                                            <span className="text-sm truncate">{name}</span>
                                        </label>
                                    ))}
                                </div>
                            ))
                    }
                </div>
            </div>

        </div>
    )
}
