'use client'
// Generic selector for Importers and Exporters — same layout as CountrySelector.
// nameKey tells it which response field to use as display label and URL value.
import { useState, useEffect, useMemo } from "react"
import { cn } from "@/_components/generic/utils"
import { Checkbox } from "@/_components/ui/checkbox"
import { useSearchParams } from "next/navigation"
import { THEME } from "@/_components/constants/ui"

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
    const [items, setItems] = useState<{ name: string; Quantity: string; Price: string | number }[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')

    // Fetch on mount — plucks nameKey from each response object to get a flat string array
    // Re-fetches when applied URL filters change — Django uses them to filter and sort the list
    useEffect(() => {
        setLoading(true)
        fetch(`${endpoint}?${searchParamsString}`)
            .then(r => r.json())
            .then(data => setItems(
                Array.isArray(data) ? data.map((d: Record<string, any>) => ({
                    name: d[nameKey],
                    Quantity: d.Quantity,
                    Price: d.Price,
                })).filter(item => item.name) : []
            ))
            .catch(() => {})
            .finally(() => setLoading(false))
    }, [endpoint, nameKey, searchParamsString])

    const filtered = useMemo(() => {
        const q = search.toLowerCase()
        const matches = q ? items.filter(item => item.name.toLowerCase().includes(q)) : items
        return matches.slice(0, 50)
    }, [items, selected, search])

    const allFilteredSelected = filtered.length > 0 && filtered.every(item => selected.includes(item.name))
    const isSomeFilteredSelected = filtered.length > 0 && filtered.some(item => selected.includes(item.name)) && !allFilteredSelected

    const handleSelectAll = () => {
        if (allFilteredSelected) {
            const filteredNames = new Set(filtered.map(item => item.name))
            onChange(selected.filter(n => !filteredNames.has(n)))
        } else {
            onChange([...new Set([...selected, ...filtered.map(item => item.name)])])
        }
    }

const toggle = (name: string) =>
    onChange(selected.includes(name) ? selected.filter(n => n !== name) : [...selected, name])

    return (
        <div className="card shadow-xl border border-base-200 rounded-lg w-full max-w-sm bg-base-100">
            <div className="card-body p-4 flex flex-col h-96 max-h-96">
                <div className="z-20 pb-2 border-b border-base-300 bg-base-100">
                    <div className="flex items-center justify-between py-2 px-1">
                        <span className="text-xs font-bold text-base-content/70">{title}</span>
                        <div className="flex items-center justify-center size-8">
                            <Checkbox
                                className="size-8 border-base-200"
                                checked={allFilteredSelected ? true : isSomeFilteredSelected ? "indeterminate" : false}
                                onCheckedChange={handleSelectAll}
                            />
                        </div>

                    </div>
                    <input
                        type="text"
                        placeholder={`Search ${title.toLowerCase()}...`}
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className={cn(THEME.TextInput, "w-full mt-1")}
                    />
                </div>

                {loading && (
                    <div className="flex flex-col gap-2 pt-2">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} className="h-8 rounded bg-base-300 animate-pulse" />
                        ))}
                    </div>
                )}

                {!loading && (
                    <div className="overflow-y-auto grow pr-1 Custom-scrollbar">
                        <table className="table table-compact w-full">
                            <tbody>
                                {filtered.length === 0 ? (
                                    <tr>
                                        <td colSpan={2} className="text-center py-8 text-xs text-base-content/50">
                                            No results found
                                        </td>
                                    </tr>
                                ) : (
                                    filtered.map((item) => (
                                        <tr
                                            key={item.name}
                                            className="cursor-pointer transition-colors border-b border-base-200 hover:bg-base-200 bg-base-100"
                                            onClick={() => toggle(item.name)}
                                        >
                                            <td className="py-2">
                                                <div className="font-medium text-sm text-base-content">
                                                    {item.name}
                                                </div>
                                                <div className="text-xs text-base-content/60 mt-0.5">
                                                    {item.Quantity} @ ${parseFloat(String(item.Price)).toFixed(2)}
                                                </div>
                                            </td>
                                            <td className="text-center py-2 align-middle" onClick={(e) => e.stopPropagation()}>
                                                <Checkbox
                                                    className="size-5 border-base-200"
                                                    checked={selected.includes(item.name)}
                                                    onCheckedChange={() => toggle(item.name)}
                                                />
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    )
}
