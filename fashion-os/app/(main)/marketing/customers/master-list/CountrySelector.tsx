'use client'
// Renders a searchable, horizontally-scrolling country list with checkboxes.
// Selected state lives in the parent (ShipmentFilters) — this component only reads and fires onChange.
import { useState, useEffect, useMemo } from "react"
import { Check } from "lucide-react"
import { useSearchParams } from "next/navigation"

type CountryItem = { CountryCode: string; CountryName: string }

// Splits a flat array into groups of n — used to build the column layout
const chunk = <T,>(arr: T[], n: number): T[][] =>
    Array.from({ length: Math.ceil(arr.length / n) }, (_, i) => arr.slice(i * n, (i + 1) * n))

export default function CountrySelector({ selected, onChange }: { selected: string[]; onChange: (codes: string[]) => void }) {
    const searchParams = useSearchParams()
    const searchParamsString = searchParams.toString()
    const [countries, setCountries] = useState<CountryItem[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')

    // Fetch the full country list once on mount — all filtering is done client-side after this
    // Re-fetches whenever the applied URL filters change — passes them to Django so the list reflects active filters
    useEffect(() => {
        setLoading(true)
        fetch(`/api/marketing/export-data/countries?${searchParamsString}`)
            .then(r => r.json())
            .then(data => setCountries(Array.isArray(data) ? data : []))
            .catch(() => {})
            .finally(() => setLoading(false))
    }, [searchParamsString])

    // Recalculates only when countries/selected/search change — not on every render
    // Selected countries float to top; unselected follow in original (quantity-desc) order
    const filtered = useMemo(() => {
        const q = search.toLowerCase()
        const matches = q
            ? countries.filter(c =>
                c.CountryName.toLowerCase().includes(q) ||
                c.CountryCode.toLowerCase().includes(q))
            : countries
        const sel = new Set(selected)
        return [
            ...matches.filter(c => sel.has(c.CountryCode)),
            ...matches.filter(c => !sel.has(c.CountryCode)),
        ]
    }, [countries, selected, search])

    // True only when every country in the current filtered list is already selected
    const allFilteredSelected = filtered.length > 0 && filtered.every(c => selected.includes(c.CountryCode))

    // Selects all filtered countries if any are unselected; deselects them if all are already selected
    // Uses Set to avoid duplicates when merging with already-selected countries outside the search
    const handleSelectAll = () => {
        if (allFilteredSelected) {
            const filteredCodes = new Set(filtered.map(c => c.CountryCode))
            onChange(selected.filter(c => !filteredCodes.has(c)))
        } else {
            onChange([...new Set([...selected, ...filtered.map(c => c.CountryCode)])])
        }
    }

    // Adds or removes a single country code from the selected array
    const toggle = (code: string) =>
        onChange(selected.includes(code) ? selected.filter(c => c !== code) : [...selected, code])

    return (
        <div className="border border-base-300 rounded-lg p-4 w-72 shrink-0">

            {/* Header: title on left, Select All button on right — button fills when all are selected */}
            <div className="flex justify-between items-center mb-3">
                <span className="font-bold">Country</span>
                <button
                    onClick={handleSelectAll}
                    className={`btn btn-sm btn-square ${allFilteredSelected ? 'btn-primary' : 'btn-outline'}`}
                    title={allFilteredSelected ? 'Deselect all' : 'Select all'}
                >
                    <Check size={14} />
                </button>
            </div>

            {/* Search filters the list client-side — matches on country name or 2-letter code */}
            <input
                type="text"
                placeholder="Type to search"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="input input-bordered input-sm w-full mb-3"
            />

            {/* Countries in columns of 5, scrolling horizontally — minWidth prevents columns from wrapping */}
            <div className="overflow-x-auto pb-2">
                <div className="flex gap-4" style={{ minWidth: 'max-content' }}>
                    {loading
                        ? Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="flex flex-col gap-2 w-32">
                                {Array.from({ length: 5 }).map((_, j) => (
                                    <div key={j} className="h-4 rounded bg-base-300 animate-pulse" />
                                ))}
                            </div>
                        ))
                        : filtered.length === 0
                            ? <p className="text-sm opacity-50 py-4">No countries found</p>
                            : chunk(filtered, 5).map((group, i) => (
                                <div key={i} className="flex flex-col gap-2 w-32">
                                    {group.map(c => (
                                        <label key={c.CountryCode} className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={selected.includes(c.CountryCode)}
                                                onChange={() => toggle(c.CountryCode)}
                                                className="checkbox checkbox-xs"
                                            />
                                            <span className="text-sm truncate">{c.CountryName}</span>
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
