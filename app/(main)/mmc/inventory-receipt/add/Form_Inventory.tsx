'use client';

import * as z from "zod";
import { useFormRegistry } from "./FormContext";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useEffect } from "react";
import { cn } from "@/_components/generic/utils";
import { THEME } from "@/_components/constants/ui";
import { Popover, PopoverClose, PopoverContent, PopoverTrigger } from "@/_components/ui/popover";
import { ExternalLink, Info, X } from "lucide-react";
import Link from "next/link";

const rowSchema = z.object({
    id: z.number(),
    Inventory: z.string().min(1, 'This is required'),
    InventoryName: z.string().optional(),
    Variant: z.string().optional(),
    Unit: z.string().optional(),
    Quantity: z.number().min(0),
    Price: z.number().optional(),
    Currency: z.string().optional(),
    Details: z.array(z.object({
        WorkOrder: z.number(),
        StyleCode: z.string(),
        Customer: z.string(),
        Merchandiser: z.string(),
        DetailsQuantity: z.number(),
    })).optional(),
})

const formSchema = z.object({
    items: z.array(rowSchema),
})

type FormValues = z.input<typeof formSchema>;

const FORM_NAME_WITH_PARENT = 'inventory';

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

    const items = watchedItems.items

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

    //Refresh the inventories when the po change.
    useEffect(() => {
        registerCustomAction('REFRESH_INVENTORY_TABLE', (data: any) => {
            reset({ items: data });
        });
    }, [registerCustomAction, reset]);

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
            {fields.length ? (
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
                                </tr>
                            </thead>
                            <tbody>
                                {fields.map((field, index) => {
                                    const details = items?.[index]?.Details || [];
                                    const allocatedQuantity = details.reduce((sum, d) => sum + (d.DetailsQuantity || 0), 0);
                                    const extraQuantity = ((items?.[index]?.Quantity || 0) - allocatedQuantity).toFixed(2);

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

                                                    {details.length > 0 && (
                                                        <Popover>
                                                            <PopoverTrigger asChild>
                                                                <button
                                                                    className={THEME.ButtonOutLine}
                                                                    type="button"
                                                                >
                                                                    <Info size={16} />
                                                                </button>
                                                            </PopoverTrigger>
                                                            <PopoverContent
                                                                side="right"
                                                                align="start"
                                                                sideOffset={10}
                                                                className="z-50 w-full p-4 rounded-lg shadow-xl animate-in fade-in zoom-in duration-200"
                                                            >
                                                                <div className="bg-slate-50 dark:bg-slate-90w-112.50/50 px-3 py-2 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                                                                    <div className="flex flex-col gap-0.5 max-w-[85%]">
                                                                        <h4 className="text-[12px] font-semibold text-slate-800 truncate">
                                                                            {items?.[index]?.InventoryName}
                                                                            {items?.[index]?.Variant && (
                                                                                <span className="ml-1.5 px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-medium text-[10px]">
                                                                                    {items?.[index]?.Variant}
                                                                                </span>
                                                                            )}
                                                                        </h4>
                                                                    </div>
                                                                    <div className="flex items-center gap-2">
                                                                        <PopoverClose className="btn btn-ghost btn-xs btn-circle text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                                                                            <X size={14} />
                                                                            <span className="sr-only">Close</span>
                                                                        </PopoverClose>
                                                                    </div>
                                                                </div>

                                                                <div className="max-h-80 overflow-auto">
                                                                    <table className="table table-xs w-full">
                                                                        <thead className="sticky top-0 bg-base-100 shadow-sm z-10">
                                                                            <tr className="border-b border-base-300">
                                                                                <th className="bg-base-100">Work Order</th>
                                                                                <th className="bg-base-100">Style</th>
                                                                                <th className="bg-base-100">Customer</th>
                                                                                <th className="bg-base-100">Merchandiser</th>
                                                                                <th className="bg-base-100 text-right">Qty</th>
                                                                            </tr>
                                                                        </thead>
                                                                        <tbody className="divide-y divide-base-200">
                                                                            {details.map((item, detailIndex) => (
                                                                                <tr key={`${field.id}-${detailIndex}`} className="hover:bg-base-200/50">
                                                                                    <td className="py-2">
                                                                                        <Link
                                                                                            href={`/merchandising/work-order/${item.WorkOrder}/edit`}
                                                                                            className="group inline-flex items-center gap-1"
                                                                                            target="_blank"
                                                                                        >
                                                                                            <code className={cn(
                                                                                                    "text-[10px] font-mono font-medium px-1.5 py-0.5 rounded",
                                                                                                    "bg-blue-50 dark:bg-blue-900/30",
                                                                                                    "text-blue-700 dark:text-blue-300",
                                                                                                    "border border-blue-100 dark:border-blue-800",
                                                                                                    "group-hover:bg-blue-100 dark:group-hover:bg-blue-800/50",
                                                                                                    "group-hover:border-blue-300 dark:group-hover:border-blue-500",
                                                                                                    "transition-colors cursor-pointer",
                                                                                                )}
                                                                                            >
                                                                                                {item.WorkOrder}
                                                                                            </code>
                                                                                            <ExternalLink size={10} className="text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                                                        </Link>
                                                                                    </td>
                                                                                    <td>{item.StyleCode}</td>
                                                                                    <td className="max-w-25 truncate">{item.Customer}</td>
                                                                                    <td className="max-w-25 truncate">{item.Merchandiser}</td>
                                                                                    <td className="text-right font-mono font-semibold">{item.DetailsQuantity}</td>
                                                                                </tr>
                                                                            ))}
                                                                        </tbody>
                                                                        <tfoot className="sticky bottom-0 bg-base-200">
                                                                            <tr className="border-t-2 border-base-300">
                                                                                <td colSpan={5} className="p-2">
                                                                                    <div className="flex justify-end gap-6 items-center">
                                                                                        {/* Allocated Quantity */}
                                                                                        <div className="flex items-center gap-2">
                                                                                            <span className="text-[10px] uppercase font-bold opacity-60">Allocated</span>
                                                                                            <span className="badge badge-ghost font-mono font-bold">{allocatedQuantity}</span>
                                                                                        </div>

                                                                                        {/* Divider */}
                                                                                        <div className="w-px h-4 bg-base-300" />

                                                                                        <div className="flex items-center gap-2">
                                                                                            <span className="text-[10px] uppercase font-bold opacity-60">Excess</span>
                                                                                            <span className="badge font-mono font-bold">{extraQuantity}</span>
                                                                                        </div>
                                                                                    </div>
                                                                                </td>
                                                                            </tr>
                                                                        </tfoot>
                                                                    </table>
                                                                </div>
                                                            </PopoverContent>
                                                        </Popover>
                                                    )}
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
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                </form>
            ) : (
                <div className="text-center p-8 text-gray-400">
                    Select a valid Purchase Order to load data
                </div>
            )}
        </div>
    )
}