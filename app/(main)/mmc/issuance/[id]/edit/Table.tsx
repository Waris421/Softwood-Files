'use client';

import { THEME } from "@/_components/constants/ui";
import LoadingIcon from "@/_components/generic/Loading";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import * as z from "zod";

interface TableProps {
    initialData: any[];
    isLoading: boolean;
    onDataChange: (data: any[]) => void;
}

const rowSchema = z.object({
    IssueInvId: z.number(),
    Inventory: z.string(),
    Variant: z.string(),
    Quantity: z.number().min(0),
})

const formSchema = z.object({
    items: z.array(rowSchema),
})

type FormValues = z.input<typeof formSchema>;

export default function Table({ initialData, isLoading, onDataChange }: TableProps) {
    const { register, control, reset, formState: { errors } } = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: { items: initialData || [] }
    });

    const { fields } = useFieldArray({ control, name: "items" });
    const watchedItems = useWatch({ control, name: "items" });

    useEffect(() => {
        if (!isLoading && initialData) {
            reset({ items: initialData });
        }
    }, [isLoading, initialData, reset]);

    useEffect(() => {
        if (watchedItems) {
            onDataChange(watchedItems.map(item => ({
                Inventory: item.Inventory,
                Variant: item.Variant,
                Quantity: item.Quantity,
            })));
        }
    }, [watchedItems, onDataChange]);

    if (isLoading) return <LoadingIcon />;

    return (
        <div className="overflow-x-auto rounded-lg border border-base-300 m-4">
            <table className="table w-full">
                <thead>
                    <tr className="bg-base-200">
                        <th className="p-2 border-b text-center">Ref#</th>
                        <th className="p-2 border-b text-center">Inventory Code</th>
                        <th className="p-2 border-b text-center">Variant</th>
                        <th className="p-2 border-b text-center">Quantity</th>
                    </tr>
                </thead>
                <tbody>
                    {fields.map((field, index) => (
                        <tr key={field.id} className={THEME.Table.RowHover}>
                            <td className="p-2 text-center">
                                <div className={THEME.TextInputReadOnly}>{field.IssueInvId}</div>
                            </td>
                            <td className="p-2 text-center">
                                <div className={THEME.TextInputReadOnly}>{field.Inventory}</div>
                            </td>
                            <td className="p-2 text-center">
                                <div className={THEME.TextInputReadOnly}>{field.Variant}</div>
                            </td>
                            <td className="p-2 text-center">
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
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
