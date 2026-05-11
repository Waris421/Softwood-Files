'use client';

import * as z from "zod";
import { useFormRegistry } from "./FormContext";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useEffect, useState } from "react";
import { THEME } from "@/_components/constants/ui";
import { cn } from "@/_components/generic/utils";
import { ExternalLink, Info, ListFilter, Settings2, X } from "lucide-react";
import { Popover, PopoverClose, PopoverContent, PopoverTrigger } from "@/_components/ui/popover";
import LoadingIcon from "@/_components/generic/Loading";
import { Checkbox } from "@/_components/ui/checkbox";

//If we need to do any validation on rows, do so here.
const rowSchema = z.object({
    id: z.union([z.string(), z.number()]).optional(),
    Inventory: z.string().min(1, "Required"),
    Required: z.number(),
    Adjustment: z.number(),
    selected: z.boolean().default(false),
})

//If we need to do any validation on cols, do so here.
const formSchema = z.object({
    items: z.array(rowSchema),
})

type FormValues = z.input<typeof formSchema>;

type DisplayRow = FormValues['items'][number] & {
    InventoryName?: string;
    Variant?: string;
    Ordered?: number;
    Received?: number;
    Issued?: number;
    selected?: boolean;
};

const FORM_NAME_WITH_PARENT = 'Requirement';

export default function RequirementForm() {
    const { 
        setFormData, getCombinedData, registerValidator, customAction
    } = useFormRegistry();

    const {
        register, control, getValues, trigger, reset, formState: { errors }, setValue
    } = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: { items: [] }
    });

    const [historyData, setHistoryData] = useState<any[]>([]);
    const [isLoadingHistory, setIsLoadingHistory] = useState(false);

    const watchedItems = useWatch({ control });
    const { fields } = useFieldArray({ control, name: "items" });
    const items = watchedItems.items as DisplayRow[];

    const [filters, setFilters] = useState({
        inventory: '',
        variant: '',
        requiredOnly: false,
        orderedDiff: false,
        receivedDiff: false,
        issuedDiff: false
    });

    const filteredFields = fields.filter((field) => {
        const item = items?.find((i, idx) => fields[idx]?.id === field.id);

        if (!item) return true;

        const TOLERANCE_THRESHOLD = 0.9;

        //Text filters
        const matchInventory = (item.InventoryName || "").toLowerCase().includes(filters.inventory.toLowerCase());
        const matchVariant = (item.Variant || "").toLowerCase().includes(filters.variant.toLowerCase());

        // Logic filters
        const matchRequired = filters.requiredOnly ? (item.Required || 0) > 0 : true;

        const threshold = (item.Required || 0) * TOLERANCE_THRESHOLD;

        //Difference filters
        const matchOrdered = filters.orderedDiff 
            ? (item.Ordered || 0) < threshold 
            : true;
        
        const matchReceived = filters.receivedDiff 
            ? (item.Received || 0) < threshold 
            : true;
        
        const matchIssued = filters.issuedDiff 
            ? (item.Issued || 0) < threshold 
            : true;

        return matchInventory && matchVariant && matchRequired && matchOrdered && matchReceived && matchIssued;
    });

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

    //Helper to get the row color based on inventory status.
    const getStatusTextColor = (row: DisplayRow) => {
        const required = row.Required || 0;
        const ordered = row.Ordered || 0;
        const received = row.Received || 0;
        const issued = row.Issued || 0;

        const TOLERANCE_THRESHOLD = 0.9;
        const acceptableThreshold = required * TOLERANCE_THRESHOLD;

        //Extremely big problem: Ordered < Required
        if (ordered < acceptableThreshold && required > 0) {
            return THEME.Text.RedText; 
        }

        //All required inventory received and issued (lowest visibility)
        if (issued >= acceptableThreshold && required > 0) {
            return `${THEME.Text.GrayText} opacity-60`;
        }

        //Required inventory received completely. Low visibiity
        if (received >= acceptableThreshold && required > 0) {
            return THEME.Text.GrayText;
        }

        //Ordered but not received
        if (ordered >= acceptableThreshold && received < ordered) {
            return THEME.Text.BlueText;
        }

        //Default
        return "text-base-content";
    }

    //Helper function to get the requirement history
    const getRequirementHistory = async (id?: string|number) => {
        if (!id) return ;

        setIsLoadingHistory(true);
        setHistoryData([]);
        
        const orderNumber = getCombinedData()['Order']?.['OrderNumber'];

        const url = `/api/merchandising/work-order/requirement?id=${id}&workOrder=${orderNumber}`
        try {
            const response = await fetch(url);
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.details?.message || "Failed to fetch history");
            }

            const data = await response.json();
            setHistoryData(data);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoadingHistory(false);
        }
    }

    //Helper function to select/deselect all rows
    const handleSelectAll = (checked: boolean) => {
        filteredFields.forEach((field) => {
            const realIndex = items.findIndex((_, idx) => fields[idx].id === field.id);

            if (realIndex !== -1) {
                setValue(`items.${realIndex}.selected`, checked);
            }
        });
    }

    const isAllSelected = filteredFields.every((field) => {
        const realIndex = items.findIndex((_, idx) => fields[idx].id === field.id);
        return items[realIndex]?.selected === true;
    })

    return (
        <form className="space-y-4 p-4" autoComplete="off">
            <div className="overflow-x-auto rounded-lg border border-base-300">
                <table className="table w-full">
                    <thead className={THEME.Table.HeaderRow}>
                        {/* Header Row */}
                        <tr className="bg-base-200">
                            <th className="p-1 border-b text-center w-10">
                                <Checkbox 
                                    className="size-8"
                                    checked={isAllSelected}
                                    onCheckedChange={(checked) => handleSelectAll(!!checked)}
                                />
                            </th>
                            <th className="p-1 border-b text-center w-100">Inventory</th>
                            <th className="p-1 border-b text-center w-40">Variant</th>
                            <th className="p-1 border-b text-center w-40">Required</th>
                            <th className="p-1 border-b text-center w-25">Ordered</th>
                            <th className="p-1 border-b text-center w-25">Received</th>
                            <th className="p-1 border-b text-center w-25">Issued</th>
                        </tr>

                        {/* Filter row */}
                        <tr className="bg-base-100 border-b border-base-300">
                            <td className="p-1 text-center">
                                <ListFilter size={14} className="mx-auto text-slate-400" />
                            </td>
                            <td className="p-1">
                                <input 
                                    className="input input-bordered input-xs w-full font-normal"
                                    placeholder="Filter name..."
                                    value={filters.inventory}
                                    onChange={(e) => setFilters(f => ({...f, inventory: e.target.value}))}
                                />
                            </td>
                            <td className="p-1">
                                <input 
                                    className="input input-bordered input-xs w-full font-normal"
                                    placeholder="Filter variant..."
                                    value={filters.variant}
                                    onChange={(e) => setFilters(f => ({...f, variant: e.target.value}))}
                                />
                            </td>
                            <td className="p-1 text-center">
                                <Checkbox 
                                    className="size-7"
                                    checked={filters.requiredOnly}
                                    onCheckedChange={(v) => setFilters(f => ({...f, requiredOnly: !!v}))}
                                />
                            </td>
                            <td className="p-1 text-center">
                                <Checkbox 
                                    className="size-7"
                                    checked={filters.orderedDiff}
                                    onCheckedChange={(v) => setFilters(f => ({...f, orderedDiff: !!v}))}
                                />
                            </td>
                            <td className="p-1 text-center">
                                <Checkbox 
                                    className="size-7"
                                    checked={filters.receivedDiff}
                                    onCheckedChange={(v) => setFilters(f => ({...f, receivedDiff: !!v}))}
                                />
                            </td>
                            <td className="p-1 text-center">
                                <Checkbox 
                                    className="size-7"
                                    checked={filters.issuedDiff}
                                    onCheckedChange={(v) => setFilters(f => ({...f, issuedDiff: !!v}))}
                                />
                            </td>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredFields.map((field, index) => {
                            const realIndex = items.findIndex((_, idx) => fields[idx].id === field.id);

                            if (realIndex === -1) return null;

                            const rowData = items[realIndex];
                            const statusColorClass = getStatusTextColor(rowData);
                            
                            return (
                                <tr
                                    key={field.id}
                                    className={cn(
                                        "transition-colors",
                                        THEME.Table.RowHover,
                                        statusColorClass
                                    )}
                                >
                                    <td className="p-1 text-center">
                                        <Checkbox 
                                            className="size-6"
                                            checked={watchedItems.items?.[realIndex]?.selected || false}
                                            onCheckedChange={(checked) => {
                                                setValue(`items.${realIndex}.selected`, !!checked);
                                            }}
                                        />
                                    </td>

                                    <td className="p-1 w-100 text-center">
                                        <div className={cn(THEME.TextInputReadOnly, "flex items-center justify-between gap-2 px-2")}>
                                            <span className="truncate">{rowData.InventoryName}</span>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <button
                                                        type="button"
                                                        className="btn btn-ghost btn-xs btn-circle hover:bg-slate-200 dark:hover:bg-slate-700"
                                                        onClick={() => getRequirementHistory(rowData.id)}
                                                    >
                                                        <Info size={14} />
                                                    </button>
                                                </PopoverTrigger>

                                                <PopoverContent
                                                    side="right"
                                                    align="start"
                                                    sideOffset={10}
                                                    className="w-130 p-0 shadow-2xl border border-slate-300 bg-white dark:bg-slate-800 dark:border-slate-600 overflow-hidden"
                                                >
                                                    <div className="bg-slate-50 dark:bg-slate-90w-112.50/50 px-3 py-2 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                                                        <div className="flex flex-col gap-0.5 max-w-[85%]">
                                                            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                                                                Requirement History
                                                            </span>
                                                            <h4 className="text-[12px] font-semibold text-slate-800 truncate">
                                                                {rowData.InventoryName}
                                                                {rowData.Variant && (
                                                                    <span className="ml-1.5 px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-medium text-[10px]">
                                                                        {rowData.Variant}
                                                                    </span>
                                                                )}
                                                            </h4>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            {isLoadingHistory && (
                                                                <span className="loading loading-spinner loading-xs text-blue-500"></span>
                                                            )}
                                                            <PopoverClose className="btn btn-ghost btn-xs btn-circle text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                                                                <X size={14} />
                                                                <span className="sr-only">Close</span>
                                                            </PopoverClose>
                                                        </div>
                                                        
                                                    </div>

                                                    <div className="p-2">
                                                        {isLoadingHistory ? (
                                                            <div className="space-y-3 p-2">
                                                                {[1, 2, 3].map((i) => (
                                                                    <div key={i} className="flex gap-2">
                                                                    <div className="h-3 bg-slate-100 dark:bg-slate-700 animate-pulse rounded w-1/4"></div>
                                                                    <div className="h-3 bg-slate-100 dark:bg-slate-700 animate-pulse rounded w-1/4"></div>
                                                                    <div className="h-3 bg-slate-100 dark:bg-slate-700 animate-pulse rounded w-1/2"></div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        ) : historyData.length > 0 ? (
                                                            <div className="max-h-72 overflow-y-auto overflow-x-auto">
                                                                <table className="table table-xs w-full text-slate-700 dark:text-slate-200">
                                                                    <thead>
                                                                        <tr className="text-slate-400 border-b border-slate-100 dark:border-slate-700">
                                                                            <th className="w-20 font-medium px-1">Date</th>
                                                                            <th className="w-16 font-medium px-1">Type</th>
                                                                            <th className="w-16 font-medium px-1">ID</th>
                                                                            <th className="w-32 font-medium px-1 text-left">Source</th>
                                                                            <th className="w-20 font-medium px-1 text-right">Allocated</th>
                                                                            <th className="w-20 font-medium px-1 text-right">Total</th>
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody className="divide-y divide-slate-50 dark:divide-slate-700/50">
                                                                        {historyData.map((item) => (
                                                                            <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                                                                                <td className="py-2 px-1 whitespace-nowrap text-[10px]">
                                                                                {item.TransactionDate}
                                                                                </td>
                                                                                <td className="py-2 px-1">
                                                                                    <span className="text-[9px] font-bold px-1 rounded border">{item.Type}</span>
                                                                                </td>
                                                                                <td className="py-2 px-1">
                                                                                    <a
                                                                                        href={item.URL}
                                                                                        target="_blank"
                                                                                        rel="noopener noreferrer"
                                                                                        className="group inline-flex items-center gap-1"
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
                                                                                            {item.id}
                                                                                        </code>
                                                                                        <ExternalLink size={10} className="text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                                                    </a>
                                                                                </td>
                                                                                <td className="py-2 px-1 text-[10px] truncate" title={item.Source}>
                                                                                    {item.Source}
                                                                                </td>
                                                                                <td className="py-2 px-1 text-right font-mono font-bold text-slate-900 dark:text-white">
                                                                                    {item.AllocatedQuantity}
                                                                                </td>
                                                                                <td className="py-2 px-1 text-right font-mono text-slate-500 dark:text-slate-400">
                                                                                    {item.TotalQuantity}
                                                                                </td>
                                                                            </tr>
                                                                        ))}
                                                                    </tbody>
                                                                </table>
                                                            </div>
                                                        ) : (
                                                            <div className="py-10 text-center">
                                                                <p className="text-xs text-slate-400 italic">No history records found.</p>
                                                            </div>
                                                        )}
                                                    </div>  
                                                </PopoverContent>
                                            </Popover>                                  
                                        </div>
                                    </td>
                                    <td className="p-1 w-40 text-center">
                                        <div className={THEME.TextInputReadOnly}>{rowData.Variant}</div>
                                    </td>
                                    <td className="p-1 w-40">
                                        <div className="flex items-center justify-between gap-2">
                                            <input
                                                {...register(`items.${realIndex}.Required` as const, { valueAsNumber: true })}
                                                className={`${THEME.TextInputReadOnly} text-right grow`}
                                                type="text"
                                                readOnly
                                            />

                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <button
                                                        type="button"
                                                        className={cn(
                                                            THEME.ButtonOutLine,
                                                            "w-fit px-2 flex-none"
                                                        )}
                                                    >
                                                        <Settings2 size={14} />
                                                    </button>
                                                </PopoverTrigger>

                                                <PopoverContent
                                                    side="bottom"
                                                    align="end"
                                                    className="w-48 p-3 shadow-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                                                >
                                                    <div className="space-y-2">
                                                        <div className="flex flex-col gap-1">
                                                            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                                                                Adjustment %
                                                            </label>
                                                            <input 
                                                                {...register(`items.${realIndex}.Adjustment` as const, { valueAsNumber: true })}
                                                                className={cn(THEME.TextInput, "input-sm w-full")}
                                                                type="number"
                                                                placeholder="0"
                                                                autoFocus
                                                                step={1}
                                                            />
                                                        </div>
                                                    </div>
                                                </PopoverContent>
                                            </Popover>
                                        </div>
                                        {errors.items?.[realIndex]?.Adjustment && (
                                            <p className="text-[10px] text-red-500 italic">
                                                {errors.items[realIndex]?.Adjustment?.message}
                                            </p>
                                        )}
                                    </td>
                                    <td className="p-1 w-25 text-center">
                                        <div className={THEME.TextInputReadOnly}>{rowData.Ordered}</div>
                                    </td>
                                    <td className="p-1 w-25 text-center">
                                        <div className={THEME.TextInputReadOnly}>{rowData.Received}</div>
                                    </td>
                                    <td className="p-1 w-25 text-center">
                                        <div className={THEME.TextInputReadOnly}>{rowData.Issued}</div>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        </form>
    )
}