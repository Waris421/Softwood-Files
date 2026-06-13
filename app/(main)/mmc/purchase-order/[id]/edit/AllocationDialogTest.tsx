'use client';

import { Controller, useFieldArray, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMemo, useState } from "react";
import { THEME } from "@/_components/constants/ui";
import { cn } from "@/_components/generic/utils";
import { Button } from "@/_components/ui/button";
import { CheckCircle2, CircleArrowUp, Minus, Plus, MoreHorizontal, RefreshCw } from "lucide-react";
import { Popover, PopoverTrigger, PopoverContent } from "@/_components/ui/popover";
import { SingleDropdownAsync } from "@/_components/Dropdown/Dropdown";

const rowSchema = z.object({
    WorkOrder: z.number().nullable().optional(),
    Quantity:  z.number().min(0, 'Cannot be negative'),
});
const formSchema = z.object({ items: z.array(rowSchema) });
type FormValues = z.infer<typeof formSchema>;

type Props = {
    onSave:            (allocations: { WorkOrder: number; Quantity: number }[]) => void;
    onIncreaseRowQty:  (total: number) => void;
    rowId:             number;
    rowName:           string;
    rowVariant:        string;
    rowQuantity:       number;
    initialAllocations: { WorkOrder: number; Quantity: number }[] | null;
}


export default function AllocationDialogTest({ onSave, onIncreaseRowQty, rowId, rowName, rowVariant, rowQuantity, initialAllocations }: Props) {
    const emptyRow = { WorkOrder: null, Quantity: 0 };

    const { control, register, reset, setValue, getValues } = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: { items: [emptyRow] },
    });
    const [open, setOpen] = useState(false);
    const { fields, insert, remove } = useFieldArray({ control, name: 'items' });
    const watchedItems = useWatch({ control, name: 'items' });

    const handleWorkOrderSelect = async (index: number, woValue: number, fieldOnChange: (v: any) => void) => {
        fieldOnChange(woValue);
        try {
            const res = await fetch('/api/mmc/purchase-order/defaultqty/get', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ allocId: rowId, workOrder: woValue }),
            });
            const qty = await res.json();
            if (typeof qty === 'number') {
                setValue(`items.${index}.Quantity`, Math.round(qty));
            }
        } catch { }
    };

    const addRow    = (index: number) => insert(index + 1, emptyRow);
    const removeRow = (index: number) => {
        if (fields.length === 1) reset({ items: [emptyRow] });
        else remove(index);
    };

    const totalAllocated = useMemo(() =>
        (watchedItems || []).reduce((sum, r) => sum + (Number(r.Quantity) || 0), 0),
    [watchedItems]);
    const remaining      = rowQuantity - totalAllocated;
    const isOverAllocated = totalAllocated > rowQuantity;

    const handleOK = () => {
        const items = getValues('items');
        const valid = items.filter(r => r.WorkOrder != null && r.WorkOrder !== 0);
        onSave(valid as { WorkOrder: number; Quantity: number }[]);
        setOpen(false);
    };

    const handleReset = () => {
        if (initialAllocations && initialAllocations.length > 0) {
            reset({ items: initialAllocations.map(a => ({ WorkOrder: a.WorkOrder, Quantity: a.Quantity })) });
        } else {
            reset({ items: [emptyRow] });
        }
    };

    return (
                <Popover open={open} onOpenChange={(o) => {
            setOpen(o);
            if (!o) return;
            if (initialAllocations && initialAllocations.length > 0) {
                reset({ items: initialAllocations.map(a => ({ WorkOrder: a.WorkOrder, Quantity: a.Quantity })) });
            } else {
                reset({ items: [emptyRow] });
            }
        }}>
            <PopoverTrigger asChild>
                <Button type="button" variant="outline" size="icon" className="h-8 w-8 cursor-pointer">
                    <MoreHorizontal className="w-4 h-4" />
                </Button>
            </PopoverTrigger>

            <PopoverContent side="left" align="start" className="w-[580px] p-4 flex flex-col gap-3">

                <h2 className="text-base font-semibold border-b pb-3">
                    Allocation: {rowName} — ({rowVariant})
                </h2>

                <div className={cn("overflow-y-auto max-h-[50vh]")}>
                    <table className="w-full text-sm table-fixed border-collapse">
                        <thead className="sticky top-0 z-20">
                            <tr className="bg-base-200">
                                <th className="p-2 text-left w-[65%]">Work Order</th>
                                <th className="p-2 text-center w-[20%]">Quantity</th>
                                <th className="p-2 text-center w-[15%]">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {fields.map((field, index) => (
                                <tr key={field.id} className="border-t">
                                    <td className="p-1 w-[65%]">
                                        <Controller
                                            control={control}
                                            name={`items.${index}.WorkOrder`}
                                            render={({ field: f }) => (
                                                <SingleDropdownAsync
                                                    inputName={f.name}
                                                    placeholder="Search work order..."
                                                    apiUrl="/api/options/work-orders"
                                                    widthClass="w-full"
                                                    defaultValue={f.value?.toString() || undefined}
                                                    onSelect={(opt) => {
                                                        if (!opt) { f.onChange(null); return; }
                                                        const newValue = Number(opt.value);
                                                        if (newValue !== f.value) handleWorkOrderSelect(index, newValue, f.onChange);
                                                    }}
                                                />
                                            )}
                                        />
                                    </td>
                                    <td className="p-1 w-[20%]">
                                        <input
                                            {...register(`items.${index}.Quantity`, { valueAsNumber: true })}
                                            type="number" step="any"
                                            className={THEME.TextInput}
                                            placeholder="Qty..."
                                        />
                                    </td>
                                    <td className="p-1 w-[15%]">
                                        <div className="flex justify-center gap-1">
                                            <Button type="button" variant="outline" size="icon" className="h-8 w-8" onClick={() => addRow(index)}>
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

                <div className="flex justify-center gap-6 text-sm font-medium border-t pt-3">
                    <span>PO Qty: <span className="font-bold">{rowQuantity}</span></span>
                    <span>Allocated: <span className="font-bold">{totalAllocated}</span></span>
                    <span>Remaining: <span className={`font-bold ${remaining < 0 ? 'text-red-500' : 'text-green-600'}`}>{remaining}</span></span>
                </div>

                <div className="flex justify-center gap-2">
                    <Button type="button" variant="outline" onClick={handleReset}>
                        <RefreshCw className="w-4 h-4 mr-1" /> Reset
                    </Button>
                    <Button type="button" variant="outline" onClick={() => onIncreaseRowQty(totalAllocated)} disabled={!isOverAllocated}>
                        <CircleArrowUp className="w-4 h-4 mr-1" /> Increase
                    </Button>
                    <Button type="button" onClick={handleOK} disabled={isOverAllocated} className="px-10">
                        <CheckCircle2 className="w-4 h-4 mr-1" /> OK
                    </Button>
                </div>

            </PopoverContent>
        </Popover>
    );
}
