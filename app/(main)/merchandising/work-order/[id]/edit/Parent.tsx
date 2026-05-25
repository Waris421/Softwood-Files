'use client';

import LoadingIcon from "@/_components/generic/Loading";
import { FormProvider, GET_API_URL, useFormRegistry } from "./FormContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/_components/ui/tabs";
import { CheckCircle2, ClipboardList, Layers, Loader2, Paperclip, Printer } from "lucide-react";
import OrderForm from "./Form_Order";
import { useState } from "react";
import MessageBox from "@/_components/generic/MessageBox";
import { THEME } from "@/_components/constants/ui";
import VariantForm from "./Form_Variant";
import RequirementForm from "./Form_Requirement";
import AttachmentForm from "./Form_Attachments";

type FormProps = {
    id: number
}

function GlobalSubmitButton() {
    const { getCombinedData, validateAll, id, markAsClean, isDirty } = useFormRegistry();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [messageConfig, setMessageConfig] = useState<{ show: boolean; subject: string; message: string; action?: () => void; } | null>(null);

    const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        
        const allValid = validateAll();
        if (!allValid) return ;

        setIsSubmitting(true);
        
        //Data is valid now
        const payload = getCombinedData();

        const formData = new FormData();

        formData.append("data", JSON.stringify(payload));

        payload.attachment.items.forEach((item: any, index: number) => {
            const newFile = item.NewFile;
            if (newFile) {

                formData.append(`attachRowIdx_${index}`, newFile);
            }
        });
        
        try {
            const response = await fetch(GET_API_URL(id), {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || error);
            }

            markAsClean();
            setMessageConfig({
                show: true,
                subject: 'Success',
                message: 'Saved Successfully',
                action: () => (window.location.reload())
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
                className={`${THEME.ButtonBasic} flex-1 mt-2`}
            >
                {isSubmitting ? (
                    <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Saving...
                    </>
                ) : (
                    <>
                        <CheckCircle2 size={18} />
                        Save {isDirty && "*"}
                    </>
                )}
            </button>
        </>
    )

}

function PrintWorkOrder() {
    const { id, isAnyLoading } = useFormRegistry();
    const [messageConfig, setMessageConfig] = useState<{ show: boolean; subject: string; message: string; action?: () => void; } | null>(null);

    const handlePrint = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        console.log(id);
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
                onClick={handlePrint}
                disabled={isAnyLoading}
                className={`${THEME.ButtonSecondary} flex-1 mt-2`}
            >
                {isAnyLoading ? (
                    <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Loading...
                    </>
                ) : (
                    <>
                        <Printer size={18} />
                        Print
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

export default function ParentContainer({id}: FormProps) {
    return (
        <>
            <FormProvider id={id}>
                <LoadingContainer>
                    <div className="flex flex-col min-h-screen">
                        <Tabs defaultValue="requirement" className="w-full px-4 pb-2">
                            <div className="sticky top-16 z-30 bg-gray-100 dark:bg-gray-600 opacity-90 border-b border-base-200 px-4">
                                <header className="py-4">
                                    <OrderForm>
                                        <div className="flex gap-2 w-full">
                                            <GlobalSubmitButton />
                                            <PrintWorkOrder />
                                        </div>
                                    </OrderForm>
                                </header>

                                <TabsList className="grid w-full grid-cols-3 h-12" variant="line">
                                    <TabsTrigger value="variant" className="gap-2 cursor-pointer">
                                        <Layers size={18} />
                                        <span className="hidden sm:inline">Variant Details</span>
                                        <span className="sm:hidden">Variant</span>
                                    </TabsTrigger>
                                    <TabsTrigger value="requirement" className="gap-2 cursor-pointer">
                                        <ClipboardList size={18} />
                                        <span className="hidden sm:inline">Inventory Requirement</span>
                                        <span className="sm:hidden">Requirement</span>
                                    </TabsTrigger>
                                    <TabsTrigger value="attachment" className="gap-2 cursor-pointer">
                                        <Paperclip size={18} />
                                        <span className="hidden sm:inline">Relevant Files</span>
                                        <span className="sm:hidden">Files</span>
                                    </TabsTrigger>
                                </TabsList>
                            </div>

                            <div className="mt-4 px-4">
                                <TabsContent value="variant" forceMount className="data-[state=inactive]:hidden">
                                    <VariantForm />
                                </TabsContent>
                                <TabsContent value="requirement" forceMount className="data-[state=inactive]:hidden">
                                    <RequirementForm />
                                </TabsContent>
                                <TabsContent value="attachment" forceMount className="data-[state=inactive]:hidden">
                                    <AttachmentForm />
                                </TabsContent>
                            </div>
                        </Tabs>
                    </div>
                </LoadingContainer>
            </FormProvider>
        </>
    )
}