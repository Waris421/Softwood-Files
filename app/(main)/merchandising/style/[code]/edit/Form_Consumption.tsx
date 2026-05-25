'use client';

import * as z from "zod";
import { useFormRegistry } from "./FormContext";
import { Controller, useFieldArray, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useEffect, useState } from "react";
import { THEME } from "@/_components/constants/ui";
import { SingleDropdown } from "@/_components/Dropdown/Dropdown";
import { Switch } from "@/_components/Switch/Switch";
import { Button } from "@/_components/ui/button";
import { Minus, Plus } from "lucide-react";
import { cn } from "@/_components/generic/utils";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/_components/ui/alert-dialog";
import { SearchPicker } from "@/_components/DialogBox/SearchPicker";

//If we need to do any validation on rows, do so here.
const rowSchema = z.object({
    id: z.union([z.string(), z.number()]).optional(),
    Inventory: z.string().min(1, "Required"),
    InventoryName: z.string().optional(),
    Consumption: z.number({ 
            error: "Consumption must be a number" 
        }).positive("Must be greater than 0"),
    Unit: z.string().optional(),
    Type: z.string().min(1, 'Required'),
    HasVariant: z.boolean(),
    SizeDetails: z.string().optional(),
    InvBaseUnit: z.string().optional(),
})

//If we need to do any validation on cols, do so here.
const formSchema = z.object({
    items: z.array(rowSchema),
})

type FormValues = z.infer<typeof formSchema>;

const FORM_NAME_WITH_PARENT = 'consumption';

const consTypes = [
    {value: 'Fab', label: 'Fabric'},
    {value: 'BW', label: 'BW Trim'},
    {value: 'AW', label: 'AW Trim'},
]

export default function ConsumptionForm() {
    const { setFormData, getCombinedData, registerValidator, options, initialData } = useFormRegistry();
    const {
        register, control, getValues, trigger, reset, formState: { errors }
    } = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {items: [{ 
            Inventory: '', Consumption: 1, Unit: '',Type: '', 
            HasVariant: false, SizeDetails: '', id: "", InventoryName:"",
        }]}
    });
    const [indexToDelete, setIndexToDelete] = useState<number | null>(null);
    const watchedItems = useWatch({
        control,
    });    
    const { fields, append, remove, insert } = useFieldArray({
        control,
        name: "items"
    });

    const unitOptions = options.units || [];

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
        id: '' ,Inventory: '', InventoryName: '', Consumption: 1, Unit: '', Type: '', HasVariant: false,
        SizeDetails: '' 
        
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
                                <th className="p-1 border-b text-center w-100">Inventory</th>
                                <th className="p-1 border-b text-center w-25">Cons. (Qty)</th>
                                <th className="p-1 border-b text-center w-40">UOC</th>
                                <th className="p-1 border-b text-center w-40">Category</th>
                                <th className="p-1 border-b text-center w-40">By Variant</th>
                                <th className="p-1 border-b text-center w-100">Variant Details</th>
                                <th className="p-1 border-b text-center w-40">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {fields.map((field, index) => {
                                const rowBaseUnitValue = watchedItems?.items?.[index]?.InvBaseUnit;
                                const baseUnitGroup = unitOptions.find(u => u.value === rowBaseUnitValue)?.Group;

                                const filteredUnits = baseUnitGroup 
                                    ? unitOptions.filter(u => u.Group === baseUnitGroup)
                                    : unitOptions;
                                
                                register(`items.${index}.id`);
                                register(`items.${index}.Inventory`);
                                    
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
                                                name={`items.${index}.InventoryName` as const}
                                                render={({field}) => {
                                                    const type = watchedItems?.items?.[index]?.Type;
                                                    return (
                                                        <SearchPicker 
                                                            id={`search-picker-inv-${index}`}
                                                            apiUrl={`/api/options/inventories?type=${type}`}
                                                            displayColumn="label"
                                                            columnMapping={[
                                                                {header: 'Code', key: 'value'},
                                                                {header: 'Name', key: 'label'},
                                                                {header: 'Unit', key: 'Unit'},
                                                            ]}
                                                            customClasses={{
                                                                trigger: "w-100",
                                                            }}
                                                            value={field.value}
                                                            onSelect={(value) => {
                                                                field.onChange(value)
                                                            }}
                                                        />
                                                    )
                                                }}  
                                            />
                                            {errors.items?.[index]?.InventoryName && (
                                                <p className="text-[10px] text-red-500 mt-1">{errors.items[index]?.InventoryName?.message}</p>
                                            )}
                                            {errors.items?.[index]?.Inventory && (
                                                <p className="text-[10px] text-red-500 mt-1">{errors.items[index]?.Inventory?.message}</p>
                                            )}
                                        </td>
                                        <td className="p-1 w-25">
                                            <input 
                                                {...register(`items.${index}.Consumption` as const, { valueAsNumber: true })} 
                                                className={THEME.TextInput}
                                                type="number" step="any"
                                                placeholder="Enter Consumption..."
                                            />
                                            {errors.items?.[index]?.Consumption && (
                                                <p className="text-[10px] text-red-500 mt-1">{errors.items[index]?.Consumption?.message}</p>
                                            )}
                                        </td>
                                        <td className="p-1">
                                            <Controller
                                                control={control}
                                                name={`items.${index}.Unit` as const}
                                                render={({field}) => {
                                                    return (
                                                        <SingleDropdown 
                                                            inputName={field.name}
                                                            defaultValue={field.value}
                                                            placeholder="If different from default..."
                                                            widthClass="w-40"
                                                            staticOptions={filteredUnits}
                                                            onSelect={(option: { value: string; label: string; } | null) => {
                                                                const selectedValue = option as { value: string; label: string } | null;
                                                                field.onChange(selectedValue ? selectedValue.value : '');
                                                            }}
                                                        />
                                                    )}}
                                            />
                                            {errors.items?.[index]?.Unit && (
                                                <p className="text-[10px] text-red-500 mt-1">{errors.items[index]?.Unit?.message}</p>
                                            )}
                                        </td>
                                        <td className="p-1">
                                            <Controller
                                                control={control}
                                                name={`items.${index}.Type` as const}
                                                render={({field}) => {
                                                    return (
                                                        <SingleDropdown 
                                                            inputName={field.name}
                                                            defaultValue={field.value}
                                                            widthClass="w-40"
                                                            staticOptions={consTypes}
                                                            onSelect={(option: { value: string; label: string; } | null) => {
                                                                const selectedValue = option as { value: string; label: string } | null;
                                                                field.onChange(selectedValue ? selectedValue.value : '');
                                                            }}
                                                        />
                                                    )}}
                                            />
                                            {errors.items?.[index]?.Type && (
                                                <p className="text-[10px] text-red-500 mt-1">{errors.items[index]?.Type?.message}</p>
                                            )}
                                        </td>
                                        <td className="p-1">
                                            <Controller 
                                                control={control}
                                                name={`items.${index}.HasVariant` as const}
                                                render={({ field: { value, onChange, name } }) => (
                                                    <Switch 
                                                        inputName={name}
                                                        checked={value}
                                                        onCheckedChange={onChange}
                                                        showLabels={true}
                                                        labels={{ on: "Yes", off: "No" }}
                                                    />
                                                )}
                                            />
                                        </td>
                                        <td className="p-1 w-100">
                                            <input 
                                                {...register(`items.${index}.SizeDetails` as const)} 
                                                className={`${THEME.TextInput} text-center`}
                                                type="text"
                                                placeholder="Relevant Variants, separated by comma"
                                                maxLength={255}
                                            />
                                            {errors.items?.[index]?.SizeDetails && (
                                                <p className="text-[10px] text-red-500 mt-1">{errors.items[index]?.SizeDetails?.message}</p>
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