// Fetches and displays garment shipment records in a table
'use client'

import { useEffect, useState } from "react"
import { ColumnDef } from "@tanstack/react-table"
import { DataTable } from "@/_components/table/Table"

// Step 1: define the shape of one shipment record — matches the Django API response fields exactly
type Shipment = {
    ShipDate: string
    Country: string
    Exporter: string
    Importer: string
    Quantity: number
    Rate: number
    Currency: string
    HSCode: string
    Description: string
}

export default function GarmentShipments() {

    // Step 2: stores the full list of shipments returned by Django
    const [shipments, setShipments] = useState<Shipment[]>([])

    // Step 3: defines the 9 columns — accessorKey maps to the field name from Django, header is the label shown on screen
    const columns: ColumnDef<Shipment>[] = [
        { accessorKey: 'ShipDate', header: 'Ship Date' },
        { accessorKey: 'Country', header: 'Origin' },
        { accessorKey: 'Exporter', header: 'Exporter' },
        { accessorKey: 'Importer', header: 'Importer' },
        { accessorKey: 'Quantity', header: 'Quantity' },
        { accessorKey: 'Rate', header: 'Price' },
        { accessorKey: 'Currency', header: 'Currency' },
        { accessorKey: 'HSCode', header: 'HS Code' },
        { accessorKey: 'Description', header: 'Description' },
    ]


    // Step 4: true while the fetch is in progress — DataTable shows a skeleton loader when this is true
    const [loading, setLoading] = useState(true)

    // Step 5: holds an error message if the fetch fails — DataTable shows it inside the table
    const [error, setError] = useState<string | null>(null)

    // Step 6: runs once when the page loads — fetches all shipment records from our API proxy
    useEffect(() => {
        const fetchShipments = async () => {
            try {
                const res = await fetch('/api/marketing/garment-shipments')
                if (!res.ok) throw new Error('Failed to load shipments')
                const data = await res.json()
                setShipments(Array.isArray(data) ? data : data.results ?? []) // handles both plain array and paginated Django responses
            } catch (err: any) {
                setError(err.message)
            } finally {
                setLoading(false) // always stop the spinner whether it succeeded or failed
            }
        }
        fetchShipments()
    }, [])

    return (
        <div className="w-full px-8 py-10">
            <h1 className="text-2xl font-bold mb-2">Garment Shipments</h1>
            <p className="text-sm opacity-60 mb-6">Showing all uploaded shipment records.</p>

            {/* Step 7: DataTable handles loading skeleton, error state, pagination, sorting and search automatically */}
            <DataTable
                columns={columns}
                data={shipments}
                isLoading={loading}
                error={error}
                pageSize={20} // How many rows per page
                searchFilters={['Exporter', 'Importer', 'Country']}
                dropdownFilters={['Currency']}
            />
        </div>
    )
}
