'use client';

import * as z from "zod";
import { Controller, useFieldArray, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo, useState } from "react";
import { THEME } from "@/_components/constants/ui";
import { cn } from "@/_components/generic/utils";
import { Button } from "@/_components/ui/button";
import { CheckCircle2, CircleArrowUp, ListChecks, Loader2, Plus, RefreshCw, Scale} from "lucide-react";
import { SingleDropdownAsync } from "@/_components/Dropdown/Dropdown";

const rowSchema = z.object({
    id: z.union([z.string(), z.number()]).optional(),
    RecInvId: z.union([z.string(), z.number()]).optional(),
    WorkOrder: z.number().nullable().optional(),
    Quantity: z.number().min(0, 'Quantity cannot be negative'),
}).superRefine((data, ctx) => {
    if (data.Quantity > 0 && (data.WorkOrder === null || data.WorkOrder === undefined)) {
        console.log('I am here');
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Work Order is required here",
            path: ["WorkOrder"],
        });
    }
});

const formSchema = z.object({
    items: z.array(rowSchema),
})

type FormValues = z.input<typeof formSchema>;

interface AllocationPopoverProps {
    selectedRecInvId: number;
    allAllocations: any;
    onSave: (updatedData: { items: any[] }) => void;
    onIncreaseRowQty: (totalQuantity: number) => void;
    totalRecQuantity: number;
}

export const FORM_NAME_WITH_PARENT = 'Allocations';

const WORK_ORDER_OPTIONS_URL = '/api/options/work-orders';
const GET_RECEIPT_REALLOCATE_URL = (id: number, method: string, totalQty: number) => `/api/mmc/inventory-receipt/${id}/re-allocate?allocationMethod=${method}&totalQty=${totalQty}`;

export default function AllocationTable({
    selectedRecInvId,
    allAllocations,
    onSave,
    onIncreaseRowQty,
    totalRecQuantity,
}: AllocationPopoverProps) {
    //Extract the array for all allocations
    const rawArray = Array.isArray(allAllocations?.items) ? allAllocations.items : [];
    //Filter the allocations based on the recId if it or the allocation changes.
    const filteredItems = useMemo(() => 
        rawArray.filter((a: any) => a.RecInvId === selectedRecInvId),
    [rawArray, selectedRecInvId]);

    //Format for empty row
    const emptyRow = useMemo(() => ({
        id: '', 
        RecInvId: selectedRecInvId, 
        WorkOrder: 0, 
        Quantity: 0
    }), [selectedRecInvId]);

    const { register, control, reset, handleSubmit ,formState: { errors } } = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: filteredItems.length > 0 ? filteredItems : [emptyRow]
    });
    const { fields, insert } = useFieldArray({ control, name: "items" });

    const watchedItems = useWatch({ control, name: "items" });

    const [isReallocating, setIsReallocating] = useState(false);

    //Show empty row for when there is no allocation
    useEffect(() => {
        reset({ items: filteredItems.length > 0 ? filteredItems : [emptyRow] });
    }, [selectedRecInvId, reset, emptyRow]);

    //Adding empty row
    const addEmptyRow = (index: number) => {
        insert(index + 1, emptyRow);
    }

    //Summary footer variables
    const totalAllocQuantity = useMemo(() => {
        return watchedItems?.reduce((sum, item) => {
            const qty = parseFloat(item.Quantity as any) || 0;
            return sum + qty;
        }, 0);
    }, [watchedItems]);
    const freeQuantity = totalRecQuantity - totalAllocQuantity;
    const isOverAllocated = totalAllocQuantity > totalRecQuantity;

    //Function to call the onSave function passed down from parent
    const onSubmit = (data: FormValues) => {
        //Get the allocations that were not related to this inv.
        const otherAllocs = rawArray.filter((a: any) => a.RecInvId !== selectedRecInvId);

        const combinedAllocs = [...otherAllocs, ...data.items];

        onSave({ items: combinedAllocs });
    };

    //Function to reset the allocation data
    const handleReset = () => {
        reset({ 
            items: filteredItems.length > 0 ? filteredItems : [emptyRow] 
        });
    };

    const handleReAllocate = async (method: string) => {
        const url = GET_RECEIPT_REALLOCATE_URL(selectedRecInvId, method, totalRecQuantity);
        
        setIsReallocating(true);

        try {
            const response = await fetch(url);
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || error);
            }
            const apiData = await response.json();
            
            const updatedItems = [...watchedItems];

            apiData.forEach((apiItem: { WorkOrder: number; Quantity: number }) => {
                const existingItemIndex = updatedItems.findIndex(
                    (item) => item.WorkOrder === apiItem.WorkOrder
                );

                if (existingItemIndex !== -1) {
                    updatedItems[existingItemIndex] = {
                        ...updatedItems[existingItemIndex],
                        Quantity: apiItem.Quantity,
                    };
                } else {
                    updatedItems.push({
                        RecInvId: selectedRecInvId,
                        WorkOrder: apiItem.WorkOrder,
                        Quantity: apiItem.Quantity,
                    });
                }
            });

            reset({ items: updatedItems });
        } catch (err: any) {
            console.error(err);
        } finally {
            setIsReallocating(false)
        }
    }    

    return (
        <div className={cn(THEME.Table.Wrapper, "flex flex-col h-full max-w-full overflow-hidden")}>
            <div className={cn(THEME.Table.TableContainer, "grow overflow-y-auto overflow-x-hidden w-full")}>
                <table className="table w-full table-fixed border-collapse">
                    <thead className="sticky top-0 z-20">
                        <tr className={THEME.Table.HeaderRow}>
                            <th className="p-1 border-b text-center w-[65%]">Work Order</th>
                            <th className="p-1 border-b text-center w-[20%]">Quantity</th>
                            <th className="p-1 border-b text-center w-[15%]">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {fields.map((field, index) => {
                            return (
                                <tr 
                                    key={field.id}
                                    className={cn(
                                        "transition-colors",
                                        THEME.Table.RowHover,
                                    )}
                                >
                                    <td className="p-1 w-[65%]">
                                        <Controller 
                                            control={control}
                                            name={`items.${index}.WorkOrder` as const}
                                            render={({field}) => (
                                                <SingleDropdownAsync 
                                                    inputName={field.name}
                                                    placeholder="Required"
                                                    apiUrl={WORK_ORDER_OPTIONS_URL}
                                                    widthClass="w-full"
                                                    onSelect={(option: { value: string; label: string; } | null) => {
                                                        const selectedValue = option;

                                                        const numericValue = selectedValue ? Number(selectedValue.value) : null;
                                                        field.onChange(numericValue);
                                                    }}
                                                    defaultValue={field.value?.toString() || undefined}
                                                />
                                            )}
                                        />
                                        {errors.items?.[index]?.WorkOrder && (
                                            <p className="text-[10px] text-red-500 mt-1">{errors.items[index]?.WorkOrder?.message}</p>
                                        )}
                                    </td>
                                    <td className="p-1 w-[20%]">
                                        <input 
                                            {...register(`items.${index}.Quantity` as const, { valueAsNumber: true })} 
                                            className={THEME.TextInput}
                                            type="number" step="any"
                                            placeholder="Enter Allocated Qty..."
                                        />
                                        {errors.items?.[index]?.Quantity && (
                                            <p className="text-[10px] text-red-500 mt-1">{errors.items[index]?.Quantity?.message}</p>
                                        )}
                                    </td>
                                    <td className="p-1 w-[15%]">
                                        <div className="flex justify-center gap-1">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="icon"
                                                className="h-8 w-8 cursor-pointer"
                                                onClick={() => addEmptyRow(index)}
                                            >
                                                <Plus className="w-4 h-4" color="#38A169" />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
            {/* --- FOOTER --- */}
            <div className={cn(THEME.Table.Footer, "mt-0")}>
                <div className="flex justify-center items-center px-2 py-1 mb-4">
                    <div className="flex gap-6 py-1">
                        <div className="flex items-baseline gap-2">
                            <span className="text-gray-500 uppercase text-[9px] font-bold tracking-wider">Total Received</span>
                            <span className="text-sm font-semibold">{totalRecQuantity.toLocaleString()}</span>
                        </div>

                        <div className="flex items-baseline gap-2 border-l border-base-300 pl-6">
                            <span className="text-gray-500 uppercase text-[9px] font-bold tracking-wider">Allocated</span>
                            <span className={cn("text-sm font-semibold", isOverAllocated ? "text-error" : "")}>
                                {totalAllocQuantity ? totalAllocQuantity.toLocaleString() : 0}
                            </span>
                        </div>

                        <div className="flex items-baseline gap-2 border-l border-base-300 pl-6">
                            <span className="text-gray-500 uppercase text-[9px] font-bold tracking-wider">Remaining</span>
                            <span className={cn("text-sm font-semibold", freeQuantity < 0 ? "text-error" : "text-success")}>
                                {freeQuantity ? freeQuantity.toLocaleString() : 0}
                            </span>
                        </div>
                    </div>
                </div>
                <div className="flex justify-center gap-2">
                    <Button
                        type="button"
                        className={cn(THEME.ButtonSecondary, 'w-25')} 
                        onClick={() => handleReAllocate('distribute')}
                        disabled={isReallocating}
                    >
                        {isReallocating ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ....
                            </>
                        ) : (
                            <>
                                <Scale className="mr-2 h-4 w-4" />
                                Distribute
                            </>
                        )}
                    </Button>
                    <Button
                        type="button"
                        className={cn(THEME.ButtonSecondary, 'w-25')} 
                        onClick={() => handleReAllocate('prioritise')}
                        disabled={isReallocating}
                    >
                        {isReallocating ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ....
                            </>
                        ) : (
                            <>
                                <ListChecks className="mr-2 h-4 w-4" />
                                Prioritise
                            </>
                        )}
                    </Button>
                    <Button 
                        type="button" 
                        className={cn(THEME.ButtonSecondary, 'w-25')} 
                        onClick={handleReset}
                    >
                        <RefreshCw className="w-4 h-4" />
                        Reset
                    </Button>
                    <Button
                        type="button"
                        className={cn(THEME.ButtonBasic, 'w-25')} 
                        onClick={() => onIncreaseRowQty(totalAllocQuantity)}
                        disabled={!isOverAllocated}
                    >
                        <CircleArrowUp className="w-4 h-4" />
                        Increase
                    </Button>
                    <Button 
                        onClick={handleSubmit(onSubmit)}
                        disabled={isOverAllocated}
                        className={cn(THEME.ButtonBasic, 'w-25', isOverAllocated && "btn-disabled")}
                    >
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        OK
                    </Button>
                </div>
            </div>
        </div>
    );
}