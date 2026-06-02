'use client';

import LoadingIcon from "@/_components/generic/Loading";
import { GET_REDIRECT_URL, FormProvider, useFormRegistry, API_URL } from "./FormContext";
import HeadingForm from "./Form_Heading";
import { useRouter } from "next/navigation";
import { useState } from "react";
import MessageBox from "@/_components/generic/MessageBox";
import { THEME } from "@/_components/constants/ui";
import { Loader2, Save } from "lucide-react";
import InventoryTable from "./Form_Inventory";

function GlobalSubmitButton() {
    const { getCombinedData, validateAll } = useFormRegistry();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [messageConfig, setMessageConfig] = useState<{ show: boolean; subject: string; message: string; action?: () => void; } | null>(null);
    const router = useRouter();

    const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        
        const allValid = validateAll();
        if (!allValid) return ;

        setIsSubmitting(true);
        
        //Data is valid now
        const raw = getCombinedData();

        const payload = {
            heading: {
                PONumber: raw.heading?.PONumber,
                Amount: raw.heading?.Amount,
                Bilty: raw.heading?.Bilty,
                Vehicle: raw.heading?.Vehicle,
                Invoice: raw.heading?.Invoice,
            },
            inventory: (raw.inventory?.items || []).map((item: any) => ({
                id: item.id,
                Quantity: item.Quantity,
                Inventory: item.Inventory,
                Variant: item.Variant,
            })),
        };

        setIsSubmitting(true);

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || error);
            }

            const resData = await response.json();
            const recNumber = resData.recNumber
            const redirectUrl = GET_REDIRECT_URL(recNumber);

            setMessageConfig({
                show: true,
                subject: "Success",
                message: `Saved Successfully`,
                action: () => {
                    router.push(redirectUrl)
                }
            });
        } catch (err: any) {
            setMessageConfig({
                show: true,
                subject: "Error",
                message: `Saving Failed: ${err}`
            });
        } finally {
            setIsSubmitting(false);
        }
    }

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
                className={`${THEME.ButtonBasic} w-full h-14 mt-2`}
            >
                {isSubmitting ? (
                    <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Saving...
                    </>
                ) : (
                    <>
                        <Save className="h-4 w-4" />
                        Save
                    </>
                )}
            </button>
        </>
    )
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

export default function ParentContainer() {
    return (
        <>
            <FormProvider>
                <LoadingContainer>
                    <div className="flex flex-col min-h-screen">
                        <div className="sticky top-16 z-30 bg-gray-100 dark:bg-gray-600 opacity-90 border-b border-base-200 px-4">
                            <HeadingForm>
                                <GlobalSubmitButton />
                            </HeadingForm>
                        </div>

                        <InventoryTable />
                    </div>
                </LoadingContainer>
            </FormProvider>
        </>
    )
}