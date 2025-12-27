'use client';

import React, { useEffect, useState } from "react";
import { formSchema, FormValues } from "./Schema";
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useFieldArray } from 'react-hook-form';
import { Save, Plus, Minus, Loader2 } from 'lucide-react';
import { Button } from "@/_components/ui/button";
import {AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle} from '@/_components/ui/alert-dialog';

interface FormProps {
    pk: number;
}

export default function ConsumptionForm({ pk }: FormProps){
    const { register, control, handleSubmit, reset, getValues, formState: { isSubmitting } } = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: { items: [] }
    });

    const [indexToDelete, setIndexToDelete] = useState<number | null>(null);

    const { fields, append, remove } = useFieldArray({
        control,
        name: "items"
    });

    const emptyRow = {
        Operation: '', 
        Frequency: 1,
        StitchType: '',
        Factor: 1,
        ThreadType: '',
        Count: '',
        Consumption: 1,
    }

    const addEmptyRow = () => append(emptyRow)

    const handleRemoveClick = (index: number) => {
        const currentRow = getValues(`items.${index}`);
        const hasData = Object.values(currentRow).some(val => val !== '' && val !== 1);

        if (hasData) {
            setIndexToDelete(index);
        } else {
            executeDelete(index);
        }
    };

    const executeDelete = (index: number) => {
        remove(index);

        if (fields.length === 1) append(emptyRow);

        setIndexToDelete(null);
    };

    useEffect(() => {
        const fetchData = async () => {
            const response = await fetch(`/api/consumption/thread/request/${pk}/update`);
            if (!response.ok) {
                console.error("Fetch error");
                reset({ items: [emptyRow] });
            }

            const data = await response.json();

            const addData = data.addedData;

            if (!addData || addData.length === 0) {
                reset({ items: [emptyRow] });
            } else {
                reset({ items: addData });
            }
        };
        fetchData();
    }, [reset]);

    const onSubmit = async (data: FormValues) => {
        try {
            const response = await fetch(`/api/consumption/thread/request/${pk}/update`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data.items),
            });
            if (response.ok) alert("Data saved successfully!");
        } catch (error) {
            alert(`Submission Failed: ${error}`);
        }
    }

    return (
        <div>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 p-4">
                <div className="overflow-x-auto rounded-lg border border-base-300">
                    <table className="table w-full">
                        <thead>
                            <tr className="bg-base-200">
                                <th className="p-2 border-b">Operation</th>
                                <th className="p-2 border-b">Frequency</th>
                                <th className="p-2 border-b">Stitch Type</th>
                                <th className="p-2 border-b">Factor</th>
                                <th className="p-2 border-b">Thread Type</th>
                                <th className="p-2 border-b">Count</th>
                                <th className="p-2 border-b">Cons. (mtr)</th>
                                <th className="p-2 border-b text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {fields.map((field, index) => (
                                <tr
                                    key={field.id}
                                    className={`transition-colors ${
                                            indexToDelete === index ? "bg-destructive/40" : "hover:bg-base-100"
                                        }`}
                                >
                                    <td className="p-2">
                                        <input 
                                            {...register(`items.${index}.Operation` as const)} 
                                            className="input input-bordered w-full"
                                            type="text"
                                            placeholder="Enter Operation..."
                                        />
                                    </td>
                                    <td className="p-2">
                                        <input 
                                            {...register(`items.${index}.Frequency` as const)} 
                                            className="input input-bordered w-full"
                                            type="number"
                                            placeholder="Enter Frequency..."
                                        />
                                    </td>
                                    <td className="p-2">
                                        <input 
                                            {...register(`items.${index}.StitchType` as const)} 
                                            className="input input-bordered w-full"
                                            type="text"
                                            placeholder="Enter Stitch Type..."
                                        />
                                    </td>
                                    <td className="p-2">
                                        <input 
                                            {...register(`items.${index}.Factor` as const)} 
                                            className="input input-bordered w-full"
                                            type="number"
                                            placeholder="Enter Factor..."
                                        />
                                    </td>
                                    <td className="p-2">
                                        <input 
                                            {...register(`items.${index}.ThreadType` as const)} 
                                            className="input input-bordered w-full"
                                            type="text"
                                            placeholder="Enter Thread Type..."
                                        />
                                    </td>
                                    <td className="p-2">
                                        <input 
                                            {...register(`items.${index}.Count` as const)} 
                                            className="input input-bordered w-full"
                                            type="text"
                                            placeholder="Enter Count..."
                                        />
                                    </td>
                                    <td className="p-2">
                                        <input 
                                            {...register(`items.${index}.Consumption` as const)} 
                                            className="input input-bordered w-full"
                                            type="number"
                                            placeholder="Enter Consumption..."
                                        />
                                    </td>
                                    <td className="p-2">
                                        <div className="flex justify-center gap-2">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="icon"
                                                className="h-8 w-8 text-success"
                                                onClick={addEmptyRow}
                                            >
                                                <Plus className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="icon"
                                                className="h-8 w-8 text-success"
                                                onClick={() => handleRemoveClick(index)}
                                            >
                                                <Minus className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="flex justify-between items-center">
                    <Button type="submit" disabled={isSubmitting} className="btn-primary">
                        {isSubmitting ? <Loader2 className="animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                        Save Changes
                    </Button>
                </div>
            </form>

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
