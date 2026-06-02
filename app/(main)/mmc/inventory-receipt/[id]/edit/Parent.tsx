'use client';

import LoadingIcon from "@/_components/generic/Loading";
import { FormProvider, GET_API_URL, useFormRegistry } from "./FormContext";
import HeadingForm from "./Form_Heading";
import { useState } from "react";
import MessageBox from "@/_components/generic/MessageBox";
import { THEME } from "@/_components/constants/ui";
import { CheckCircle2, Loader2 } from "lucide-react";
import InventoryTable from "./Form_Inventory";

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

        console.log(payload);

        setIsSubmitting(false);

        return ;
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
                className={`${THEME.ButtonBasic} mt-2 w-full`}
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