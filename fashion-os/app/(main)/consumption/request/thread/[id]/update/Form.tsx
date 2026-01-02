'use client';

import { useEffect, useState } from "react";
import { useRouter } from 'next/navigation';
import { formSchema, FormValues } from "./Schema";
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { Save, Plus, Minus, Loader2, CheckCircle, Shirt } from 'lucide-react';
import { Button } from "@/_components/ui/button";
import {AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle} from '@/_components/ui/alert-dialog';
import DropDown from "@/_components/Dropdown/Dropdown";
import { THEME } from "@/_components/constants/ui";
import MessageBox from "@/_components/generic/MessageBox";

interface FormProps {
    pk: number;
}

export default function ConsumptionForm({ pk }: FormProps){
    const { register, control, handleSubmit, reset, getValues, setValue, formState: { isSubmitting, errors } } = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: { items: [] }
    });

    const [indexToDelete, setIndexToDelete] = useState<number | null>(null);
    const [threadOptions, setThreadOptions] = useState<{ label: string; value: string }[]>([]);
    const [applicableStyles, setApplicableStyles] = useState<{Style: string}[]>([]);
    const [isFinalizing, setIsFinalizing] = useState(false);
    const [messageConfig, setMessageConfig] = useState<{
        show: boolean;
        subject: string;
        message: string;
        action?: () => void;
    } | null>(null);
    const router = useRouter();

    const { fields, append, remove, insert } = useFieldArray({
        control,
        name: "items"
    });

    const stitchTypeData = {
        'SNLS': {label: 'Single Needle Lock Stitch', factor: 2.5},
        'DNLS': {label: 'Double Needle Lock Stitch', factor: 5},
        'SNCS': {label: 'Single Needle Chain Stitch', factor: 6},
        'DNCS': {label: 'Double Needle Chain Stitch', factor: 12},
        'FOA': {label: 'Folder', factor: 12},
        'WB': {label: 'Waist Band', factor: 7},
        '3TOL': {label: 'Three Thread O/L', factor: 18},
        '4TOL': {label: 'Four Thread O/L', factor: 20},
        '5TOL': {label: 'Five Thread O/L', factor: 24},
        'BT': {label: 'Bartack', factor: 9},
        'BH': {label: 'BH', factor: 20},
        'WELT': {label: 'Welt', factor: 6},
        'CST': {label: 'CST', factor: 22},
        'OTH': {label: 'Other', factor: 1},
    }

    const stitchTypes = Object.keys(stitchTypeData).map(key => ({
        label: stitchTypeData[key as keyof typeof stitchTypeData].label,
        value: key,
    }));

    const countTypes = [
        {value: '203', label: '20/3'},
        {value: '203E', label: '20/3 EPIC'},
        {value: '202', label: '20/2'},
        {value: '202E', label: '20/2 EPIC'},
        {value: '204', label: '20/4'},
    ]

    const emptyRow = {
        id: '',
        Operation: '', 
        Frequency: 1,
        StitchType: '',
        Factor: 1,
        ThreadType: '',
        Count: '',
        Consumption: 1,
    }

    const addEmptyRow = (index: number) => {
        insert(index + 1, emptyRow);
    }

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

    const fetchData = async () => {
        const response = await fetch(`/api/consumption/thread/request/${pk}/update`);
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            const errorMessage = errorData.details?.message || errorData.error || "Failed to load consumption data.";
            
            setMessageConfig({
                show: true,
                subject: "Fetch Error",
                message: errorMessage,
                action: () => (
                    router.push('/consumption/request/thread/pending')
                ),
            });

            return ;
        }

        const data = await response.json();

        const threadTypes = data.threads.map((thread: any) => ({
            label: String(thread.Thread),
            value: String(thread.id),
        }));
        setThreadOptions(threadTypes);

        const addedData = data.addedData;

        const styles = data.styles;
        setApplicableStyles(styles);

        if (!addedData || addedData.length === 0) {
            reset({ items: [emptyRow] });
        } else {
            reset({ items: addedData });
        }

        return ;
    };

    useEffect(() => {
        fetchData();
    }, [reset]);

    const onSubmitHandler = async (data: FormValues, isFinal: boolean) => {
        if (isFinal) setIsFinalizing(true);

        const payload = {
            items: data.items,
            final: isFinal,
        }
        try {
            const response = await fetch(`/api/consumption/thread/request/${pk}/update`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            if (response.ok) {
                if (isFinal) {
                    router.push('/consumption/request/thread/pending');
                    return ;
                }
                setMessageConfig({
                    show: true,
                    subject: "Success",
                    message: isFinal ? "Data Finalized!" : "Data saved successfully!",
                });
                await fetchData();
            } else {
                const message = await response.json();
                throw new Error(message.message);
            }
        } catch (error: any) {
                setMessageConfig({
                show: true,
                subject: "Error",
                message: `Saving Failed: ${error.message || error}`
            });
        } finally {
            setIsFinalizing(false);
        }
    }

    return (
        <div className="w-full space-y-4">
            {applicableStyles.length > 0 && (
                <div className="mx-4 mt-4 p-4 bg-base-200 rounded-xl border border-base-300 flex flex-wrap items-center gap-3">
                    <div className="flex flex-col mr-4">
                        <span className="text-xs font-bold uppercase opacity-60">Applicable Styles</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {applicableStyles.map((item, idx) => (
                            <div key={idx} className="badge badge-primary badge-outline gap-2 py-3 px-4 font-semibold">
                                <Shirt className="w-5 h-5 text-primary" />
                                {item.Style}
                            </div>
                        ))}
                    </div>
                </div>
            )}
            <form className="space-y-4 p-4" autoComplete="off">
                <div className="overflow-x-auto rounded-lg border border-base-300">
                    <table className="table w-full">
                        <thead>
                            <tr className="bg-base-200">
                                <th className="p-1 border-b text-center w-100">Operation</th>
                                <th className="p-1 border-b text-center w-25">Frequency</th>
                                <th className="p-1 border-b text-center w-40">Stitch Type</th>
                                <th className="p-1 border-b text-center w-25">Factor</th>
                                <th className="p-1 border-b text-center w-40">Thread Type</th>
                                <th className="p-1 border-b text-center w-40">Count</th>
                                <th className="p-1 border-b text-center w-25">Cons. (mtr)</th>
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
                                    <td className="hidden">
                                        <input 
                                            {...register(`items.${index}.id` as const)} 
                                            readOnly
                                            required={false}
                                        />
                                        {errors.items?.[index]?.id && (
                                            <p className="text-[10px] text-red-500 mt-1">{errors.items[index]?.id?.message}</p>
                                        )}
                                    </td>
                                    <td className="p-1 w-100">
                                        <input 
                                            {...register(`items.${index}.Operation` as const)} 
                                            className={THEME.textInput}
                                            type="text"
                                            placeholder="Enter Operation Name..."
                                            maxLength={255}
                                        />
                                        {errors.items?.[index]?.Operation && (
                                            <p className="text-[10px] text-red-500 mt-1">{errors.items[index]?.Operation?.message}</p>
                                        )}
                                    </td>
                                    <td className="p-1 w-25">
                                        <input 
                                            {...register(`items.${index}.Frequency` as const, { valueAsNumber: true })} 
                                            className={THEME.textInput}
                                            type="number" step="any"
                                            placeholder="Enter Frequency..."
                                        />
                                        {errors.items?.[index]?.Frequency && (
                                            <p className="text-[10px] text-red-500 mt-1">{errors.items[index]?.Frequency?.message}</p>
                                        )}
                                    </td>
                                    <td className="p-1">
                                        <Controller 
                                            control={control}
                                            name={`items.${index}.StitchType` as const}
                                            render={({field}) => {
                                                const selectedOption = stitchTypes.find(opt => opt.value === field.value);
                                                
                                                return (
                                                    <DropDown 
                                                        inputName={field.name}
                                                        defaultValue={selectedOption}
                                                        placeholder="Select Type..."
                                                        isStatic={true}
                                                        widthClass="w-40"
                                                        staticOptions={stitchTypes}
                                                        onSelect={(option) => {
                                                            field.onChange(option ? option.value : '')

                                                            const selectedValue = option ? option.value : '';

                                                            if (selectedValue) {
                                                                const newFactor = stitchTypeData[selectedValue as keyof typeof stitchTypeData].factor;
                                                                setValue(`items.${index}.Factor`, newFactor);
                                                            }
                                                        }}
                                                    />
                                                )}}
                                        />
                                        {errors.items?.[index]?.StitchType && (
                                            <p className="text-[10px] text-red-500 mt-1">{errors.items[index]?.StitchType?.message}</p>
                                        )}
                                    </td>
                                    <td className="p-1 w-25">
                                        <input 
                                            {...register(`items.${index}.Factor` as const, { valueAsNumber: true })} 
                                            className={THEME.textInput}
                                            type="number" step="any"
                                            placeholder="Enter Factor..."
                                        />
                                        {errors.items?.[index]?.Factor && (
                                            <p className="text-[10px] text-red-500 mt-1">{errors.items[index]?.Factor?.message}</p>
                                        )}
                                    </td>
                                    <td className="p-1">
                                        <Controller 
                                            control={control}
                                            name={`items.${index}.ThreadType` as const}
                                            render={({field}) => {
                                                const selectedOption = threadOptions.find(opt => opt.value === String(field.value));

                                                return (
                                                    <DropDown 
                                                        inputName={field.name}
                                                        defaultValue={selectedOption}
                                                        placeholder="Select Type..."
                                                        widthClass="w-40"
                                                        isStatic={true}
                                                        staticOptions={threadOptions}
                                                        onSelect={(option) => field.onChange(option ? option.value : '')}
                                                    />
                                                )}}
                                        />
                                        {errors.items?.[index]?.ThreadType && (
                                            <p className="text-[10px] text-red-500 mt-1">{errors.items[index]?.ThreadType?.message}</p>
                                        )}
                                    </td>
                                    <td className="p-1">
                                        <Controller 
                                            control={control}
                                            name={`items.${index}.Count` as const}
                                            render={({field}) => {
                                                const selectedOption = countTypes.find(opt => opt.value === field.value);
                                                return (
                                                    <DropDown 
                                                        inputName={field.name}
                                                        defaultValue={selectedOption}
                                                        placeholder="Select Count..."
                                                        widthClass="w-40"
                                                        isStatic={true}
                                                        staticOptions={countTypes}
                                                        onSelect={(option) => field.onChange(option ? option.value : '')}
                                                    />
                                                )
                                            }}
                                        />
                                        {errors.items?.[index]?.Count && (
                                            <p className="text-[10px] text-red-500 mt-1">{errors.items[index]?.Count?.message}</p>
                                        )}
                                    </td>
                                    <td className="p-1 w-25">
                                        <input 
                                            {...register(`items.${index}.Consumption` as const, { valueAsNumber: true })} 
                                            className={THEME.textInput}
                                            type="number" step="any"
                                            placeholder="Enter Consumption..."
                                        />
                                        {errors.items?.[index]?.Consumption && (
                                            <p className="text-[10px] text-red-500 mt-1">{errors.items[index]?.Consumption?.message}</p>
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
                <div className="flex justify-end items-center gap-4">
                    <Button 
                        type="button"
                        disabled={isSubmitting || isFinalizing}
                        variant="secondary"
                        onClick={handleSubmit(
                            (data) => onSubmitHandler(data, false),
                            (errors) => console.log("Validation Errors:", errors)
                        )}
                    >
                        {isSubmitting && !isFinalizing ? (
                            <Loader2 className="animate-spin mr-2" />
                        ) : (
                            <Save className="w-4 h-4 mr-2" />
                        )}
                        Save Draft
                    </Button>
                    <Button
                        type="button"
                        disabled={isSubmitting || isFinalizing}
                        className="bg-green-600 hover:bg-green-700 text-white"
                        onClick={handleSubmit(
                            (data) => onSubmitHandler(data, true),
                            (errors) => console.log("Validation Errors:", errors)
                        )}
                    >
                        {isFinalizing ? (
                            <Loader2 className="animate-spin mr-2" />
                        ) : (
                            <CheckCircle className="w-4 h-4 mr-2" />
                        )}
                        Finalize
                    </Button>
                </div>
            </form>

            {messageConfig?.show && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <MessageBox 
                        subject={messageConfig.subject}
                        message={messageConfig.message}
                        confirmText="Close"
                        onConfirm={() => {
                            if (messageConfig.action) {
                                messageConfig.action();
                            }
                            setMessageConfig(null)
                        }}  
                    />
                </div>
            )}

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
