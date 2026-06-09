'use client';

import { THEME } from "@/_components/constants/ui";
import LoadingIcon from "@/_components/generic/Loading";
import { cn } from "@/_components/generic/utils";
import { Checkbox } from "@/_components/ui/checkbox";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { Controller, useFieldArray, useForm, useWatch } from "react-hook-form";
import * as z from "zod";

interface TableProps {
  initialData: FormValues['items'];
  isLoading: boolean;
  onDataChange: (data: any[]) => void;
}

const rowSchema = z.object({
    Inventory: z.string().min(1, 'This is required'),
    InventoryName: z.string().optional(),
    Variant: z.string().optional(),
    Unit: z.string().optional(),
    Quantity: z.number().min(0),
    selected: z.boolean().default(false),
})

const formSchema = z.object({
    items: z.array(rowSchema),
})

type FormValues = z.input<typeof formSchema>;

export default function Table ({ initialData, onDataChange, isLoading }: TableProps) {
    const { 
        register, control, reset, setValue, formState: { errors } 
    } = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            items: initialData?.map(item => ({ ...item, selected: false })) || []
        }
    });

    const { fields } = useFieldArray({ control, name: "items" });

    const watchedItems = useWatch({
        control,
        name: "items",
    });

    const isAllSelected = watchedItems.length > 0 && watchedItems.every((item) => item.selected);
    const isSomeSelected = watchedItems.some((item) => item.selected) && !isAllSelected;

    useEffect(() => {
        if (watchedItems) {
            const selectedInventories = watchedItems
                .filter(item => item?.selected)
                .map(item => ({
                    Inventory: item.Inventory,
                    Variant: item.Variant,
                    Quantity: item.Quantity,
                }));
            
            onDataChange(selectedInventories);
        }
    }, [watchedItems, onDataChange]);

    useEffect(() => {
        if (!isLoading && initialData) {
            reset({ 
                items: initialData.map(item => ({ ...item, selected: false })) 
            });
        }
    }, [isLoading, initialData, reset]);

    const handleSelectAll = (checked: boolean) => {
        watchedItems.forEach((_, index) => {
            setValue(`items.${index}.selected`, checked);
        });
    }

    if (isLoading) return (
        <LoadingIcon />
    );

    return (
        <div className="overflow-x-auto rounded-lg border border-base-300">
            <table className="table w-full">
                <thead className={THEME.Table.HeaderRow}>
                    <tr className="bg-base-200">
                        <th className="p-1 border-b text-center w-20">
                            <div className="flex justify-center">
                                <Checkbox
                                    className="size-8"
                                    checked={isAllSelected || (isSomeSelected ? "indeterminate" : false)}
                                    onCheckedChange={(checked) => handleSelectAll(!!checked)}
                                />
                            </div>
                        </th>
                        <th className="p-1 border-b text-center w-40">Inventory Code</th>
                        <th className="p-1 border-b text-center w-100">Inventory Name</th>
                        <th className="p-1 border-b text-center w-40">Variant</th>
                        <th className="p-1 border-b text-center w-25">Quantity</th>
                        <th className="p-1 border-b text-center w-40">Unit</th>
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
                                <td className="p-1 w-20 text-center">
                                    <div className="flex justify-center">
                                        <Controller
                                            control={control}
                                            name={`items.${index}.selected`}
                                            render={({ field: { onChange, value } }) => (
                                                <Checkbox 
                                                    className="size-6"
                                                    checked={value} 
                                                    onCheckedChange={onChange} 
                                                />
                                            )}
                                        />
                                    </div>
                                </td>
                                <td className="p-1 w-40 text-center">
                                    <div className={THEME.TextInputReadOnly}>{field.Inventory}</div>
                                </td>
                                <td className="p-1 w-100 text-center">
                                    <div className={THEME.TextInputReadOnly}>{field.InventoryName}</div>
                                </td>

                                <td className="p-1 w-40 text-center">
                                    <div className={THEME.TextInputReadOnly}>{field.Variant}</div>
                                </td>
                                <td className="p-1 w-25 text-center">
                                    <input 
                                        {...register(`items.${index}.Quantity` as const, { valueAsNumber: true })} 
                                        className={`${THEME.TextInput} text-center`}
                                        type="number"
                                        min={0}
                                    />
                                    {errors.items?.[index]?.Quantity && (
                                        <p className="text-[10px] text-red-500 mt-1">{errors.items[index]?.Quantity?.message}</p>
                                    )}
                                </td>
                                <td className="p-1 w-40 text-center">
                                    <div className={THEME.TextInputReadOnly}>{field.Unit}</div>
                                </td>
                            </tr>
                        )
                    })}
                </tbody>
            </table>
        </div>
    )
}