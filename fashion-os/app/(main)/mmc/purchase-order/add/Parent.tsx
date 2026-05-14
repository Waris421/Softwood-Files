'use client';

import { useFormRegistry, ADD_API_URL, AddFormProvider } from "./AddFormContext";
import { Loader2 } from "lucide-react";
import { THEME } from "@/_components/constants/ui";
import LoadingIcon from "@/_components/generic/Loading";
import { useState } from "react";
import MessageBox from "@/_components/generic/MessageBox";
import HeaderForm from "./Form_Header";
import ItemsForm from "./Form_Items";
import { useRouter } from "next/navigation";

function GlobalSubmitButton() {
    const { getCombinedData, validateAll } = useFormRegistry();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [messageConfig, setMessageConfig] = useState<{ show: boolean; subject: string; message: string; action?: () => void } | null>(null);
    const router = useRouter();

    const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        // Run all validators — stops here if any field is invalid
        if (!validateAll()) return;

        setIsSubmitting(true);

        // Read the latest state from all child forms
        const data = getCombinedData();
        const header = data.header || {};
        const items  = data.inventory?.items || [];

        // Transform into the shape Django expects
        const payload = {
            Supplier:     header.Supplier,
            DeliveryDate: header.DeliveryDate,
            Tax:          header.Tax,
            inventory: items.map((row: any) => ({
                id:            null,
                InventoryCode: row.Inventory,
                InventoryName: row.InventoryName,
                Variant:       row.Variant,
                Quantity:      row.Quantity,
                Price:         row.Price,
                Currency:      row.Currency,
                Forex:         row.Forex,
            })),
        };

        try {
            const res = await fetch(ADD_API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.message || 'Save failed');
            }

            const result = await res.json();
            // Use the new PO's ID from Django to redirect to its edit page
            const newId = result.PONumber;

            setMessageConfig({
                show: true,
                subject: 'Success',
                message: 'Purchase Order created successfully',
                action: () => {
                    if (newId) router.push(`/mmc/purchase-order/${newId}/edit`);
                    else router.push('/mmc/purchase-order');
                },
            });
        } catch (err: any) {
            setMessageConfig({
                show: true,
                subject: 'Error',
                message: `Failed to create PO: ${err}`,
            });
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
                {isSubmitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving...</> : 'Create PO'}
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

export default function AddParentContainer() {
    return (
        <AddFormProvider>
            <LoadingContainer>
                <div className="flex flex-col min-h-screen">
                    {/* Sticky header bar — always visible while scrolling */}
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
        </AddFormProvider>
    );
}
