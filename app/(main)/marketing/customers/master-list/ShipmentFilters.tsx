'use client'
import { useState, useEffect } from "react"
import { SingleDropdown, MultiDropdown } from "@/_components/Dropdown/Dropdown"
import CountrySelector from "./CountrySelector"
import { useRouter, useSearchParams } from "next/navigation"
import EntitySelector from "./EntitySelector"

const categories = [{ value: 'Woven', label: 'Woven' }, { value: 'Knit', label: 'Knit' }]

export default function ShipmentFilters() {
    const router = useRouter()
    const searchParams = useSearchParams()
    // Seed full month strings from URL: "Jan-2025", "Feb-2025", etc.
    const [selectedMonths, setSelectedMonths] = useState<string[]>(() => {
        const raw = searchParams.getAll('months[]')
        return [...new Set(raw.filter(Boolean))]
    })
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
    const [monthOptions, setMonthOptions] = useState<{ value: string; label: string }[]>([])
    useEffect(() => {
        fetch('/api/marketing/export-data/months')
            .then(r => r.json())
            .then(data => {
                if (!Array.isArray(data)) return
                setMonthOptions(data.map((m: { Month: string }) => ({ value: m.Month, label: m.Month })))
                if (selectedMonths.length === 0) {
                    const defaults = data
                        .filter((m: { Checked: boolean }) => m.Checked)
                        .map((m: { Month: string }) => m.Month)
                    if (defaults.length > 0) setSelectedMonths(defaults)
                }
            })
            .catch(() => {})
    }, [])

    const handleFilter = () => {
        const params = new URLSearchParams()
        selectedMonths.forEach(m => params.append('months[]', m))
        if (selectedCategory) params.append('categories[]', selectedCategory)
        selectedCountries.forEach(c => params.append('countries[]', c))
        selectedImporters.forEach(i => params.append('importers[]', i))
        selectedExporters.forEach(e => params.append('exporters[]', e))
        router.push(`?${params.toString()}`)
    }

    // Clears local state, remounts dropdowns, and removes all URL params — table reloads unfiltered.
    const handleReset = () => {
        setSelectedMonths([])
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
                <div>
                    <p className="font-semibold text-sm mb-2">Month</p>
                    <MultiDropdown
                        key={`months-${resetKey}`}
                        inputName="filterMonths"
                        isStatic
                        staticOptions={monthOptions}
                        defaultValues={selectedMonths}
                        placeholder="Select months"
                        widthClass="w-full"
                        onSelect={(opts: any[]) => setSelectedMonths((opts ?? []).map((o: any) => o.value))}
                    />
                </div>
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
