'use client';

import * as z from "zod";
import { useFormRegistry } from "./FormContext";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useEffect, useState } from "react";
import { cn } from "@/_components/generic/utils";
import { THEME } from "@/_components/constants/ui";
import { CheckCircle2, Clock, MessageSquare, Settings2, SlidersHorizontal, X, XCircle } from "lucide-react";
import { Popover, PopoverClose, PopoverContent, PopoverTrigger } from "@/_components/ui/popover";
import AllocationTable from "./Form_Allocation";

const rowSchema = z.object({
    id: z.number(),
    Inventory: z.string().min(1, 'This is required'),
    InventoryName: z.string().optional(),
    Variant: z.string().optional(),
    Unit: z.string().optional(),
    Quantity: z.number().min(0),
    Price: z.number().optional(),
    Currency: z.string().optional(),
    Approval: z.boolean().optional(),
    QualityComments: z.string().optional(),
})

const formSchema = z.object({
    items: z.array(rowSchema),
})

type FormValues = z.input<typeof formSchema>;

const FORM_NAME_WITH_PARENT = 'Inventories';
const ALLOCATION_FORM_NAME = 'Allocations'

export default function InventoryTable() {
    const { 
        setFormData, getCombinedData, registerValidator, customAction
     } = useFormRegistry();
    
    const {
        register, control, getValues, setValue, trigger, reset, formState: { errors }
    } = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: getCombinedData()[FORM_NAME_WITH_PARENT] || { 
            items: [] 
        }
    });

    const watchedItems = useWatch({
        control,
    });

    const { fields } = useFieldArray({
        control,
        name: "items"
    });

    const items = watchedItems.items;
    
    //Allocation data table handling
    const [allocData, setAllocData] = useState<{items: any[]}>({items: []});
    const [openAllocIndex, setOpenAllocIndex] = useState<number | null>(null);

    //Pull default values at the start from parent
    useEffect(() => {
        const initialValues = getCombinedData()[FORM_NAME_WITH_PARENT];

        if (initialValues && initialValues.items && initialValues.items.length > 0) {
            reset(initialValues);
        }

        const initialAllocs = getCombinedData()[ALLOCATION_FORM_NAME] || [];
        setAllocData(initialAllocs);
    }, [getCombinedData, reset]);
    
    //Sync local Hook Form state to Parent Registry whenever anything changes
    useEffect(() => {
        setFormData(FORM_NAME_WITH_PARENT, watchedItems);
    }, [watchedItems, setFormData]);

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

    //Update the summary when data in the inventories change
    useEffect(() => {
        if (items) {
            const totalsByCurrency = items.reduce((acc: Record<string, number>, item: any) => {
                const currency = item.Currency || 'Unknown';
                const lineValue = Number(item.Quantity || 0) * Number(item.Price || 0);
                
                acc[currency] = (acc[currency] || 0) + lineValue;
                return acc;
            }, {});

            const totalValue = Object.entries(totalsByCurrency)
                .map(([curr, total]) => {
                    const formattedTotal = total.toLocaleString('en-US', {
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
                    });
                    return `${formattedTotal} ${curr}`;
                })
                .join(', ');

            const uniqueInventories = new Set(items.map((i: any) => i.Inventory)).size;
            
            const totalLines = items.length;
            
            customAction('updateSummary', {
                totalValue, uniqueInventories, totalLines
            });
        }
    }, [watchedItems?.items]);

    //Update the allocation when user clicks OK
    const handleAllocUpdate = (updatedAllocList: { items: any[] }) => {
        setAllocData(updatedAllocList);
        setFormData(ALLOCATION_FORM_NAME, updatedAllocList);

        setOpenAllocIndex(null);
    }

    //Function that sets the total allocated qty to received qty
    const handleIncreaseRowQty = (index: number, newQuantity: number) => {
        const currentQuantity = getValues(`items.${index}.Quantity`);

        if (newQuantity > currentQuantity) {
            setValue(`items.${index}.Quantity`, newQuantity, {
                shouldValidate: true,
                shouldDirty: true,
                shouldTouch: true,
            });
        }
    }

    return (
        <div className="w-full space-y-4 z-10">
            <form className="space-y-4 p-4" autoComplete="off">
                <div className="overflow-x-auto rounded-lg border border-base-300">
                    <table className="table w-full">
                        <thead className={THEME.Table.HeaderRow}>
                            <tr className="bg-base-200">
                                <th className="p-1 border-b text-center w-40">Code</th>
                                <th className="p-1 border-b text-center w-60">Name</th>
                                <th className="p-1 border-b text-center w-25">Variant</th>
                                <th className="p-1 border-b text-center w-20">Quantity</th>
                                <th className="p-1 border-b text-center w-25">Price</th>
                                <th className="p-1 border-b text-center w-10">Approval</th>
                            </tr>
                        </thead>
                        <tbody>
                            {fields.map((field, index) => {
                                const currentItem = items?.[index];

                                const approvalStatus = currentItem?.Approval;
                                const approvalComments = currentItem?.QualityComments;

                                const recInvId = currentItem?.id || 0;
                                const recQty = currentItem?.Quantity || 0;

                                return (
                                    <tr
                                        key={field.id}
                                        className={cn(
                                            "transition-colors",
                                            THEME.Table.RowHover
                                        )}
                                    >
                                        <td className="p-1 w-40">
                                            <div className={THEME.TextInputReadOnly}>{items?.[index]?.Inventory}</div>
                                        </td>
                                        <td className="p-1 w-60">
                                            <div className={cn(THEME.TextInputReadOnly, "flex items-center justify-between gap-2 px-2")}>
                                                <span className="truncate">{items?.[index]?.InventoryName}</span>
                                                <Popover
                                                    open={openAllocIndex === index}
                                                    onOpenChange={(open) => {
                                                        if (open) setOpenAllocIndex(index);
                                                        else setOpenAllocIndex(null);
                                                    }}

                                                >
                                                    <PopoverTrigger asChild>
                                                        <button
                                                            type="button"
                                                            className="btn btn-ghost btn-xs btn-circle hover:bg-slate-200 dark:hover:bg-slate-700"
                                                        >
                                                            <SlidersHorizontal size={16} className="text-primary" />
                                                        </button>
                                                    </PopoverTrigger>
                                                    <PopoverContent 
                                                        className="z-50 w-150 p-0 rounded-lg shadow-xl animate-in fade-in zoom-in duration-200 border border-slate-200 overflow-hidden"
                                                    >
                                                        <div className="bg-slate-900/50 dark:bg-slate-50 px-3 py-2 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                                                            <div className="flex flex-col gap-0.5 max-w-[85%]">
                                                                <h4 className="text-[12px] font-semibold text-slate-800 truncate">
                                                                    Edit Allocations ({items?.[index]?.InventoryName}
                                                                    {items?.[index]?.Variant && (
                                                                        <span className="ml-1.5 px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-medium text-[10px]">
                                                                            {items?.[index]?.Variant}
                                                                        </span>
                                                                    )}
                                                                    )
                                                                </h4>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <PopoverClose className="btn btn-ghost btn-xs btn-circle text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                                                                    <X size={14} />
                                                                    <span className="sr-only">Close</span>
                                                                </PopoverClose>
                                                            </div>                                                        
                                                        </div>
                                                        <div className="p-3 bg-base-100 h-100 flex flex-col">
                                                            <AllocationTable 
                                                                selectedRecInvId={recInvId}
                                                                allAllocations={allocData}
                                                                onSave={handleAllocUpdate}
                                                                onIncreaseRowQty={(val: number) => handleIncreaseRowQty(index, val)}
                                                                totalRecQuantity={recQty}
                                                            />
                                                        </div>
                                                    </PopoverContent>
                                                </Popover>
                                            </div>
                                        </td>
                                        <td className="p-1 w-25">
                                            <div className={THEME.TextInputReadOnly}>{items?.[index]?.Variant}</div>
                                        </td>
                                        <td className="p-1 w-20 text-center">
                                            <div className="join flex justify-center">
                                                <input 
                                                    {...register(`items.${index}.Quantity` as const, { valueAsNumber: true })} 
                                                    className={cn(THEME.TextInput, "join-item flex text-center")}
                                                    type="number"
                                                    min={0}
                                                />
                                                {errors.items?.[index]?.Quantity && (
                                                    <p className="text-[10px] text-red-500 mt-1">{errors.items[index]?.Quantity?.message}</p>
                                                )}
                                                <span className={cn(THEME.TextInputReadOnly, "join-item w-25 text-[9px] whitespace-nowrap")}>
                                                    {items?.[index]?.Unit}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="p-1 w-25">
                                            <div className={cn(THEME.TextInputReadOnly, "flex items-center justify-start gap-1 px-2")}>
                                                <span className="font-medium">{items?.[index]?.Price}</span>
                                                <span className="text-xs opacity-70">{items?.[index]?.Currency}</span>
                                            </div>
                                        </td>
                                        <td className="p-1 w-10 text-center">
                                            <div
                                                className={cn(
                                                    "tooltip tooltip-left lg:tooltip-left flex items-center gap-2 cursor-help",
                                                    !approvalComments && "tooltip-disabled",
                                                    THEME.TextInputReadOnly
                                                )}
                                                data-tip={approvalComments || "No comments"}
                                            >
                                                {approvalStatus === true && (
                                                    <div className="flex items-center gap-1 text-success font-medium text-xs">
                                                        <CheckCircle2 size={16} />
                                                        <span>Approved</span>
                                                    </div>
                                                )}
                                                
                                                {approvalStatus === false && (
                                                    <div className="flex items-center gap-1 text-error font-medium text-xs">
                                                        <XCircle size={16} />
                                                        <span>Rejected</span>
                                                    </div>
                                                )}
                                                
                                                {approvalStatus === undefined && (
                                                    <div className="flex items-center gap-1 text-base-content/50 font-medium text-xs italic">
                                                        <Clock size={16} />
                                                        <span>Pending</span>
                                                    </div>
                                                )}

                                                {approvalComments && (
                                                    <MessageSquare 
                                                        size={12} 
                                                        className={cn(
                                                            "ml-1",
                                                            approvalStatus === true ? "text-green-500" : 
                                                            approvalStatus === false ? "text-green-500" : "text-base/30"
                                                        )} 
                                                    />
                                                )}
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
    )
}