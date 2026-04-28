'use client';

import { FormProvider, useFormRegistry, GET_API_URL } from "./FormContext";
import { Layers, Loader2, Paperclip, Route, Router, Zap } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/_components/ui/tabs";
import { THEME } from "@/_components/constants/ui";
import LoadingIcon from "@/_components/generic/Loading";
import { useState } from "react";
import MessageBox from "@/_components/generic/MessageBox";
import { useRouter } from "next/navigation";
import StyleForm from "./Form_Style";
import VariantForm from "./Form_Variant";
import RouteForm from "./Form_Route";
import ConsumptionForm from "./Form_Consumption";
import AttachmentForm from "./Form_Attachments";

type FormProps = {
    code: string
}

function GlobalSubmitButton() {
    const { getCombinedData, validateAll, code } = useFormRegistry();
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

        payload.attachment.items.forEach((item: any, index: number) => {
            const newFile = item.NewFile;
            if (newFile) {

                formData.append(`attachRowIdx_${index}`, newFile);
            }
        });
        
        try {
            const response = await fetch(GET_API_URL(code), {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || error);
            }

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
                className={`${THEME.ButtonBasic} w-full h-15 mt-2`}
            >
                {isSubmitting ? (
                    <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Saving...
                    </>
                ) : (
                    "Save"
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

export default function ParentContainer({code}: FormProps) {    
    return (
        <>
            <FormProvider code={code}>
                <LoadingContainer>
                    <div className="flex flex-col min-h-screen">
                        <Tabs defaultValue="consumption" className="w-full px-4 pb-2">
                            <div className="sticky top-16 z-30 bg-gray-100 dark:bg-gray-600 opacity-90 border-b border-base-200 px-4">
                                <header className="py-4">
                                    <StyleForm>
                                        <GlobalSubmitButton />
                                    </StyleForm>
                                </header>

                                <TabsList className="grid w-full grid-cols-4 h-12" variant="line">
                                    <TabsTrigger value="variant" className="gap-2">
                                        <Layers size={18} />
                                        <span className="hidden sm:inline">Variant Details</span>
                                        <span className="sm:hidden">Variant</span>
                                    </TabsTrigger>
                                    <TabsTrigger value="consumption" className="gap-2">
                                        <Zap size={18} />
                                        <span className="hidden sm:inline">Inventory Consumption</span>
                                        <span className="sm:hidden">Consumption</span>
                                    </TabsTrigger>
                                    <TabsTrigger value="attachment" className="gap-2">
                                        <Paperclip size={18} />
                                        <span className="hidden sm:inline">Relevant Files</span>
                                        <span className="sm:hidden">Files</span>
                                    </TabsTrigger>
                                    <TabsTrigger value="route" className="gap-2">
                                        <Route size={18} />
                                        <span className="hidden sm:inline">Route Details</span>
                                        <span className="sm:hidden">Route</span>
                                    </TabsTrigger>
                                </TabsList>
                            </div>

                            <div className="mt-4 px-4">
                                <TabsContent value="variant" forceMount className="data-[state=inactive]:hidden">
                                    <VariantForm />
                                </TabsContent>
                                <TabsContent value="consumption" forceMount className="data-[state=inactive]:hidden">
                                    <ConsumptionForm />
                                </TabsContent>
                                <TabsContent value="attachment" forceMount className="data-[state=inactive]:hidden">
                                    <AttachmentForm />
                                </TabsContent>
                                <TabsContent value="route" forceMount className="data-[state=inactive]:hidden">
                                    <RouteForm />
                                </TabsContent>
                            </div>
                        </Tabs>
                    </div>
                </LoadingContainer>
            </FormProvider>
        </>
    )
}
