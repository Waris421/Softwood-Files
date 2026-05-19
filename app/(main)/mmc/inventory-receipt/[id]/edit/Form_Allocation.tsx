'use client';

import * as z from "zod";
import { useFormRegistry } from "./FormContext";
import { Controller, useFieldArray, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { THEME } from "@/_components/constants/ui";
import { cn } from "@/_components/generic/utils";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/_components/ui/alert-dialog";
import { Button } from "@/_components/ui/button";
import { CheckCircle2, Minus, Plus, X } from "lucide-react";
import { SingleDropdownAsync } from "@/_components/Dropdown/Dropdown";
import { PopoverClose } from "@/_components/ui/popover";

const rowSchema = z.object({
    id: z.union([z.string(), z.number()]).optional(),
    RecInvId: z.number().min(1, 'This is required'),
    WorkOrder: z.number().min(1, 'This is required'),
    Quantity: z.number().min(1, 'This is required'),
});

const formSchema = z.object({
    items: z.array(rowSchema),
})

type FormValues = z.input<typeof formSchema>;

type AllocationPopoverProps = {
    selectedRecInvId: number,
    totalReceivedQty: number,
}

export const FORM_NAME_WITH_PARENT = 'Allocations';

const WORK_ORDER_OPTIONS_URL = '/api/options/work-orders';

export default function AllocationTable({
    selectedRecInvId,
    totalReceivedQty,
}: AllocationPopoverProps) {
    const { setFormData, getCombinedData, registerValidator, registerCustomAction } = useFormRegistry();

    const { register, control, getValues, trigger, reset, formState: { errors }} = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: getCombinedData()[FORM_NAME_WITH_PARENT] || { 
            items: [] 
        }
    });
    const [indexToDelete, setIndexToDelete] = useState<number | null>(null);

    const { fields, append, remove, insert, } = useFieldArray({
        control,
        name: "items"
    });

    const watchedItems = useWatch({ control, name: "items" }) || [];

    const watchedItemsRef = useRef(watchedItems);

    //Get data of all allocations from the parent
    useEffect(() => {
        const allAllocations = getCombinedData()[FORM_NAME_WITH_PARENT];

        if (allAllocations && allAllocations.items && allAllocations.items.length > 0) {
            reset(allAllocations);
        }
    }, [getCombinedData, reset]);

    //Define validation logic for the Parent to call
    const validateForm = useCallback(() => {
        const currentValues = getValues();
        const result = formSchema.safeParse(currentValues);

        if (!result.success) {
            trigger();
            return false
        }

        return true;
    }, [getValues, trigger]);

    //Register the validator with the Parent Context on mount
    useEffect(() => {
        registerValidator(FORM_NAME_WITH_PARENT, validateForm);
        return () => registerValidator(FORM_NAME_WITH_PARENT, () => true);
    }, [validateForm, registerValidator]);

    //Format for empty row
    const emptyRow = {
        RecInvId: selectedRecInvId, 
        WorkOrder: 0,
        Quantity: 0,
    }

    //Code for the remove click button
    const handleRemoveClick = (index: number) => {
        const currentRow = getValues(`items.${index}`);
        
        const isModified = Object.keys(emptyRow).some((key) => {
            const currentVal = currentRow[key as keyof typeof emptyRow];
            const defaultVal = emptyRow[key as keyof typeof emptyRow];

            if (typeof defaultVal === 'number') {
                return Number(currentVal) !== defaultVal;
            }

            if (typeof defaultVal === 'boolean') {
                return Boolean(currentVal) !== defaultVal;
            }
            
            return (currentVal ?? '') !== (defaultVal ?? '');
        });

        if (isModified) {
            setIndexToDelete(index);
        } else {
            executeDelete(index);
        }
    };

    //Code to delete the row
    const executeDelete = (index: number) => {
        remove(index);

        if (fields.length === 1) append(emptyRow);

        setIndexToDelete(null);
    };

    //Adding empty row
    const addEmptyRow = (index: number) => {
        insert(index + 1, emptyRow);
    }

    useEffect(() => {
        watchedItemsRef.current = watchedItems;
    }, [watchedItems]);

    //Define the custom function to get the summary of allocation
    const calculateSummaryForAlloc = useCallback((recInvId: number, totalQty: number) => {
        const allocatedQuantity = watchedItems
            .filter(item => item.RecInvId === recInvId)
            .reduce((sum, item) => sum + (Number(item.Quantity) || 0), 0);

        return {
            totalQuantity: totalQty,
            allocatedQuantity,
            balance: totalQty - allocatedQuantity,
            isOver: allocatedQuantity > totalQty
        };
    }, []);

    useEffect(() => {
        registerCustomAction('getAllocationSummary', calculateSummaryForAlloc);
    }, [calculateSummaryForAlloc, registerCustomAction]);

    return (
        <div className="flex flex-col h-full max-h-125">
            
            {/* Allocation form */}
            <div className="overflow-auto grow px-4 pt-4">
                <form autoComplete="off">
                    <div className="overflow-x-auto rounded-lg border border-base-300">
                        <table className="table w-full">
                            <thead className={THEME.Table.HeaderRow}>
                                <tr className="bg-base-200">
                                    <th className="p-1 border-b text-center w-90">WOrk Order</th>
                                    <th className="p-1 border-b text-center w-40">Quantity</th>
                                    <th className="p-1 border-b text-center w-20">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {fields.map((field, index) => {
                                    if (watchedItems?.[index].RecInvId !== selectedRecInvId) return null;

                                    return (
                                        <tr
                                            key={field.id}
                                            className={cn(
                                                "transition-colors",
                                                THEME.Table.RowHover
                                            )}
                                        >
                                            <td className="p-1 w-90">
                                                <Controller 
                                                    control={control}
                                                    name={`items.${index}.WorkOrder` as const}
                                                    render={({field}) => {
                                                        return (
                                                            <SingleDropdownAsync 
                                                                inputName={field.name}
                                                                widthClass="w-90"
                                                                placeholder="Select WO"
                                                                apiUrl={WORK_ORDER_OPTIONS_URL}
                                                                defaultValue={field.value.toString()}
                                                                onSelect={(option: { value: string; label: string; } | null) => {
                                                                    const selectedValue = option as { value: string; label: string } | null;
                                                                    field.onChange(selectedValue ? selectedValue.value : '');
                                                                }}
                                                            />
                                                        )
                                                    }}
                                                />
                                                {errors.items?.[index]?.WorkOrder && (
                                                    <p className="text-[10px] text-red-500 mt-1">{errors.items[index]?.WorkOrder?.message}</p>
                                                )}
                                            </td>
                                            <td className="p-1 w-40">
                                                <input 
                                                    {...register(`items.${index}.Quantity` as const, { valueAsNumber: true })} 
                                                    className={cn(THEME.TextInput, "join-item flex text-center")}
                                                    type="number"
                                                    min={0}
                                                />
                                                {errors.items?.[index]?.Quantity && (
                                                    <p className="text-[10px] text-red-500 mt-1">{errors.items[index]?.Quantity?.message}</p>
                                                )}
                                            </td>
                                            <td className="p-1 w-20">
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
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="icon"
                                                        className="h-8 w-8 cursor-pointer"
                                                        onClick={() => handleRemoveClick(index)}
                                                    >
                                                        <Minus className="w-4 h-4" color="#E53E3E"/>
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                </form>
            </div>         

            {/* Alert componenet for when a user tries to delete a row that contains data */}
            <AlertDialog open={indexToDelete !== null} onOpenChange={() => setIndexToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This row contains data. Deleting it will remove the data.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            onClick={() => indexToDelete !== null && executeDelete(indexToDelete)}
                        >
                            Delete Row
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}