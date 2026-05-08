'use client';

import { THEME } from "@/_components/constants/ui";
import LoadingIcon from "@/_components/generic/Loading";
import { cn } from "@/_components/generic/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import * as z from "zod";

interface TableProps {
  initialData: FormValues['items'];
  isLoading: boolean;
}

const rowSchema = z.object({
    OrderNumber: z.number(),
    StyleCode: z.string().optional(),
    InventoryCode: z.string().min(1, 'This is required'),
    InventoryName: z.string().optional(),
    Variant: z.string().optional(),
    Required: z.number().min(0),
    Ordered: z.number().min(0),
    ToOrder: z.number().min(0),
    Type: z.string().optional()
})

const formSchema = z.object({
    items: z.array(rowSchema),
})

type FormValues = z.input<typeof formSchema>;

export default function Table({ initialData, isLoading }: TableProps) {
    const { 
        register, control, handleSubmit, reset, formState: { errors, isSubmitting } 
    } = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            items: initialData || []
        }
    });

    const { fields } = useFieldArray({
        control,
        name: "items",
    });

    useEffect(() => {
        reset({ items: initialData });
    }, [initialData, reset]);

    const onSubmit = async(data: FormValues) => {
        console.log(data);
    }

    if (isLoading) return (
        <LoadingIcon />
    );

    return (
        <form className="space-y-4 p-4" autoComplete="off">
            <div className="overflow-x-auto rounded-lg border border-base-300">
                <table className="table w-full">
                    <thead className={THEME.Table.HeaderRow}>
                        <tr className="bg-base-200">
                            <th className="p-1 border-b text-center w-40">Order No.</th>
                            <th className="p-1 border-b text-center w-100">Style</th>
                            <th className="p-1 border-b text-center w-40">Code</th>
                            <th className="p-1 border-b text-center w-100">Name</th>
                            <th className="p-1 border-b text-center w-40">Variant</th>
                            <th className="p-1 border-b text-center w-25">Req</th>
                            <th className="p-1 border-b text-center w-25">Ord</th>
                            <th className="p-1 border-b text-center w-25">Bal</th>
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
                                    <td className="p-1 w-40 text-center">
                                        <div className={THEME.TextInputReadOnly}>{field.OrderNumber}</div>
                                    </td>
                                    <td className="p-1 w-100 text-center">
                                        <div className={THEME.TextInputReadOnly}>{field.StyleCode}</div>
                                    </td>
                                    <td className="p-1 w-40 text-center">
                                        <div className={THEME.TextInputReadOnly}>{field.InventoryCode}</div>
                                    </td>
                                    <td className="p-1 w-100 text-center">
                                        <div className={THEME.TextInputReadOnly}>{field.InventoryName}</div>
                                    </td>
                                    <td className="p-1 w-40 text-center">
                                        <div className={THEME.TextInputReadOnly}>{field.Variant}</div>
                                    </td>
                                    <td className="p-1 w-25 text-center">
                                        <div className={THEME.TextInputReadOnly}>{field.Required}</div>
                                    </td>
                                    <td className="p-1 w-25 text-center">
                                        <div className={THEME.TextInputReadOnly}>{field.Ordered}</div>
                                    </td>
                                    <td className="p-1 w-25 text-center">
                                        <input 
                                            {...register(`items.${index}.ToOrder` as const, { valueAsNumber: true })} 
                                            className={`${THEME.TextInput} text-center`}
                                            type="number"
                                            min={0}
                                        />
                                        {errors.items?.[index]?.ToOrder && (
                                            <p className="text-[10px] text-red-500 mt-1">{errors.items[index]?.ToOrder?.message}</p>
                                        )}
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