'use client';

import { FormProvider, useFormRegistry, POST_API_URL } from "./FormContext";
import { Loader2 } from "lucide-react";
import { THEME } from "@/_components/constants/ui";
import LoadingIcon from "@/_components/generic/Loading";
import { useState } from "react";
import MessageBox from "@/_components/generic/MessageBox";
import HeaderForm from "./Form_Header";
import ItemsForm from "./Form_Items";

type FormProps = { id: string }

function GlobalSubmitButton() {
    const { getCombinedData, validateAll, id } = useFormRegistry();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [messageConfig, setMessageConfig] = useState<{ show: boolean; subject: string; message: string; action?: () => void } | null>(null);

    const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        if (!validateAll()) return;

        setIsSubmitting(true);

        const data = getCombinedData();
        const header = data.header || {};
        const items  = data.inventory?.items || [];
        const allocationsMap: Record<number, { WorkOrder: number; Quantity: number }[]> = data.allocations || {};

        const inventoryRows = items.map((row: any) => ({
            id:            row.id || null,
            InventoryCode: row.Inventory,
            InventoryName: row.InventoryName,
            Variant:       row.Variant,
            Quantity:      row.Quantity,
            Price:         row.Price,
            Currency:      row.Currency,
            Forex:         row.Forex,
        }));

        // DB ids of rows that actually have allocations saved
        const allocations = Object.entries(allocationsMap).flatMap(([allocId, allocs]) =>
            allocs.map(a => ({ allocId: Number(allocId), WorkOrder: a.WorkOrder, Quantity: a.Quantity }))
        );

        const payload = {
            Supplier:     header.Supplier,
            DeliveryDate: header.DeliveryDate,
            Tax:          header.Tax,
            inventory:    inventoryRows,
            allocations,
        };

        try {
            const res = await fetch(POST_API_URL(id), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.message || 'Save failed');
            }
            setMessageConfig({ show: true, subject: 'Success', message: 'Purchase Order saved successfully', action: () => window.location.reload() });
        } catch (err: any) {
            setMessageConfig({ show: true, subject: 'Error', message: `Saving failed: ${err}` });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            {messageConfig?.show && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <MessageBox
                        subject={messageConfig.subject}
                        message={messageConfig.message}
                        confirmText="Close"
                        onConfirm={() => {
                            if (messageConfig.action) messageConfig.action();
                            setMessageConfig(null);
                        }}
                    />
                </div>
            )}
            <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className={`${THEME.ButtonBasic} h-10 px-6`}
            >
                {isSubmitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving...</> : 'Save'}
            </button>
        </>
    );
}

function LoadingContainer({ children }: { children: React.ReactNode }) {
    const { isAnyLoading } = useFormRegistry();
    return (
        <div className="relative">
            {isAnyLoading && (
                <div className="absolute inset-0 bg-white/50 z-50"><LoadingIcon /></div>
            )}
            {children}
        </div>
    );
}

export default function ParentContainer({ id }: FormProps) {
    return (
        <FormProvider id={id}>
            <LoadingContainer>
                <div className="flex flex-col min-h-screen">
                    {/* Sticky header — always visible while scrolling */}
                    <div className="sticky top-16 z-30 bg-gray-100 dark:bg-gray-600 opacity-90 border-b border-base-200">
                        <HeaderForm>
                            <GlobalSubmitButton />
                        </HeaderForm>
                    </div>

                    {/* Items table below */}
                    <div className="p-4">
                        <ItemsForm />
                    </div>
                </div>
            </LoadingContainer>
        </FormProvider>
    );
}
