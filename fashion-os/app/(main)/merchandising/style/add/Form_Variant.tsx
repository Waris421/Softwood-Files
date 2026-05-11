'use client';

import { zodResolver } from "@hookform/resolvers/zod";
import { useFormRegistry } from "./FormContext";
import * as z from "zod";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { useCallback, useEffect, useState } from "react";
import { THEME } from "@/_components/constants/ui";
import { Button } from "@/_components/ui/button";
import { Minus, Plus } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/_components/ui/alert-dialog";


//If we need to do any validation on rows, do so here.
const rowSchema = z.object({
    Variant1: z.string(),
    Variant2: z.string(),
})

//If we need to do any validation on cols, do so here.
const formSchema = z.object({
    items: z.array(rowSchema).superRefine((items, ctx) => {
        const hasVariant1 = items.some(item => item.Variant1.trim().length > 0);
        const hasVariant2 = items.some(item => item.Variant2.trim().length > 0);

        if (!hasVariant1) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "At least one Variant 1 is required",
                path: [0, "Variant1"], // Highlights the first row
            });
        }

        if (!hasVariant2) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "At least one Variant 2 is required",
                path: [0, "Variant2"], // Highlights the first row
            });
        }
    }),
});

const FORM_NAME_WITH_PARENT = 'variant';

type FormValues = z.infer<typeof formSchema>;

export default function VariantForm() {
    const { setFormData, getCombinedData, registerValidator } = useFormRegistry();
    const {
        register, control, getValues, trigger, formState: { errors }
    } = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: getCombinedData()[FORM_NAME_WITH_PARENT] || { 
            items: [{ Variant1: '', Variant2: '' }] 
        }
    });
    const [indexToDelete, setIndexToDelete] = useState<number | null>(null);
    const watchedItems = useWatch({
        control,
    });
    const { fields, append, remove, insert } = useFieldArray({
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

    //Format for empty row
    const emptyRow = {
        Variant1: '', 
        Variant2: '',
    }

    //Adding empty row
    const addEmptyRow = (index: number) => {
        insert(index + 1, emptyRow);
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
    
    return (
        <div className="w-full space-y-4">
            <form className="space-y-4 p-4" autoComplete="off">
                <div className="overflow-x-auto rounded-lg border border-base-300">
                    <table className="table w-full">
                        <thead>
                            <tr className="bg-base-200">
                                <th className="p-1 border-b text-center w-100">Variant 1</th>
                                <th className="p-1 border-b text-center w-100">Variant 2</th>
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
                                            {...register(`items.${index}.Variant1` as const)} 
                                            className={`${THEME.TextInput} text-center`}
                                            type="text"
                                            placeholder="One entry for one unique variant..."
                                            maxLength={255}
                                        />
                                        {errors.items?.[index]?.Variant1 && (
                                            <p className="text-[10px] text-red-500 mt-1">{errors.items[index]?.Variant1?.message}</p>
                                        )}
                                    </td>
                                    <td className="p-1 w-100">
                                        <input 
                                            {...register(`items.${index}.Variant2` as const)} 
                                            className={`${THEME.TextInput} text-center`}
                                            type="text"
                                            placeholder="One entry for one unique variant..."
                                            maxLength={255}
                                        />
                                        {errors.items?.[index]?.Variant2 && (
                                            <p className="text-[10px] text-red-500 mt-1">{errors.items[index]?.Variant2?.message}</p>
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