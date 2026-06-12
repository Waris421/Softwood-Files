'use client';

import { THEME } from "@/_components/constants/ui";
import LoadingIcon from "@/_components/generic/Loading";
import { cn } from "@/_components/generic/utils";
import { Checkbox } from "@/_components/ui/checkbox";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { Controller, useFieldArray, useForm, useWatch } from "react-hook-form";
import * as z from "zod";
import { SAM_FACTOR } from "../Constants";
import { Calculator, CornerDownLeft, RotateCcw } from "lucide-react";
import { Button } from "@/_components/ui/button";

interface TableProps {
  initialData: FormValues['items'];
  isLoading: boolean;
  onDataChange: (data: any[]) => void;
}

const rowSchema = z.object({
    selected: z.boolean().default(false),
    id: z.number(),
    Name: z.string(),
    Section: z.string(),
    SkillLevel: z.number().optional(),
    Rate: z.number(),
    SMV: z.number().optional(),
    ApprovedRate: z.number().optional(),
    ApprovedRateId: z.number().optional(),
    NewRate: z.number().optional(),
})

const formSchema = z.object({
    items: z.array(rowSchema),
})

type FormValues = z.input<typeof formSchema>;

//Helper function to calculate the sam based rate
const calculateSamBasedRate = (smv?: number, skillLevel?: number) => {
    if (!smv || !skillLevel) return 0;
    const factorObj = SAM_FACTOR.find(f => f.level === skillLevel);

    if (!factorObj) return 0;

    return Number((smv * factorObj.factor).toFixed(2));
}

export default function Table({ initialData, onDataChange, isLoading }: TableProps) {
    const { 
            register, control, reset, setValue, formState: { errors } 
        } = useForm<FormValues>({
            resolver: zodResolver(formSchema),
            defaultValues: {
                items: initialData?.map(item => ({ ...item, selected: false, NewRate: item.ApprovedRate })) || []
            }
    });

    const { fields } = useFieldArray({ control, name: "items" });
    
    const watchedItems = useWatch({
        control,
        name: "items",
    });

    const isAllSelected = watchedItems.length > 0 && watchedItems.every((item) => item.selected);
    const isSomeSelected = watchedItems.some((item) => item.selected) && !isAllSelected;

    useEffect(() => {
        if (watchedItems) {
            const selectedOperations = watchedItems
            .filter(item => item?.selected)
            .map(item => ({
                id: item.id,
                Rate: item.NewRate || null,
                PreviousId: item.ApprovedRateId || null,
            }));

            onDataChange(selectedOperations);
        }
    }, [watchedItems, onDataChange]);

    useEffect(() => {
        if (!isLoading && initialData) {
            reset({ 
                items: initialData.map(item => ({ ...item, selected: false, NewRate: item.ApprovedRate })) 
            });
        }
    }, [isLoading, initialData, reset]);

    //Helper function to select all rows
    const handleSelectAll = (checked: boolean) => {
        watchedItems.forEach((_, index) => {
            setValue(`items.${index}.selected`, checked);
        });
    }

    //Helper function to set all rates to previous
    const handleResetAll = () => {
        watchedItems.forEach((item, index) => {
        setValue(`items.${index}.NewRate`, item.ApprovedRate || 0);
        });
    };

    //Helper function to set all rates to sam based rates
    const handleCalculateAll = () => {
        watchedItems.forEach((item, index) => {
        const samBasedRate = calculateSamBasedRate(item?.SMV, item?.SkillLevel);
        setValue(`items.${index}.NewRate`, samBasedRate);
        });
    };

    //Helper function to set all rates to as requested
    const handleApplyRequestAll = () => {
        watchedItems.forEach((item, index) => {
        setValue(`items.${index}.NewRate`, item.Rate);
        });
    };

    if (isLoading) return (
        <LoadingIcon />
    );

    return (
        <form className="space-y-4 p-4" autoComplete="off">
            <div className="overflow-x-auto rounded-lg border border-base-300">
                <table className="table w-full">
                    <thead className={THEME.Table.HeaderRow}>
                        <tr className="bg-base-200">
                            <th className="p-1 border-b text-center w-20">
                                <div className="flex justify-center">
                                    <Checkbox
                                        className="size-8"
                                        checked={isAllSelected || (isSomeSelected ? "indeterminate" : false)}
                                        onCheckedChange={(checked) => handleSelectAll(!!checked)}
                                    />
                                </div>
                            </th>
                            <th className="p-1 border-b text-center w-25">Code</th>
                            <th className="p-1 border-b text-center w-100">Name</th>
                            <th className="p-1 border-b text-center w-40">Section</th>
                            <th className="p-1 border-b text-center w-25">Level</th>
                            <th className="p-1 border-b text-center w-25">SAM</th>
                            <th className="p-1 border-b text-center w-25">App. Rate</th>
                            <th className="p-1 border-b text-center w-25">Req. Rate</th>
                            <th className="p-1 border-b text-center w-25">SAM Bsd Rate</th>
                            <th className="p-1 border-b text-center w-25">New Rate</th>
                            <th className="p-1 border-b text-center w-40">
                                <div className="flex flex-col items-center gap-1">
                                    <div className="flex justify-center gap-1">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="icon"
                                            className="h-8 w-8 cursor-pointer"
                                            tooltip="Reset All"
                                            onClick={handleResetAll} 
                                        >
                                            <RotateCcw className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="icon"
                                            className="h-8 w-8 cursor-pointer"
                                            tooltip="Calculate All"
                                            onClick={handleCalculateAll}
                                        >
                                            <Calculator className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="icon"
                                            className="h-8 w-8 cursor-pointer"
                                            tooltip="Request All"
                                            onClick={handleApplyRequestAll}
                                        >
                                            <CornerDownLeft className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {fields.map((field, index) => {
                            const rowItem = watchedItems[index]

                            const samBasedRate = calculateSamBasedRate(rowItem?.SMV, rowItem?.SkillLevel);
                            
                            const newRate = rowItem?.NewRate ?? 0;

                            let textColor = THEME.Text.GrayText;
                            if (newRate > samBasedRate) {
                                textColor = THEME.Text.RedText;
                            } else if (newRate < samBasedRate) {
                                textColor = THEME.Text.BlueText;
                            }

                            return (
                                <tr
                                    key={field.id}
                                    className={cn(
                                        "transition-colors",
                                        THEME.Table.RowHover,
                                        textColor,
                                    )}
                                >
                                    <td className="p-1 w-20 text-center">
                                        <div className="flex justify-center">
                                            <Controller
                                                control={control}
                                                name={`items.${index}.selected`}
                                                render={({ field: { onChange, value } }) => (
                                                    <Checkbox 
                                                        className="size-6"
                                                        checked={value} 
                                                        onCheckedChange={onChange} 
                                                    />
                                                )}
                                            />
                                        </div>
                                    </td>
                                    <td className="p-1 w-25 text-center">
                                        <div className={cn(THEME.TextInputReadOnly, 'justify-center')}>{rowItem.id}</div>
                                    </td>
                                    <td className="p-1 w-100 text-center">
                                        <div className={THEME.TextInputReadOnly}>{rowItem.Name}</div>
                                    </td>
                                    <td className="p-1 w-40 text-center">
                                        <div className={THEME.TextInputReadOnly}>{rowItem.Section}</div>
                                    </td>
                                    <td className="p-1 w-25 text-center">
                                        <div className={cn(THEME.TextInputReadOnly, 'justify-center')}>{rowItem.SkillLevel}</div>
                                    </td>
                                    <td className="p-1 w-25 text-center">
                                        <div className={cn(THEME.TextInputReadOnly, 'justify-end')}>{rowItem.SMV}</div>
                                    </td>
                                    <td className="p-1 w-25 text-center">
                                        <div className={cn(THEME.TextInputReadOnly, 'justify-end')}>{rowItem.ApprovedRate}</div>
                                    </td>
                                    <td className="p-1 w-25 text-center">
                                        <div className={cn(THEME.TextInputReadOnly, 'justify-end')}>{rowItem.Rate}</div>
                                    </td>
                                    <td className="p-1 w-25 text-center">
                                        <div className={cn(THEME.TextInputReadOnly, 'justify-end')}>{samBasedRate}</div>
                                    </td>
                                    <td className="p-1 w-25 text-center">
                                        <input 
                                            {...register(`items.${index}.NewRate` as const, { valueAsNumber: true })} 
                                            className={`${THEME.TextInput} text-center`}
                                            type="number"
                                            min={0}
                                        />
                                        {errors.items?.[index]?.NewRate && (
                                            <p className="text-[10px] text-red-500 mt-1">{errors.items[index]?.NewRate?.message}</p>
                                        )}
                                    </td>
                                    <td className="p-1 w-40">
                                        <div className="flex justify-center gap-1">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="icon"
                                                className="h-8 w-8 cursor-pointer"
                                                tooltip="Don't change"
                                                onClick={() => setValue(`items.${index}.NewRate`, rowItem.ApprovedRate || 0)} 
                                            >
                                                <RotateCcw className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="icon"
                                                className="h-8 w-8 cursor-pointer"
                                                tooltip="Same Based"
                                                onClick={() => setValue(`items.${index}.NewRate`, samBasedRate)}
                                            >
                                                <Calculator className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="icon"
                                                className="h-8 w-8 cursor-pointer"
                                                tooltip="As Request"
                                                onClick={() => setValue(`items.${index}.NewRate`, rowItem.Rate)}
                                            >
                                                <CornerDownLeft className="w-4 h-4" />
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
    )
}