'use client';

import { useEffect, useState } from "react";
import { THEME } from "@/_components/constants/ui";
import { Button } from "@/_components/ui/button";
import { Loader2, Minus, Plus } from "lucide-react";

type AllocRow = { WorkOrder: number | ''; Quantity: number; };
type WorkOrderOption = { value: number; text: string; };

type Props = {
    open: boolean;
    onClose: () => void;
    onSave: (allocations: { WorkOrder: number; Quantity: number }[]) => void;
    rowId: number;
    rowName: string;
    rowVariant: string;
    rowInventory: string;
    rowQuantity: number;
    poNumber: string;
    initialAllocations: { WorkOrder: number; Quantity: number }[] | null;
}

export default function AllocationDialog({
    open, onClose, onSave,
    rowId, rowName, rowVariant, rowInventory, rowQuantity, poNumber, initialAllocations
}: Props) {
    const [rows, setRows] = useState<AllocRow[]>([]);
    const [workOrders, setWorkOrders] = useState<WorkOrderOption[]>([]);
    const [allocatedQty, setAllocatedQty] = useState<number>(0);
    const [loading, setLoading] = useState(true);

    // ── Load everything when dialog opens ─────────────────────────────────────
    useEffect(() => {
        if (!open) return;

        const loadData = async () => {
            setLoading(true);
            try {
                // Work orders and allocated qty always come from server
                const [woRes, allocQtyRes] = await Promise.all([
                    fetch('/api/options/workorders'),
                    fetch('/api/mmc/purchase-order/allocatedqty/get', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ invCode: rowInventory, variant: rowVariant, poNumber }),
                    }),
                ]);

                const woList = await woRes.json();
                const allocQty = await allocQtyRes.json();

                setWorkOrders(Array.isArray(woList) ? woList : []);
                setAllocatedQty(typeof allocQty === 'number' ? allocQty : 0);

                // Use local unsaved changes if the user already edited this row's dialogue
                // Otherwise fetch saved allocations from the server
                if (initialAllocations && initialAllocations.length > 0) {
                    setRows(initialAllocations.map(a => ({ WorkOrder: a.WorkOrder, Quantity: a.Quantity })));
                } else {
                    const allocRes = await fetch('/api/mmc/purchase-order/alloc/get', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ id: rowId }),
                    });
                    const existingAllocs = await allocRes.json();
                    if (Array.isArray(existingAllocs) && existingAllocs.length > 0) {
                        setRows(existingAllocs.map((a: any) => ({ WorkOrder: a.WorkOrder, Quantity: a.Quantity })));
                    } else {
                        setRows([{ WorkOrder: '', Quantity: 0 }]);
                    }
                }
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [open, rowId, rowInventory, rowVariant, poNumber, initialAllocations]);
    // ── Auto-fill quantity when work order is selected ─────────────────────────
    const handleWorkOrderChange = async (index: number, woValue: number) => {
        setRows(prev => prev.map((r, i) => i === index ? { ...r, WorkOrder: woValue } : r));
        try {
            const res = await fetch('/api/mmc/purchase-order/defaultqty/get', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ allocId: rowId, workOrder: woValue }),
            });
            const qty = await res.json();
            if (typeof qty === 'number') {
                setRows(prev => prev.map((r, i) => i === index ? { ...r, Quantity: qty } : r));
            }
        } catch { /* keep existing quantity if fetch fails */ }
    };

    const handleQtyChange = (index: number, value: number) => {
        setRows(prev => prev.map((r, i) => i === index ? { ...r, Quantity: Math.max(0, value) } : r));
    };

    const addRow = () => setRows(prev => [...prev, { WorkOrder: '', Quantity: 0 }]);

    const removeRow = (index: number) => {
        if (rows.length === 1) {
            setRows([{ WorkOrder: '', Quantity: 0 }]);
        } else {
            setRows(prev => prev.filter((_, i) => i !== index));
        }
    };

    const handleOK = () => {
        // Only pass rows that have a work order selected
        const validRows = rows.filter(r => r.WorkOrder !== '');
        onSave(validRows as { WorkOrder: number; Quantity: number }[]);
        onClose();
    };

    const liveAllocatedQty = rows.reduce((sum, r) => sum + (Number(r.Quantity) || 0), 0);
    const freeQty = rowQuantity - liveAllocatedQty;

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={onClose}>
            <div className="bg-background rounded-lg shadow-xl w-full max-w-2xl flex flex-col gap-4 p-6" onClick={(e) => e.stopPropagation()}>
                {/* Title */}
                <h2 className="text-base font-semibold border-b pb-3">
                    Allocation: {rowName} — ({rowVariant})
                </h2>

                {loading ? (
                    <div className="flex justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin" />
                    </div>
                ) : (
                    <>
                        {/* Allocation table */}
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-base-200">
                                    <th className="p-2 text-left">Order #</th>
                                    <th className="p-2 text-center">Quantity</th>
                                    <th className="p-2 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rows.map((row, index) => (
                                    <tr key={index} className="border-t">
                                        {/* Work Order dropdown */}
                                        <td className="p-2">
                                            <select
                                                className={THEME.TextInput}
                                                value={row.WorkOrder}
                                                onChange={(e) => handleWorkOrderChange(index, Number(e.target.value))}
                                            >
                                                <option value="">Select work order...</option>
                                                {workOrders.map(wo => (
                                                    <option key={wo.value} value={wo.value}>
                                                        {wo.text}
                                                    </option>
                                                ))}
                                            </select>
                                        </td>

                                        {/* Quantity input */}
                                        <td className="p-2">
                                            <input
                                                type="number"
                                                step="any"
                                                className={THEME.TextInput}
                                                value={row.Quantity}
                                                onChange={(e) => handleQtyChange(index, parseFloat(e.target.value) || 0)}
                                            />
                                        </td>

                                        {/* + / - buttons */}
                                        <td className="p-2">
                                            <div className="flex justify-center gap-1">
                                                <Button type="button" variant="outline" size="icon" className="h-8 w-8" onClick={addRow}>
                                                    <Plus className="w-4 h-4" color="#38A169" />
                                                </Button>
                                                <Button type="button" variant="outline" size="icon" className="h-8 w-8" onClick={() => removeRow(index)}>
                                                    <Minus className="w-4 h-4" color="#E53E3E" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Summary bar */}
                        <div className="flex gap-6 text-sm font-medium border-t pt-3">
                            <span>Total Qty: <span className="font-bold">{rowQuantity}</span></span>
                            <span>Allocated Qty: <span className="font-bold">{liveAllocatedQty}</span></span>
                            <span>Free Qty: <span className={`font-bold ${freeQty < 0 ? 'text-red-500' : ''}`}>{freeQty}</span></span>
                        </div>

                        {/* OK button */}
                        <div className="flex justify-end">
                            <Button onClick={handleOK} disabled={liveAllocatedQty > rowQuantity} className="px-10 disabled:opacity-50">OK</Button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
