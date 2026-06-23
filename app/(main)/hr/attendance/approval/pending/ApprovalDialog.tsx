'use client';

import { THEME } from "@/_components/constants/ui";
import LoadingIcon from "@/_components/generic/Loading";
import { cn } from "@/_components/generic/utils";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/_components/ui/dialog";
import * as z from "zod";
import { AlertCircle, CheckCircle, Loader } from "lucide-react";
import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useFieldArray, useForm, useWatch } from "react-hook-form";
import { SingleDropdown } from "@/_components/Dropdown/Dropdown";
import { Button } from "@/_components/ui/button";
import { DropdownOption } from "@/_components/Dropdown/types";

interface ApprovalModalProps {
    onClose: () => void;
    onSuccess: () => void;
    adjustmentIds: number[];
    employeeName: string;
    approvalDate: string;
}

//If we need to do any validation on rows, do so here.
const rowSchema = z.object({
    id: z.number(),
    Description: z.string(),
    Approval: z.boolean().nullable().optional(),
    ManagerComments: z.string().optional(),
}).superRefine((data, ctx) => {
    if (data.Approval === false && (!data.ManagerComments || data.ManagerComments.trim() === "")) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Comments are required when approval is denied.",
            path: ["ManagerComments"],
        });
    }
});

//If we need to do any validation on cols, do so here.
const formSchema = z.object({
    items: z.array(rowSchema),
})

type FormValues = z.input<typeof formSchema>;

const API_URL = (ids: number[]) => {
    const joinedIds = ids.join('/');
    return `/api/hr/attendance/approval/approve/${joinedIds}`;
};

export function ApprovalModal({
    onClose, onSuccess, adjustmentIds,
    employeeName, approvalDate,
}: ApprovalModalProps) {
    const { 
        register, control, handleSubmit, reset, formState: { isSubmitting, errors } 
    } = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: { items: [] }
    });

    const [fetching, setFetching] = useState(false);
    const [fetchError, setFetchError] = useState<string | null>(null);
    const [saveError, setSaveError] = useState<string | null>(null);

    const watchedItems = useWatch({
        control,
    });

    const { fields } = useFieldArray({
        control,
        name: "items"
    });
    const items = watchedItems.items;

    useEffect(() => {
        const fetchData = async() => {
            if (adjustmentIds.length === 0) {
                return ;
            }

            setFetching(true);
            try {
                const response = await fetch(API_URL(adjustmentIds));
                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.details?.message || error);
                }

                const apiData = await response.json();
                
                reset({ items: apiData });
            } catch (err: any) {
                setFetchError(err.message || 'An unexpected error occurred.');
            } finally {
                setFetching(false);
            }
        }

        fetchData();
    }, [adjustmentIds]);

    const onSubmit = async (data: FormValues) => {
        setSaveError(null);
        
        try {
            const response = await fetch(API_URL(adjustmentIds), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data.items),
            });

            if (!response.ok){
                const error = await response.json();
                throw new Error(error.message || error);
            }
            onSuccess();
            onClose();
        } catch (err: any) {
            setSaveError(err.message || 'An unexpected error occurred while saving.');
        }
    }

    return (
        <Dialog open={adjustmentIds.length>0} onOpenChange={() => onClose()}>
            <DialogContent className={cn(
                "rounded-xl shadow-xl border border-base-200",
                "sm:max-w-5xl! w-full mx-auto",
                THEME.Background.Highlighted200
            )}>
                <DialogHeader className="p-4 border-b">
                    <DialogTitle className="text-xl font-bold text-base-content text-left">
                        Reviewing {employeeName}'s request, Dated: {approvalDate}
                    </DialogTitle>
                    <DialogDescription className="text-left text-base-content/70">
                        Fill review the request and decide on it.
                    </DialogDescription>
                </DialogHeader>
                {fetching ? (
                    <LoadingIcon size={30} className="animation-duration-[2.5s]"/>
                ): fetchError? (
                    <div className="alert rounded-lg shadow-sm flex flex-col md:flex-row items-center justify-between gap-4 my-4">
                        <div className="flex items-start gap-2">
                            <AlertCircle className={cn("w-6 h-6 shrink-0", THEME.Text.RedText)} />
                            <div>
                                <h3 className={cn("font-bold", THEME.Text.RedText)}>Could not retrieve data</h3>
                                <p className={cn("text-sm", THEME.Text.RedText)}>{fetchError}</p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col h-full max-w-full overflow-hidden">
                        {saveError && (
                            <div className={cn("p-3 mb-2 rounded text-sm flex items-center gap-2", THEME.Text.RedText)}>
                                <AlertCircle className="w-4 h-4" />
                                <span>{saveError}</span>
                            </div>
                        )}

                        <div className={cn(THEME.Table.Wrapper, "flex flex-col h-full max-w-full overflow-hidden")}>
                            <div className={cn(THEME.Table.TableContainer, "grow overflow-y-auto overflow-x-hidden w-full")}>
                                <table className="table w-full table-fixed border-collapse">
                                    <thead>
                                        <tr className={THEME.Table.HeaderRow}>
                                            <th className="p-1 border-b text-center w-[5%]">Sr#</th>
                                            <th className="p-1 border-b text-center w-[55%]">Description</th>
                                            <th className="p-1 border-b text-center w-[15%]">Approval</th>
                                            <th className="p-1 border-b text-center w-[25%]">Comments</th>
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
                                                    <td className="p-1 w-[5%] text-center align-middle font-medium text-sm">
                                                        <span>{index + 1}</span>
                                                    </td>
                                                    <td className="p-1 w-[55%] whitespace-normal wrap-break-word align-middle">
                                                        <div className={cn("h-auto min-h-10 whitespace-normal wrap-break-word p-2")}>{items?.[index]?.Description}</div>
                                                    </td>
                                                    <td className="p-1 w-[15%]">
                                                        <Controller 
                                                            control={control}
                                                            name={`items.${index}.Approval` as const}
                                                            render={({field}) => (
                                                                <SingleDropdown 
                                                                    inputName={field.name}
                                                                    placeholder="Pending"
                                                                    widthClass="w-full"
                                                                    staticOptions={[
                                                                        {label: 'Pending', value: null},
                                                                        {label: 'Approve', value: true},
                                                                        {label: 'Reject', value: false},
                                                                    ]}
                                                                    onSelect={(option: DropdownOption | null) => {
                                                                        const selectedValue = option?.value;
                                                                        if (selectedValue === 'true') {
                                                                            field.onChange(true);
                                                                        } else if (selectedValue === 'false') {
                                                                            field.onChange(false);
                                                                        } else {
                                                                            field.onChange(null);
                                                                        }
                                                                    }}
                                                                    defaultValue={field.value?.toString() || undefined}
                                                                />
                                                            )}
                                                        />
                                                        {errors.items?.[index]?.Approval && (
                                                            <p className={cn("text-[10px] mt-1", THEME.Text.RedText)}>{errors.items[index]?.Approval?.message}</p>
                                                        )}
                                                    </td>
                                                    <td className="p-1 w-[25%]">
                                                        <input 
                                                            {...register(`items.${index}.ManagerComments` as const,)} 
                                                            className={THEME.TextInput}
                                                            type="text"
                                                            placeholder="Any Comments"
                                                        />
                                                        {errors.items?.[index]?.ManagerComments && (
                                                            <p className={cn("text-[10px] mt-1", THEME.Text.RedText)}>{errors.items[index]?.ManagerComments?.message}</p>
                                                        )}
                                                    </td>
                                                </tr>
                                            )
                                        })}
                                    </tbody>
                                </table>
                            </div>
                            <div className={cn(THEME.Table.Footer, "mt-0")}>
                                <div className="flex justify-center gap-2">
                                    <Button
                                        type="submit"
                                        className={cn(THEME.ButtonBasic, 'w-full h-12')}
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Loader className="mr-2 h-4 w-4 animate-spin" />
                                                Saving.......
                                            </>
                                        ) : (
                                            <>
                                                <CheckCircle className="mr-2 h-4 w-4" />
                                                Save
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    )
}
