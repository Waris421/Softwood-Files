'use client';

import LoadingIcon from "@/_components/generic/Loading";
import { API_URL, REDIRECT_URL, FormProvider, useFormRegistry } from "./FormContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/_components/ui/tabs";
import { Layers, Loader2, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import OrderForm from "./Form_Order";
import MessageBox from "@/_components/generic/MessageBox";
import { THEME } from "@/_components/constants/ui";
import VariantForm from "./Form_Variant";

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
        const payload = getCombinedData();

        const formData = new FormData();

        formData.append("data", JSON.stringify(payload));

        payload.attachment?.items.forEach((item: any, index: number) => {
            const newFile = item.NewFile;
            if (newFile) {

                formData.append(`attachRowIdx_${index}`, newFile);
            }
        });
        
        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || error);
            }

            const orderNumber = payload.order.OrderNumber;
            const redirectUrl = `${REDIRECT_URL}/${orderNumber}/edit`;

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
            setIsSubmitting(false)
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
                className={`${THEME.ButtonBasic} w-full h-15 mt-2`}
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
                        <Tabs defaultValue="variant" className="w-full px-4 pb-2">
                            <div className="sticky top-16 z-30 bg-gray-100 dark:bg-gray-600 opacity-90 border-b border-base-200 px-4">
                                <header className="py-4">
                                    <OrderForm>
                                        <GlobalSubmitButton />
                                    </OrderForm>
                                </header>

                                <TabsList className="grid w-full grid-cols-1 h-12" variant="line">
                                    <TabsTrigger value="variant" className="gap-2">
                                        <Layers size={18} />
                                        <span className="hidden sm:inline">Variant Details</span>
                                        <span className="sm:hidden">Variant</span>
                                    </TabsTrigger>
                                </TabsList>
                            </div>

                            <div className="mt-4 px-4">
                                <TabsContent value="variant" forceMount className="data-[state=inactive]:hidden">
                                    <VariantForm />
                                </TabsContent>
                            </div>
                        </Tabs>
                    </div>
                </LoadingContainer>
            </FormProvider>
        </>
    )
}