'use client';

import { useState } from "react";
import { THEME } from "@/_components/constants/ui";
import { Button } from "@/_components/ui/button";
import { Minus, Plus, MoreHorizontal } from "lucide-react";
import { Popover, PopoverTrigger, PopoverContent, PopoverClose } from "@/_components/ui/popover";

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
    const [rows, setRows] = useState<AllocRow[]>([]);
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
    };

    const liveAllocatedQty = rows.reduce((sum, r) => sum + (Number(r.Quantity) || 0), 0);
    const freeQty = rowQuantity - liveAllocatedQty;

    return (
        <Popover onOpenChange={(isOpen) => {
            if (!isOpen) return;
            if (initialAllocations && initialAllocations.length > 0) {
                setRows(initialAllocations.map(a => ({ WorkOrder: a.WorkOrder, Quantity: a.Quantity })));
            } else {
                setRows([{ WorkOrder: '', Quantity: 0 }]);
            }
        }}>
            {/* ⋮ trigger button — PopoverTrigger makes this open the popover on click */}
            <PopoverTrigger asChild>
                <Button type="button" variant="outline" size="icon" className="h-8 w-8 cursor-pointer">
                    <MoreHorizontal className="w-4 h-4" />
                </Button>
            </PopoverTrigger>

            {/* The panel — anchors left of the trigger button, auto-positions */}
            <PopoverContent side="left" align="start" className="w-[580px] p-4 flex flex-col gap-3">

                {/* Title */}
                <h2 className="text-base font-semibold border-b pb-3">
                    Allocation: {rowName} — ({rowVariant})
                </h2>

                {/* Scrollable table area */}
                <div className="overflow-y-auto max-h-[50vh]">
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
                <div className="flex gap-6 text-sm font-medium border-t pt-3">
                    <span>Total Qty: <span className="font-bold">{rowQuantity}</span></span>
                    <span>Allocated Qty: <span className="font-bold">{liveAllocatedQty}</span></span>
                    <span>Free Qty: <span className={`font-bold ${freeQty < 0 ? 'text-red-500' : ''}`}>{freeQty}</span></span>
                </div>

                {/* OK button — PopoverClose wraps it so clicking OK also closes the panel */}
                <div className="flex justify-end">
                    <PopoverClose asChild>
                        <Button
                            onClick={handleOK}
                            disabled={liveAllocatedQty > rowQuantity}
                            className="px-10 disabled:opacity-50"
                        >
                            OK
                        </Button>
                    </PopoverClose>
                </div>

            </PopoverContent>
        </Popover>
    );

}
