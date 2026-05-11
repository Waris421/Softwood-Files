'use client';

import * as z from "zod";
import { useFormRegistry } from "./FormContext";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useEffect, useState } from "react";
import { THEME } from "@/_components/constants/ui";
import { cn } from "@/_components/generic/utils";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/_components/ui/alert-dialog";
import { Button } from "@/_components/ui/button";
import { Minus, Plus } from "lucide-react";

//If we need to do any validation on rows, do so here.
const rowSchema = z.object({
    id: z.union([z.string(), z.number()]).optional(),
    Name: z.string().min(1, 'Variant is required'),
    Quantity: z.number(),
    Description: z.string().optional()
})

//If we need to do any validation on cols, do so here.
const formSchema = z.object({
    items: z.array(rowSchema),
});

type FormValues = z.infer<typeof formSchema>;

const FORM_NAME_WITH_PARENT = 'Variant';

export default function VariantForm() {
    const { 
        setFormData, getCombinedData, registerValidator, customAction
    } = useFormRegistry();
    
    const {
        register, control, getValues, trigger, reset, formState: { errors }
    } = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: { items: [{ id: '', Name: '', Quantity: 1 }] }
    });

    const [indexToDelete, setIndexToDelete] = useState<number | null>(null);
    const watchedItems = useWatch({
        control,
    });
    const { fields, append, remove, insert, replace } = useFieldArray({
        control,
        name: "items"
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

    //Format for empty row
    const emptyRow = {
        id: '',
        Name: '', 
        Quantity: 1,
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

    //Change the value of total quantity when one changes in the table.
    useEffect(() => {
        if (watchedItems?.items) {
            const totalQuantity = watchedItems.items.reduce((acc: number, item: any) => {
                const qty = Number(item.Quantity) || 0;
                return acc + qty;
            }, 0);

            customAction('updateQuantity', totalQuantity);
        }
    }, [watchedItems?.items]);

    return (
        <div className="w-full space-y-4">
            <form className="space-y-4 p-4" autoComplete="off">
                <div className="overflow-x-auto rounded-lg border border-base-300">
                    <table className="table w-full">
                        <thead className={THEME.Table.HeaderRow}>
                            <tr className="bg-base-200">
                                <th className="p-1 border-b text-center w-100">Variant</th>
                                <th className="p-1 border-b text-center w-40">Quantity</th>
                                <th className="p-1 border-b text-center w-100">Description</th>
                                <th className="p-1 border-b text-center w-40">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {fields.map((field, index) => {
                                register(`items.${index}.id`);
                                return (
                                    <tr
                                        key={field.id}
                                        className={cn(
                                            "transition-colors",
                                            THEME.Table.RowHover,
                                            indexToDelete === index && "bg-destructive/40"
                                        )}
                                    >
                                        <td className="p-1 w-100">
                                            <input 
                                                {...register(`items.${index}.Name` as const)} 
                                                className={`${THEME.TextInput} text-center`}
                                                type="text"
                                                placeholder="Must match the style card variants"
                                                maxLength={255}
                                            />
                                            {errors.items?.[index]?.Name && (
                                                <p className="text-[10px] text-red-500 mt-1">{errors.items[index]?.Name?.message}</p>
                                            )}
                                        </td>

                                        <td className="p-1 w-40">
                                            <input 
                                                {...register(`items.${index}.Quantity` as const, { valueAsNumber: true })} 
                                                className={`${THEME.TextInput} text-center`}
                                                type="number"
                                                placeholder="Must match the style card variants"
                                                maxLength={255}
                                            />
                                            {errors.items?.[index]?.Quantity && (
                                                <p className="text-[10px] text-red-500 mt-1">{errors.items[index]?.Quantity?.message}</p>
                                            )}
                                        </td>
                                        <td className="p-1 w-100">
                                            <input 
                                                {...register(`items.${index}.Description` as const)} 
                                                className={`${THEME.TextInput} text-center`}
                                                type="text"
                                                placeholder="If needed"
                                                maxLength={255}
                                            />
                                            {errors.items?.[index]?.Description && (
                                                <p className="text-[10px] text-red-500 mt-1">{errors.items[index]?.Description?.message}</p>
                                            )}
                                        </td>
                                        <td className="p-1 w-40">
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
                                )})}
                        </tbody>
                    </table>
                </div>
            </form>

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