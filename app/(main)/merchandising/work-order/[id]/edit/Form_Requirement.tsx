'use client';

import * as z from "zod";
import { useFormRegistry } from "./FormContext";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useEffect, useState } from "react";
import { THEME } from "@/_components/constants/ui";
import { cn } from "@/_components/generic/utils";
import { Settings2 } from "lucide-react";

//If we need to do any validation on rows, do so here.
const rowSchema = z.object({
    id: z.union([z.string(), z.number()]).optional(),
    Inventory: z.string().min(1, "Required"),
    Required: z.number(),
    Adjustment: z.number(),
})

//If we need to do any validation on cols, do so here.
const formSchema = z.object({
    items: z.array(rowSchema),
})

type FormValues = z.infer<typeof formSchema>;

type DisplayRow = FormValues['items'][number] & {
    InventoryName?: string;
    Variant?: string;
    Ordered?: number;
    Received?: number;
    Issued?: number;
};

const FORM_NAME_WITH_PARENT = 'Requirement';

export default function RequirementForm() {
    const { 
        setFormData, getCombinedData, registerValidator, customAction
    } = useFormRegistry();

    const {
        register, control, getValues, trigger, reset, formState: { errors }
    } = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: { items: [] }
    });

    const watchedItems = useWatch({ control });
    const { fields } = useFieldArray({ control, name: "items" });
    const displayFields = fields as unknown as (DisplayRow & { id: string })[];
    
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

    //Helper to get the row color based on inventory status.
    const getStatusTextColor = (row: DisplayRow) => {
        const required = row.Required || 0;
        const ordered = row.Ordered || 0;
        const received = row.Received || 0;
        const issued = row.Issued || 0;

        //Extremely big problem: Ordered < Required
        if (ordered < required) {
            return THEME.Text.RedText; 
        }

        //All required inventory received and issued (lowest visibility)
        if (issued >= required && required > 0) {
            return `${THEME.Text.GrayText} opacity-60`;
        }

        //Required inventory received completely. Low visibiity
        if (received >= required && required > 0) {
            return THEME.Text.GrayText;
        }

        //Ordered but not received
        if (ordered >= required && received < ordered) {
            return THEME.Text.BlueText;
        }

        //Default
        return "text-base-content";
    }

    return (
        <form className="space-y-4 p-4" autoComplete="off">
            <div className="overflow-x-auto rounded-lg border border-base-300">
                <table className="table w-full">
                    <thead className={THEME.Table.HeaderRow}>
                        <tr className="bg-base-200">
                            <th className="p-1 border-b text-center w-100">Inventory</th>
                            <th className="p-1 border-b text-center w-40">Variant</th>
                            <th className="p-1 border-b text-center w-40">Required</th>
                            <th className="p-1 border-b text-center w-25">Ordered</th>
                            <th className="p-1 border-b text-center w-25">Received</th>
                            <th className="p-1 border-b text-center w-25">Issued</th>
                        </tr>
                    </thead>
                    <tbody>
                        {displayFields.map((field, index) => {
                            const statusColorClass = getStatusTextColor(field);

                            
                            register(`items.${index}.id`);
                            register(`items.${index}.Inventory`)
                            return (
                                <tr
                                    key={field.id}
                                    className={cn(
                                        "transition-colors",
                                        THEME.Table.RowHover,
                                        statusColorClass
                                    )}
                                >
                                    <td className="p-1 w-100 text-center">
                                        <div className={THEME.TextInputReadOnly}>{field.InventoryName}</div>
                                    </td>
                                    <td className="p-1 w-40 text-center">
                                        <div className={THEME.TextInputReadOnly}>{field.Variant}</div>
                                    </td>
                                    <td className="p-1 w-40">
                                        <div className="flex items-center justify-between gap-2">
                                            <input
                                                {...register(`items.${index}.Required` as const)}
                                                className={`${THEME.TextInputReadOnly} text-right grow`}
                                                type="text"
                                                readOnly
                                            />

                                            <div className="dropdown dropdown-end dropdown-bottom">
                                                <div 
                                                    tabIndex={0} 
                                                    role="button" 
                                                    className={cn(
                                                        "btn btn-xs border-none bg-gray-200 dark:bg-gray-700 rounded-sm", 
                                                        watchedItems.items?.[index]?.Adjustment ? "text-gray-700 dark:text-gray-200" : "text-gray-400 dark-text-gray-800"
                                                    )}
                                                >
                                                    <Settings2 size={14}/>
                                                </div>
                                                <div
                                                    tabIndex={0}
                                                    className="dropdown-content z-1 card card-compact w-48 p-2 shadow bg-gray-100 dark:bg-gray-600 rounded-lg mt-2"
                                                >
                                                    <div className="form-control">
                                                        <label className="label py-1">
                                                            <span className="label-text text-xs font-bold">Adjustment %</span>
                                                        </label>
                                                        <input
                                                            {...register(`items.${index}.Adjustment` as const, { valueAsNumber: true })}
                                                            className={cn(THEME.TextInput, "input-sm w-full")}
                                                            type="number"
                                                            placeholder="0"
                                                            autoFocus
                                                            min={0}
                                                        />
                                                    </div>
                                                </div>

                                                {errors.items?.[index]?.Adjustment && (
                                                    <p className="text-[10px] text-red-500 mt-1">
                                                        {errors.items[index]?.Adjustment?.message}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-1 w-25 text-center">
                                        <div className={THEME.TextInputReadOnly}>{field.Ordered}</div>
                                    </td>
                                    <td className="p-1 w-25 text-center">
                                        <div className={THEME.TextInputReadOnly}>{field.Received}</div>
                                    </td>
                                    <td className="p-1 w-25 text-center">
                                        <div className={THEME.TextInputReadOnly}>{field.Issued}</div>
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