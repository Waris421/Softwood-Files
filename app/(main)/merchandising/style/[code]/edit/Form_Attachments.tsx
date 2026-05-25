'use client';

import { THEME } from "@/_components/constants/ui";
import * as z from "zod";
import { useFormRegistry } from "./FormContext";
import { Controller, useFieldArray, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/_components/ui/button";
import { Minus, Plus } from "lucide-react";
import { cn } from "@/_components/generic/utils";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/_components/ui/alert-dialog";
import { FileUpload } from "@/_components/generic/FileUpload";
import InputWithURL from "@/_components/generic/InputWithUrl";

//If we need to do any validation on rows, do so here.
const rowSchema = z.object({
    AttachmentId: z.union([z.string(), z.number()]).optional(),
    Description: z.string().optional().nullable(),
    FileUrl: z.string().optional().nullable(),
    FileName: z.string().optional().nullable(),
    CanEdit: z.boolean().optional().default(true),
    NewFile: z.instanceof(File).optional().nullable()
})

//If we need to do any validation on cols, do so here.
const formSchema = z.object({
    items: z.array(rowSchema),
})

type FormValues = z.input<typeof formSchema>;

const FORM_NAME_WITH_PARENT = 'attachment';

export default function AttachmentForm() {
    const { setFormData, getCombinedData, registerValidator, initialData } = useFormRegistry();
    const {
        control, getValues, trigger, reset, formState: { errors }
    } = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: getCombinedData()[FORM_NAME_WITH_PARENT] || { 
            items: [{ AttachmentId: '', Description: null, CanEdit: true}] 
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

    //Pull default values at the start from parent
    useEffect(() => {
        const initialValues = getCombinedData()[FORM_NAME_WITH_PARENT];

        if (initialValues && initialValues.items && initialValues.items.length > 0) {
            reset(initialValues);
        }
    }, [initialData, getCombinedData, reset]);

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
        Description: '', CanEdit: true
    }

    //Adding empty row
    const addEmptyRow = (index: number) => {
        insert(index + 1, emptyRow);
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

    return (
        <div className={"w-full space-y-4"}>
            <form className="space-y-4 p-4" autoComplete="off">
                <div className={"overflow-x-auto rounded-lg border border-base-300"}>
                    <table className="table w-full">
                        <thead>
                            <tr className={"bg-base-200"}>
                                <th className="p-1 border-b text-center w-100">Description</th>
                                <th className="p-1 border-b text-center w-100">Add/Modify</th>
                                <th className="p-1 border-b text-center w-40">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {fields.map((field, index) => {
                                return (
                                    <tr
                                        key={field.id}
                                        className={cn(
                                            "transition-colors",
                                            "hover:bg-base-100",
                                            indexToDelete === index && "bg-destructive/40"
                                        )}
                                    >
                                        <td className="p-1 w-100">
                                            <Controller 
                                                control={control}
                                                name={`items.${index}.Description`}
                                                render={({ field: { onChange, value } }) => (
                                                    <InputWithURL 
                                                        value={value ?? ''}
                                                        onChange={onChange}
                                                        url={field.FileUrl ?? ''}
                                                        disabled={!fields[index].CanEdit}
                                                        placeholder="Add a description of the file"
                                                    />
                                                )}
                                            />
                                            {errors.items?.[index]?.Description && (
                                                <p className="text-[10px] text-red-500 mt-1">{errors.items[index]?.Description?.message}</p>
                                            )}
                                        </td>

                                        <td className="p-1 w-40">
                                            <div className="flex flex-col gap-2">
                                                {field.CanEdit ? (
                                                    <Controller 
                                                        control={control}
                                                        name={`items.${index}.NewFile`}
                                                        render={({ field: { value, onChange } }) => (
                                                            <FileUpload 
                                                                file={value ? value : null}
                                                                onFileChange={onChange}
                                                            />
                                                        )}

                                                    />
                                                ): (
                                                    <div className="text-center text-xs opacity-50 italic">
                                                        Read Only
                                                    </div>
                                                )}
                                            </div>
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
                                )
                            })}
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