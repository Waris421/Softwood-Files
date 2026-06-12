'use client';

import AllocationDialogTest from "./AllocationDialogTest";
import * as z from "zod";
import { useFormRegistry } from "./FormContext";
import { Controller, useFieldArray, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useEffect, useState } from "react";
import { THEME } from "@/_components/constants/ui";
import { SingleDropdown } from "@/_components/Dropdown/Dropdown";
import { Button } from "@/_components/ui/button";
import { Minus, Plus, MoreHorizontal } from "lucide-react";
import { cn } from "@/_components/generic/utils";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/_components/ui/alert-dialog";
import { SearchPicker } from "@/_components/DialogBox/SearchPicker";

const rowSchema = z.object({
    id:            z.union([z.string(), z.number()]).optional(),
    Inventory:     z.string().min(1, "Required"),
    InventoryName: z.string().optional(),
    Variant:       z.string().optional(),
    Quantity:      z.number({ error: "Must be a number" }).positive("Must be greater than 0"),
    Price:         z.number({ error: "Must be a number" }).min(0, "Cannot be negative"),
    Currency:      z.string().min(1, "Required"),
    Forex:         z.number({ error: "Must be a number" }).positive("Must be greater than 0"),
});

const formSchema = z.object({ items: z.array(rowSchema) });

type FormValues = z.infer<typeof formSchema>;

const FORM_KEY = 'inventory';

export default function ItemsForm() {
    const { setFormData, getCombinedData, registerValidator, options, initialData } = useFormRegistry();
    const { register, control, getValues, trigger, reset, setValue, formState: { errors } } = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: { items: [{ Inventory: '', InventoryName: '', Variant: '', Quantity: 1, Price: 0, Currency: '', Forex: 1 }] }
    });

    const [indexToDelete, setIndexToDelete] = useState<number | null>(null);
    // Tracks which row's allocation dialog is open, and stores saved allocations per row
    const [allocDialogIndex, setAllocDialogIndex] = useState<number | null>(null);
    const [rowAllocations, setRowAllocations] = useState<Record<string, { WorkOrder: number; Quantity: number }[]>>({});
    const watchedItems = useWatch({ control });
    const { fields, append, remove, insert } = useFieldArray({ control, name: "items" });

    const currencyOptions = options.currencies || [];

    const emptyRow = {
        id: '', Inventory: '', InventoryName: '', Variant: '', Quantity: 1, Price: 0, Currency: '', Forex: 1,
    };

    // ── STEP 1: Populate rows when data arrives from FormContext ───────────────
    useEffect(() => {
        const existing = getCombinedData()[FORM_KEY];
        if (existing?.items?.length > 0) reset(existing);
    }, [initialData, getCombinedData, reset]);
    useEffect(() => {
        const existingAllocs = getCombinedData()['allocations'];
        if (existingAllocs && Object.keys(existingAllocs).length > 0) {
            setRowAllocations(existingAllocs);
            setFormData('allocations', existingAllocs);
        }
    }, [initialData, getCombinedData, setFormData]);

    // ── STEP 2: Push changes up to FormContext on every edit ───────────────────
    useEffect(() => {
        setFormData(FORM_KEY, watchedItems);
    }, [watchedItems, setFormData]);

    // ── STEP 3: Validate and register with parent ──────────────────────────────
    const validateForm = useCallback(() => {
        const result = formSchema.safeParse(getValues());
        if (!result.success) { trigger(); return false; }
        return true;
    }, [getValues, trigger]);

    useEffect(() => {
        registerValidator(FORM_KEY, validateForm);
        return () => registerValidator(FORM_KEY, () => true);
    }, [validateForm, registerValidator]);

    // ── STEP 4: Add / Remove row logic ────────────────────────────────────────
    const addEmptyRow = (index: number) => insert(index + 1, emptyRow);

    const handleRemoveClick = (index: number) => {
        const currentRow = getValues(`items.${index}`);
        const isModified = Object.keys(emptyRow).some((key) => {
            const cur = currentRow[key as keyof typeof emptyRow];
            const def = emptyRow[key as keyof typeof emptyRow];
            if (typeof def === 'number') return Number(cur) !== def;
            return (cur ?? '') !== (def ?? '');
        });
        if (isModified) setIndexToDelete(index);
        else executeDelete(index);
    };

    const executeDelete = (index: number) => {
        remove(index);
        if (fields.length === 1) append(emptyRow);
        setIndexToDelete(null);
    };

    return (
        <div className="w-full space-y-4">
            <form className="space-y-4 p-4" autoComplete="off">
                <div className="overflow-x-auto rounded-lg border border-base-300">
                    <table className="table w-full">
                        <thead>
                            <tr className="bg-base-200">
                                <th className="p-1 border-b text-center">Inventory</th>
                                <th className="p-1 border-b text-center">Variant</th>
                                <th className="p-1 border-b text-center">Quantity</th>
                                <th className="p-1 border-b text-center">Price</th>
                                <th className="p-1 border-b text-center">Currency</th>
                                <th className="p-1 border-b text-center">Forex</th>
                                <th className="p-1 border-b text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {fields.map((field, index) => {
                                register(`items.${index}.id`);
                                register(`items.${index}.Inventory`);
                                return (
                                    <tr
                                        key={field.id}
                                        className={cn(
                                            "transition-colors hover:bg-base-100",
                                            indexToDelete === index && "bg-destructive/40"
                                        )}
                                    >
                                        {/* Inventory SearchPicker */}
                                        <td className="p-1">
                                            <Controller
                                                control={control}
                                                name={`items.${index}.InventoryName`}
                                                render={({ field }) => (
                                                    <SearchPicker
                                                        id={`search-picker-inv-${index}`}
                                                        apiUrl="/api/options/inventories"
                                                        displayColumn="text"
                                                        columnMapping={[
                                                            { header: 'Code', key: 'value' },
                                                            { header: 'Name', key: 'text' },
                                                            { header: 'Unit', key: 'Unit' },
                                                        ]}
                                                        customClasses={{ trigger: "w-48" }}
                                                        value={field.value}
                                                        onSelect={(code, name) => {
                                                            field.onChange(name || '');
                                                            setValue(`items.${index}.Inventory`, code || '');
                                                        }}
                                                    />
                                                )}
                                            />
                                            {errors.items?.[index]?.Inventory && (
                                                <p className="text-[10px] text-red-500 mt-1">{errors.items[index]?.Inventory?.message}</p>
                                            )}
                                        </td>

                                        {/* Variant */}
                                        <td className="p-1">
                                            <input
                                                {...register(`items.${index}.Variant`)}
                                                className={THEME.TextInput}
                                                type="text"
                                                placeholder="Variant..."
                                            />
                                        </td>

                                        {/* Quantity */}
                                        <td className="p-1">
                                            <input
                                                {...register(`items.${index}.Quantity`, { valueAsNumber: true })}
                                                className={THEME.TextInput}
                                                type="number" step="any"
                                                placeholder="Qty..."
                                            />
                                            {errors.items?.[index]?.Quantity && (
                                                <p className="text-[10px] text-red-500 mt-1">{errors.items[index]?.Quantity?.message}</p>
                                            )}
                                        </td>

                                        {/* Price */}
                                        <td className="p-1">
                                            <input
                                                {...register(`items.${index}.Price`, { valueAsNumber: true })}
                                                className={THEME.TextInput}
                                                type="number" step="any"
                                                placeholder="Price..."
                                            />
                                            {errors.items?.[index]?.Price && (
                                                <p className="text-[10px] text-red-500 mt-1">{errors.items[index]?.Price?.message}</p>
                                            )}
                                        </td>

                                        {/* Currency */}
                                        <td className="p-1">
                                            <Controller
                                                control={control}
                                                name={`items.${index}.Currency`}
                                                render={({ field }) => (
                                                    <SingleDropdown
                                                        inputName={field.name}
                                                        defaultValue={field.value}
                                                        placeholder="Currency..."
                                                        widthClass="w-36"
                                                        staticOptions={currencyOptions}
                                                        onSelect={(opt) => field.onChange(opt?.value || '')}
                                                    />
                                                )}
                                            />
                                            {errors.items?.[index]?.Currency && (
                                                <p className="text-[10px] text-red-500 mt-1">{errors.items[index]?.Currency?.message}</p>
                                            )}
                                        </td>

                                        {/* Forex */}
                                        <td className="p-1">
                                            <input
                                                {...register(`items.${index}.Forex`, { valueAsNumber: true })}
                                                className={THEME.TextInput}
                                                type="number" step="any"
                                                placeholder="Forex..."
                                            />
                                            {errors.items?.[index]?.Forex && (
                                                <p className="text-[10px] text-red-500 mt-1">{errors.items[index]?.Forex?.message}</p>
                                            )}
                                        </td>

                                        {/* Actions */}
                                        <td className="p-1">
                                            <div className="flex justify-center gap-1">
                                                <AllocationDialogTest
                                                    onSave={(allocs) => {
                                                        setRowAllocations(prev => {
                                                            const updated = { ...prev, [String(getValues(`items.${index}.id`))] : allocs };
                                                            setFormData('allocations', updated);
                                                            return updated;
                                                        });
                                                    }}
                                                    rowId={Number(getValues(`items.${index}.id`))}
                                                    rowName={getValues(`items.${index}.InventoryName`) || ''}
                                                    rowVariant={getValues(`items.${index}.Variant`) || ''}
                                                    rowInventory={getValues(`items.${index}.Inventory`) || ''}
                                                    rowQuantity={Number(getValues(`items.${index}.Quantity`)) || 0}
                                                    poNumber={String(getCombinedData()?.header?.id || '')}
                                                    initialAllocations={rowAllocations[String(getValues(`items.${index}.id`))] || null}
                                                    workOrders={options.workorders || []}
                                                />

                                                <Button type="button" variant="outline" size="icon" className="h-8 w-8 cursor-pointer" onClick={() => addEmptyRow(index)}>
                                                    <Plus className="w-4 h-4" color="#38A169" />
                                                </Button>
                                                <Button type="button" variant="outline" size="icon" className="h-8 w-8 cursor-pointer" onClick={() => handleRemoveClick(index)}>
                                                    <Minus className="w-4 h-4" color="#E53E3E" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </form>

            <AlertDialog open={indexToDelete !== null} onOpenChange={() => setIndexToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>This row contains data. Deleting it will remove the data.</AlertDialogDescription>
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
            {/* Allocation dialog — opens when ⋮ is clicked on a row */}
            {/* {allocDialogIndex !== null && fields[allocDialogIndex] && (() => {
                const idx = allocDialogIndex;
                const row = getValues(`items.${idx}`);
                return (
                    <AllocationDialog
                        open={true}
                        onClose={() => setAllocDialogIndex(null)}
                        onSave={(allocs) => {
                            setRowAllocations(prev => {
                                const updated = { ...prev, [String(row.id)]: allocs };
                                setFormData('allocations', updated);
                                return updated;
                            });
                        }}
                        rowId={Number(row.id)}
                        rowName={row.InventoryName || ''}
                        rowVariant={row.Variant || ''}
                        rowInventory={row.Inventory || ''}
                        rowQuantity={Number(row.Quantity) || 0}
                        poNumber={String(getCombinedData()?.header?.id || '')}
                        initialAllocations={rowAllocations[String(row.id)] || null}
                    />
                );
            })()} */}

        </div>
    );
}
