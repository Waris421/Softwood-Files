'use client'

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ColumnDef } from "@tanstack/react-table"
import { Cell } from "@tanstack/react-table"
import { DataTable } from "@/_components/table/Table"
import { DatePicker } from "@/_components/Datepicker/Datepicker"
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import ActionDialog from "@/_components/DialogBox/ActionDialog"

type PurchaseOrder = {
    PONumber: number
    OrderDate: string
    Supplier: string
    ItemName: string
    ItemCode: string
    WorkOrder: string | null
}

type Allocation = {
    WorkOrder: number
    Style: string
    Quantity: number
    Amount: number
}

type POItem = {
    Inventory: string
    Variant: string
    Quantity: number
    Price: number
    Amount: number
    AmountDifference: number
    allocations: Allocation[]
}

type PODetail = {
    PONumber: number
    OrderDate: string
    Supplier: string
    Currency: string
    Tax: number
    NetAmount: number
    TaxAmount: number
    GrandTotal: number
    items: POItem[]
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
    const [poDetail, setPODetail] = useState<PODetail | null>(null)
    const [detailLoading, setDetailLoading] = useState(false)


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
        setPODetail(null)
        setDetailLoading(true)
        fetch(`/api/finance/purchase-order/${cell.row.original.PONumber}`)
            .then(res => res.json())
            .then(data => setPODetail(data))
            .finally(() => setDetailLoading(false))
    }

    // Download PDF Function
    const downloadPDF = () => {
        if (!poDetail) return
        const doc = new jsPDF()
        const pageWidth = doc.internal.pageSize.width
        doc.setFontSize(20)
        doc.setFont('helvetica', 'bold')
        doc.text('Softwood Pvt', pageWidth / 2, 20, { align: 'center' })
        doc.setFontSize(14)
        doc.setFont('helvetica', 'normal')
        doc.text(`Purchase Order #${poDetail.PONumber}`, pageWidth / 2, 30, { align: 'center' })
        doc.setFontSize(10)
        doc.text(`Order Date: ${poDetail.OrderDate}`, 14, 44)
        doc.text(`Supplier: ${poDetail.Supplier}`, 14, 51)
        doc.text(`Tax Rate: ${poDetail.Tax}%`, 14, 58)
        let currentY = 70
        poDetail.items.forEach(item => {
            autoTable(doc, {
                startY: currentY,
                head: [['Inventory', 'Variant', 'Quantity', 'Price', 'Amount', 'Difference']],
                body: [[item.Inventory, item.Variant, item.Quantity, `${poDetail.Currency} ${item.Price}`, `${poDetail.Currency} ${item.Amount}`, `${poDetail.Currency} ${item.AmountDifference}`]],
            })
            autoTable(doc, {
                startY: (doc as any).lastAutoTable.finalY + 2,
                head: [['Work Order', 'Variant', 'Quantity', 'Amount']],
                body: item.allocations.map(a => [a.WorkOrder, item.Variant, a.Quantity, `${poDetail.Currency} ${a.Amount}`]),
            })
            currentY = (doc as any).lastAutoTable.finalY + 10
        })
        const afterAllocations = currentY
        doc.setFontSize(10)
        doc.setFont('helvetica', 'normal')
        doc.text(`Net Amount: ${poDetail.Currency} ${poDetail.NetAmount}`, pageWidth - 14, afterAllocations, { align: 'right' })
        doc.text(`Tax Amount: ${poDetail.Currency} ${poDetail.TaxAmount}`, pageWidth - 14, afterAllocations + 7, { align: 'right' })
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(12)
        doc.text(`Grand Total: ${poDetail.Currency} ${poDetail.GrandTotal}`, pageWidth - 14, afterAllocations + 16, { align: 'right' })
        doc.save(`PO-${poDetail.PONumber}.pdf`)
    }

    // Download CSV Function
    const downloadCSV = () => {
        if (!poDetail) return
        const sections = poDetail.items.map(item => {
            const itemRow = [item.Inventory, item.Variant, item.Quantity, item.Price, item.Amount, item.AmountDifference].join(',')
            const allocHeader = 'Work Order,Variant,Quantity,Amount'
            const allocRows = item.allocations.map(a =>
                [a.WorkOrder, item.Variant, a.Quantity, a.Amount].join(',')
            ).join('\n')
            return `Inventory,Variant,Quantity,Price,Amount,AmountDifference\n${itemRow}\n${allocHeader}\n${allocRows}`
        })
        const csv = sections.join('\n\n')
        const blob = new Blob([csv], { type: 'text/csv' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `PO-${poDetail.PONumber}.csv`
        a.click()
        URL.revokeObjectURL(url)
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
                    { label: detailLoading ? 'Loading...' : 'Download PDF', subLabel: 'Download as PDF', onClick: downloadPDF },
                    { label: detailLoading ? 'Loading...' : 'Download CSV', subLabel: 'Download as CSV', onClick: downloadCSV },
                ]}

                anchorRef={anchorRef ? { current: anchorRef } : undefined}
            />
        )}
    </div>
)}