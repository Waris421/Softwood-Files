'use client';

import { useEffect, useState } from "react";
import { THEME } from "@/_components/constants/ui";
import { Button } from "@/_components/ui/button";
import { Minus, Plus, MoreHorizontal } from "lucide-react";

type AllocRow = { WorkOrder: number | ''; Quantity: number; };
type WorkOrderOption = { value: number; label: string; };

type Props = {
    onSave: (allocations: { WorkOrder: number; Quantity: number }[]) => void;
    rowId: number;
    rowName: string;
    rowVariant: string;
    rowInventory: string;
    rowQuantity: number;
    poNumber: string;
    initialAllocations: { WorkOrder: number; Quantity: number }[] | null;
    workOrders: WorkOrderOption[];
}

export default function AllocationDialogTest({
    onSave,
    rowId, rowName, rowVariant, rowInventory, rowQuantity, poNumber,
    initialAllocations,
    workOrders,
}: Props) {
    const [open, setOpen] = useState(false);
    const [rows, setRows] = useState<AllocRow[]>([]);
    useEffect(() => {
        if (!open) return;
        if (initialAllocations && initialAllocations.length > 0) {
            setRows(initialAllocations.map(a => ({ WorkOrder: a.WorkOrder, Quantity: a.Quantity })));
        } else {
            setRows([{ WorkOrder: '', Quantity: 0 }]);
        }
    }, [open, initialAllocations]);

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
        } catch { }
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
        const validRows = rows.filter(r => r.WorkOrder !== '');
        onSave(validRows as { WorkOrder: number; Quantity: number }[]);
        setOpen(false);
    };

    const liveAllocatedQty = rows.reduce((sum, r) => sum + (Number(r.Quantity) || 0), 0);
    const freeQty = rowQuantity - liveAllocatedQty;

    return (
        <>
            {/* ⋮ trigger button — clicking this opens the sheet */}
            <Button type="button" variant="outline" size="icon" className="h-8 w-8 cursor-pointer" onClick={() => setOpen(true)}>
                <MoreHorizontal className="w-4 h-4" />
            </Button>

            {/* Bottom sheet — only renders when open is true */}
            {open && (
                <>
                    {/* Dark backdrop — clicking this closes the sheet */}
                    <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" onClick={() => setOpen(false)} />

                    {/* The sheet itself — fixed to the bottom of the screen */}
                    <div className="fixed bottom-4 right-4 z-50 bg-background rounded-xl shadow-xl flex flex-col max-h-[60vh] w-[650px] p-6">

                        {/* Title — always visible at top */}
                        <h2 className="text-base font-semibold border-b pb-3 mb-3 shrink-0">
                            Allocation: {rowName} — ({rowVariant})
                        </h2>

                        {/* Scrollable table area */}
                        <div className="overflow-y-auto flex-1 min-h-0">
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
                                            <td className="p-2">
                                                <select
                                                    className={THEME.TextInput}
                                                    value={row.WorkOrder}
                                                    onChange={(e) => handleWorkOrderChange(index, Number(e.target.value))}
                                                >
                                                    <option value="">Select work order...</option>
                                                    {workOrders.map(wo => (
                                                        <option key={wo.value} value={wo.value}>{wo.label}</option>
                                                    ))}
                                                </select>
                                            </td>
                                            <td className="p-2">
                                                <input
                                                    type="number" step="any"
                                                    className={THEME.TextInput}
                                                    value={row.Quantity}
                                                    onChange={(e) => handleQtyChange(index, parseFloat(e.target.value) || 0)}
                                                />
                                            </td>
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
                        </div>

                        {/* Summary bar */}
                        <div className="flex gap-6 text-sm font-medium border-t pt-3 mt-3 shrink-0">
                            <span>Total Qty: <span className="font-bold">{rowQuantity}</span></span>
                            <span>Allocated Qty: <span className="font-bold">{liveAllocatedQty}</span></span>
                            <span>Free Qty: <span className={`font-bold ${freeQty < 0 ? 'text-red-500' : ''}`}>{freeQty}</span></span>
                        </div>

                        {/* OK button */}
                        <div className="flex justify-end mt-3 shrink-0">
                            <Button
                                onClick={handleOK}
                                disabled={liveAllocatedQty > rowQuantity}
                                className="px-10 disabled:opacity-50"
                            >
                                OK
                            </Button>
                        </div>

                    </div>
                </>
            )}
        </>
    );
}
