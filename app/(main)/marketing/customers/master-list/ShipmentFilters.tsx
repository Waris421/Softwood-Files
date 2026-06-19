'use client'
import { useState } from "react"
import { SingleDropdown } from "@/_components/Dropdown/Dropdown"
import MonthRangePicker from "./MonthRangePicker"
import CountrySelector from "./CountrySelector"
import { useRouter, useSearchParams } from "next/navigation"
import EntitySelector from "./EntitySelector"

const categories = [{ value: 'Woven', label: 'Woven' }, { value: 'Knit', label: 'Knit' }]

export default function ShipmentFilters() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [from, setFrom] = useState<string | null>(() => searchParams.get('from'))
    const [to,   setTo  ] = useState<string | null>(() => searchParams.get('to'))
    const [selectedCategory, setSelectedCategory] = useState<string | null>(() =>
        searchParams.get('categories[]')
    )
    const [selectedCountries, setSelectedCountries] = useState<string[]>(() =>
        searchParams.getAll('countries[]')
    )
    const [selectedImporters, setSelectedImporters] = useState<string[]>(() =>
        searchParams.getAll('importers[]')
    )
    const [selectedExporters, setSelectedExporters] = useState<string[]>(() =>
        searchParams.getAll('exporters[]')
    )

    // resetKey forces SingleDropdown to remount and show its placeholder again when Reset is clicked.
    // Without this, the dropdown would visually still show the old selection even after state is cleared.
    const [resetKey, setResetKey] = useState(0)
    const handleFilter = () => {
        const params = new URLSearchParams()
        if (from) params.set('from', from)
        if (to)   params.set('to', to)
        if (selectedCategory) params.append('categories[]', selectedCategory)
        selectedCountries.forEach(c => params.append('countries[]', c))
        selectedImporters.forEach(i => params.append('importers[]', i))
        selectedExporters.forEach(e => params.append('exporters[]', e))
        router.push(`?${params.toString()}`)
    }

    // Clears local state, remounts dropdowns, and removes all URL params — table reloads unfiltered.
    const handleReset = () => {
        setFrom(null)
        setTo(null)
        setSelectedCategory(null)
        setSelectedCountries([])
        setSelectedImporters([])
        setSelectedExporters([])
        setResetKey(k => k + 1)
        router.push('/marketing/customers/master-list')
    }

    return (
        <div className="flex flex-wrap gap-4 items-start mt-6 mb-2">

            {/* ── Left filter card: Category + Filter/Reset only ── */}
            <div className="border border-base-300 rounded-lg p-4 shrink-0 w-56 flex flex-col gap-4">
                <MonthRangePicker
                    from={from}
                    to={to}
                    onChange={(f, t) => { setFrom(f); setTo(t) }}
                />
                <div>
                    <p className="font-semibold text-sm mb-2">Category</p>
                    <SingleDropdown
                        key={`category-${resetKey}`}
                        inputName="filterCategory"
                        isStatic
                        staticOptions={categories}
                        placeholder="Category"
                        widthClass="w-full"
                        onSelect={(o) => setSelectedCategory(o?.value ?? null)}
                    />
                </div>

                <div className="flex gap-2 mt-auto">
                    <button onClick={handleFilter} className="btn btn-primary btn-sm flex-1">Filter</button>
                    <button onClick={handleReset} className="btn btn-success btn-sm flex-1">Reset</button>
                </div>
            </div>
            {/* ── Entity selector cards ── */}
            <CountrySelector selected={selectedCountries} onChange={setSelectedCountries} />
            <EntitySelector
                title="Importers"
                endpoint="/api/marketing/export-data/importers"
                nameKey="Importer"
                selected={selectedImporters}
                onChange={setSelectedImporters}
            />
            <EntitySelector
                title="Exporters"
                endpoint="/api/marketing/export-data/exporters"
                nameKey="Exporter"
                selected={selectedExporters}
                onChange={setSelectedExporters}
            />

        </div>
    )
}
