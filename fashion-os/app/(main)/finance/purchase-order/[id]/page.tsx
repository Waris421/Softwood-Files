'use client'
import { useEffect, useState } from "react"
import { useParams } from "next/navigation"

// Info on the data coming from Django

// Labels for Allocation table
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
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-6 border rounded-lg p-4">
                <div><span className="font-semibold">Order Date:</span> {po.OrderDate}</div>
                <div><span className="font-semibold">Supplier:</span> {po.Supplier}</div>
                <div><span className="font-semibold">Tax Rate:</span> {po.Tax}%</div>
            </div>

        {po.items.map((item, i) => (
            <div key={i} className="mb-8">

                <table className="w-full border rounded-lg mb-2 text-sm">
                    <thead className="bg-muted/50">
                        <tr>
                            <th className="p-3 text-left">Inventory</th>
                            <th className="p-3 text-left">Variant</th>
                            <th className="p-3 text-right">Quantity</th>
                            <th className="p-3 text-right">Price</th>
                            <th className="p-3 text-right">Amount</th>
                            <th className="p-3 text-right">Difference</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr className="border-t">
                            <td className="p-3">{item.Inventory}</td>
                            <td className="p-3">{item.Variant}</td>
                            <td className="p-3 text-right">{item.Quantity}</td>
                            <td className="p-3 text-right">{po.Currency} {item.Price}</td>
                            <td className="p-3 text-right">{po.Currency} {item.Amount}</td>
                            <td className="p-3 text-right">{po.Currency} {item.AmountDifference}</td>
                        </tr>
                    </tbody>
                </table>

                <table className="w-full border rounded-lg text-sm ml-4">
                    <thead className="bg-muted/30">
                        <tr>
                            <th className="p-2 text-left">Work Order</th>
                            <th className="p-2 text-left">Variant</th>
                            <th className="p-2 text-right">Quantity</th>
                            <th className="p-2 text-right">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        {item.allocations.map((a, j) => (
                            <tr key={j} className="border-t">
                                <td className="p-2">{a.WorkOrder}</td>
                                <td className="p-2">{item.Variant}</td>
                                <td className="p-2 text-right">{a.Quantity}</td>
                                <td className="p-2 text-right">{po.Currency} {a.Amount}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

            </div>
        ))}

            <div className="flex flex-col items-end gap-1 text-sm">
                <div>Net Amount: <span className="font-semibold">{po.Currency} {po.NetAmount}</span></div>
                <div>Tax Amount: <span className="font-semibold">{po.Currency} {po.TaxAmount}</span></div>
                <div className="text-lg font-bold">Grand Total: {po.Currency} {po.GrandTotal}</div>
            </div>
        </div>
    )
}

