'use client'
import { useEffect, useState } from "react"
import { useParams } from "next/navigation"

// imports for downloading PDF
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

// Info on the data coming from Django

// Labels for Allocation table
type Allocation = {
    WorkOrder: number
    Style: string
    Quantity: number
    Price: number
    Amount: number
}

type POItem = {
    Inventory: string
    Variant: string
    Quantity: number
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

// Take PO number from URL and load the data
export default function PODetailPage() {
    const { id } = useParams()
    const [po, setPO] = useState<PODetail | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // Fetches the required information
    useEffect(() => {
        const fetchPO = async () => {
            try {
                const res = await fetch(`/api/finance/purchase-order/${id}`)
                if (!res.ok) throw new Error('Failed to load PO')
                const data = await res.json()
                setPO(data)
            } catch (err: any) {
                setError(err.message)
            } finally {
                setLoading(false)
            }
        }
        fetchPO()
    }, [id])
    
    // Download PDF option
    const downloadPDF = () => {
    if (!po) return

    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.width

    // Company name
    doc.setFontSize(20)
    doc.setFont('helvetica', 'bold')
    doc.text('Softwood Pvt', pageWidth / 2, 20, { align: 'center' })

    // PO number sub-heading
    doc.setFontSize(14)
    doc.setFont('helvetica', 'normal')
    doc.text(`Purchase Order #${po.PONumber}`, pageWidth / 2, 30, { align: 'center' })

    // Info section
    doc.setFontSize(10)
    doc.text(`Order Date: ${po.OrderDate}`, 14, 44)
    doc.text(`Supplier: ${po.Supplier}`, 14, 51)
    doc.text(`Tax Rate: ${po.Tax}%`, 14, 58)

    // Inventory table
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('Inventory', 14, 70)

    const inventoryMap: Record<string, number> = {}
    po.items.forEach(item => {
        inventoryMap[item.Inventory] = (inventoryMap[item.Inventory] || 0) + item.Quantity
    })

    autoTable(doc, {
        startY: 74,
        head: [['Inventory', 'Total Quantity']],
        body: Object.entries(inventoryMap).map(([name, qty]) => [name, qty]),
    })

    // Work Order Allocations table
    const afterInventory = (doc as any).lastAutoTable.finalY + 10
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('Work Order Allocations', 14, afterInventory)

    autoTable(doc, {
        startY: afterInventory + 4,
        head: [['Work Order', 'Variant', 'Quantity', 'Price', 'Amount', 'Supplier']],
        body: po.items.flatMap(item =>
            item.allocations.map(a => [
                a.WorkOrder,
                item.Variant,
                a.Quantity,
                `${po.Currency} ${a.Price}`,
                `${po.Currency} ${a.Amount}`,
                po.Supplier,
            ])
        ),
    })

    // Financial summary
    const afterAllocations = (doc as any).lastAutoTable.finalY + 10
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(`Net Amount: ${po.Currency} ${po.NetAmount}`, pageWidth - 14, afterAllocations, { align: 'right' })
    doc.text(`Tax Amount: ${po.Currency} ${po.TaxAmount}`, pageWidth - 14, afterAllocations + 7, { align: 'right' })
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(12)
    doc.text(`Grand Total: ${po.Currency} ${po.GrandTotal}`, pageWidth - 14, afterAllocations + 16, { align: 'right' })

    doc.save(`PO-${po.PONumber}.pdf`)
}

    
    // CSV Download option
    const downloadCSV = () => {
        if (!po) return

        // Step 1: Group items by Inventory name and sum their quantities
        // e.g. { "Fabric for Pants": 104 }
        const inventoryMap: Record<string, number> = {}
        po.items.forEach(item => {
            inventoryMap[item.Inventory] = (inventoryMap[item.Inventory] || 0) + item.Quantity
        })
        const inventoryHeaders = ['Inventory', 'Total Quantity']
        const inventoryRows = Object.entries(inventoryMap).map(([name, qty]) => [name, qty])

        // Step 2: Flatten all allocations from all items into one list of rows
        const allocationHeaders = ['Work Order', 'Variant', 'Quantity', 'Price', 'Amount', 'Supplier']
        const allocationRows = po.items.flatMap(item =>
            item.allocations.map(a => [a.WorkOrder, item.Variant, a.Quantity, a.Price, a.Amount, po.Supplier])
        )

        // Step 3: Join both tables into one CSV string with a blank line between them
        const csv = [
            [inventoryHeaders, ...inventoryRows].map(row => row.join(',')).join('\n'),
            [allocationHeaders, ...allocationRows].map(row => row.join(',')).join('\n')
        ].join('\n\n')

        const blob = new Blob([csv], { type: 'text/csv' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `PO-${po.PONumber}.csv`
        a.click()
        URL.revokeObjectURL(url)
    }

    // Error Guards
    if (loading) return <div className="p-10">Loading...</div>
    if (error) return <div className="p-10 text-red-500">{error}</div>
    if (!po) return null

    // Page UI Data
    return (
        <div className="w-full max-w-4xl mx-auto px-8 py-10">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Purchase Order #{po.PONumber}</h1>
                <div className="flex gap-2 print:hidden">
                    <button onClick={downloadPDF} className="btn btn-primary">Download PDF</button>
                    <button onClick={downloadCSV} className="btn btn-primary">Download CSV</button>
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-6 border rounded-lg p-4">
                <div><span className="font-semibold">Order Date:</span> {po.OrderDate}</div>
                <div><span className="font-semibold">Supplier:</span> {po.Supplier}</div>
                <div><span className="font-semibold">Tax Rate:</span> {po.Tax}%</div>
            </div>

            <h2 className="text-base font-semibold mb-2">Inventory</h2>
            <table className="w-full border rounded-lg mb-6 text-sm">
                <thead className="bg-muted/50">
                    <tr>
                        <th className="p-3 text-left">Inventory</th>
                        <th className="p-3 text-right">Total Quantity</th>
                    </tr>
                </thead>
                <tbody>
                    {Object.entries(
                        po.items.reduce((acc, item) => {
                            acc[item.Inventory] = (acc[item.Inventory] || 0) + item.Quantity
                            return acc
                        }, {} as Record<string, number>)
                    ).map(([name, qty], i) => (
                        <tr key={i} className="border-t">
                            <td className="p-3">{name}</td>
                            <td className="p-3 text-right">{qty}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <h2 className="text-base font-semibold mb-2">Work Order Allocations</h2>
            <table className="w-full border rounded-lg mb-6 text-sm">
                <thead className="bg-muted/50">
                    <tr>
                        <th className="p-3 text-left">Work Order</th>
                        <th className="p-3 text-left">Variant</th>
                        <th className="p-3 text-right">Quantity</th>
                        <th className="p-3 text-right">Price</th>
                        <th className="p-3 text-right">Amount</th>
                        <th className="p-3 text-left">Supplier</th>
                    </tr>
                </thead>
                <tbody>
                    {po.items.flatMap((item, i) =>
                        item.allocations.map((a, j) => (
                            <tr key={`${i}-${j}`} className="border-t">
                                <td className="p-3">{a.WorkOrder}</td>
                                <td className="p-3">{item.Variant}</td>
                                <td className="p-3 text-right">{a.Quantity}</td>
                                <td className="p-3 text-right">{po.Currency} {a.Price}</td>
                                <td className="p-3 text-right">{po.Currency} {a.Amount}</td>
                                <td className="p-3">{po.Supplier}</td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>

            <div className="flex flex-col items-end gap-1 text-sm">
                <div>Net Amount: <span className="font-semibold">{po.Currency} {po.NetAmount}</span></div>
                <div>Tax Amount: <span className="font-semibold">{po.Currency} {po.TaxAmount}</span></div>
                <div className="text-lg font-bold">Grand Total: {po.Currency} {po.GrandTotal}</div>
            </div>
        </div>
    )
}

