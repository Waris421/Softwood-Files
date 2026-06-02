'use client';

import * as z from "zod";
import { useFormRegistry } from "./FormContext";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useEffect } from "react";
import { cn } from "@/_components/generic/utils";
import { THEME } from "@/_components/constants/ui";

const rowSchema = z.object({
    id: z.number(),
    Inventory: z.string().min(1, 'This is required'),
    InventoryName: z.string().optional(),
    Variant: z.string().optional(),
    Unit: z.string().optional(),
    Quantity: z.number().min(0),
    Price: z.number().optional(),
    Currency: z.string().optional(),
})

const formSchema = z.object({
    items: z.array(rowSchema),
})

type FormValues = z.input<typeof formSchema>;

const FORM_NAME_WITH_PARENT = 'Inventories';

export default function InventoryTable() {
    const { 
        setFormData, getCombinedData, registerValidator,
        registerCustomAction, customAction
    } = useFormRegistry();
    
    const {
        register, control, getValues, trigger, reset, formState: { errors }
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

    //Pull default values at the start from parent
    useEffect(() => {
        const initialValues = getCombinedData()[FORM_NAME_WITH_PARENT];

        if (initialValues && initialValues.items && initialValues.items.length > 0) {
            reset(initialValues);
        }
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

    return (
        <div className="w-full space-y-4">
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
                                        <td className="p-1 w-25">
                                            
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