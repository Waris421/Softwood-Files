'use client';

import { useCallback, useEffect, useState } from "react";
import { useFormRegistry } from "./FormContext";
import * as z from "zod";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { THEME } from "@/_components/constants/ui";
import { Button } from "@/_components/ui/button";
import { Minus, Plus } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/_components/ui/alert-dialog";

//If we need to do any validation on rows, do so here.
const rowSchema = z.object({
    Variant: z.string().min(1, 'Variant is required'),
    Quantity: z.number(),
    Description: z.string().optional()
})

//If we need to do any validation on cols, do so here.
const formSchema = z.object({
    items: z.array(rowSchema),
});

type FormValues = z.infer<typeof formSchema>;

const FORM_NAME_WITH_PARENT = 'variant';

export default function VariantForm(){
    const { 
        setFormData, getCombinedData, registerValidator, registerCustomAction, customAction
     } = useFormRegistry();
    const {
        register, control, getValues, trigger, formState: { errors }
    } = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: getCombinedData()[FORM_NAME_WITH_PARENT] || { 
            items: [{ Variant: '', Quantity: 1 }] 
        }
    });
    const [indexToDelete, setIndexToDelete] = useState<number | null>(null);
    const watchedItems = useWatch({
        control,
    });
    const { fields, append, remove, insert, replace } = useFieldArray({
        control,
        name: "items"
    });

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

    //Register any custom actions with the parent on mount
    useEffect(() => {
        registerCustomAction('reCalculateVariants', reCalculateVariants);
    }, [registerCustomAction]);

    const reCalculateVariants = async(styleCode: string) => {
        const calculateAPIUrl = `/api/merchandising/work-order/variant/calculate?style=${styleCode}`;

        const response = await fetch(calculateAPIUrl);

        const variantsList = await response.json();

        if (Array.isArray(variantsList) && variantsList.length > 0) {
            const newRows = variantsList.map((variantName: string) => ({
                Variant: variantName,
                Quantity: 1,
                Description: ''
            }));

            replace(newRows);
        } else {
            replace([emptyRow]);
        }       
    }

    //Format for empty row
    const emptyRow = {
        Variant: '', 
        Quantity: 1,
    }

    //Code for the remove click button
    const handleRemoveClick = (index: number) => {
        const currentRow = getValues(`items.${index}`);
        const hasData = Object.values(currentRow).some(val => val !== '');

        if (hasData) {
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
                        <thead>
                            <tr className="bg-base-200">
                                <th className="p-1 border-b text-center w-100">Variant</th>
                                <th className="p-1 border-b text-center w-40">Quantity</th>
                                <th className="p-1 border-b text-center w-100">Description</th>
                                <th className="p-1 border-b text-center w-40">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {fields.map((field, index) => (
                                <tr
                                    key={field.id}
                                    className={`transition-colors ${
                                        indexToDelete === index ? "bg-destructive/40" : "hover:bg-base-40"
                                    }`}
                                >
                                    <td className="p-1 w-100">
                                        <input 
                                            {...register(`items.${index}.Variant` as const)} 
                                            className={`${THEME.TextInput} text-center`}
                                            type="text"
                                            placeholder="Must match the style card variants"
                                            maxLength={255}
                                        />
                                        {errors.items?.[index]?.Variant && (
                                            <p className="text-[10px] text-red-500 mt-1">{errors.items[index]?.Variant?.message}</p>
                                        )}
                                    </td>
                                    <td className="p-1 w-40">
                                        <input 
                                            {...register(`items.${index}.Quantity` as const)} 
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
                            ))}
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