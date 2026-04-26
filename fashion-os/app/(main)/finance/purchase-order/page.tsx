'use client'

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ColumnDef } from "@tanstack/react-table"
import { Cell } from "@tanstack/react-table"
import { DataTable } from "@/_components/table/Table"
import { DatePicker } from "@/_components/Datepicker/Datepicker"

// Options for the Dialogue box on  clicking PO
import ActionDialog from "@/_components/DialogBox/ActionDialog"

// Labels for all the data taken
type POItem = {
    Inventory: string
    Variant: string
    Unit: string
    Quantity: number
    Price: number
    Amount: number
}

type PurchaseOrder = {
    PONumber: number
    OrderDate: string
    Supplier: string
    ItemName: string
    ItemCode: string
    WorkOrder: string | null
}



// Different visuals like a loading circle
export default function PurchaseOrders() {
    const router = useRouter()
    const [orders, setOrders] = useState<PurchaseOrder[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [startDate, setStartDate] = useState(`${new Date().getFullYear()}-01-01`)

    // State Variables for Dialogue Box
    const [isOpen, setIsOpen] = useState(false)
    const [selectedOrder, setSelectedOrder] = useState<PurchaseOrder | null>(null)
    const [anchorRef, setAnchorRef] = useState<HTMLElement | null>(null)

    // Step 1: Define table columns — accessorKey maps to top-level fields,
    // accessorFn is used for nested fields like items[].Inventory
    const columns: ColumnDef<PurchaseOrder>[] = [
        { accessorKey: 'PONumber', header: 'PO Number' },
        { accessorKey: 'OrderDate', header: 'Order Date' },
        { accessorKey: 'Supplier', header: 'Supplier' },
        { accessorKey: 'ItemName', header: 'Item Name' },
        { accessorKey: 'ItemCode', header: 'Item Code' },
    ]




    // Mapping Django Fields to coloumns
    useEffect(() => { // <-- Unnamed function that runs when the page loads and a date is given
        const fetchOrders = async () => {
            setLoading(true)
            setError(null)
            try {
                const res = await fetch(`/api/finance/purchase-order?start=${startDate}`)
                if (!res.ok) throw new Error('Failed to load purchase orders')
                const data = await res.json()
                setOrders(Array.isArray(data) ? data : data.results ?? [])
            } catch (err: any) {
                setError(err.message)
            } finally {
                setLoading(false)
            }
        }
        fetchOrders()
    }, [startDate])

    const dateFilter = (
        <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">POs After:</span>
            <DatePicker value={startDate} onChange={setStartDate} inputName="startDate" placeholder="Select date" />
        </div>
    )
    // Click Dialogue Function
    const onPOClick = (cell: Cell<PurchaseOrder, any>, e?: React.MouseEvent) => {
        setSelectedOrder(cell.row.original)
        if (e) setAnchorRef(e.currentTarget as HTMLElement)
        setIsOpen(true)
}


    // UI of the page
return (
    <div className="w-full px-8 py-10">
        <h1 className="text-2xl font-bold mb-2">Purchase Orders</h1>
        <DataTable
            columnClickHandlers={{ PONumber: onPOClick }}
            customActions={dateFilter}
            showPrint={false}
            showDownload={false}
            columns={columns}
            data={orders}
            isLoading={loading}
            error={error}
            pageSize={50}
            dropdownFilters={['Supplier']}
            searchFilters={['PONumber', 'ItemName', 'ItemCode']}
        />
        {isOpen && selectedOrder && (
            <ActionDialog
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                title={`PO #${selectedOrder.PONumber}`}
                description={`${selectedOrder.Supplier} — ${selectedOrder.OrderDate}`}
                actions={[
                    { label: selectedOrder.ItemName, subLabel: 'Item Name', onClick: () => {} },
                    { label: selectedOrder.ItemCode, subLabel: 'Item Code', onClick: () => {} },
                    { label: selectedOrder.Supplier, subLabel: 'Supplier', onClick: () => {} },
                    { label: 'View Full PO', subLabel: 'Opens detail page', onClick: () => router.push(`/finance/purchase-order/${selectedOrder.PONumber}`) },
                ]}

                anchorRef={anchorRef ? { current: anchorRef } : undefined}
            />
        )}
    </div>
)}




