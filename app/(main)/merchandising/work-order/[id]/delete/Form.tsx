'use client';

import { THEME } from "@/_components/constants/ui";
import LoadingIcon from "@/_components/generic/Loading";
import MessageBox from "@/_components/generic/MessageBox";
import { ArrowLeft, Loader2, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface FormProps {
    id: number;
    baseApiUrl?: string;
    redirectUrl?: string;
}

export default function OrderDeleteForm({
    id,
    baseApiUrl = '/api/merchandising/work-order',
    redirectUrl = '/merchandising/work-order'
}: FormProps){
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [messageConfig, setMessageConfig] = useState<{ show: boolean; subject: string; message: string; action?: () => void; } | null>(null);

    const router = useRouter();

    useEffect(() => {
        const checkDeletability = async() => {
            
            try {
                const apiURL = `${baseApiUrl}/${id}/delete`;

                const response = await fetch(apiURL);
                if (response.status === 403) {
                    const errorData = await response.json();

                    const protectedResources = errorData.protectedResources
                    const formattedResources = protectedResources
                        .map((res: any) => `• ${res}`)
                        .join('\n');

                    
                    const errorMessage = `This order cannot be deleted due to the following dependencies:\n${formattedResources}`
                    setMessageConfig({
                        show: true,
                        subject: "Conflict detected",
                        message: errorMessage,
                        action: () => {
                            router.back();
                        }
                    });
                    return ;
                }

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(`${errorData.details.message}`);
                }
            } catch (err: any) {
                setMessageConfig({
                    show: true,
                    subject: "Fetch Error",
                    message: err.message,
                    action: () => {
                        window.location.reload();
                    }
                });
            } finally {
                setIsLoading(false);
            }         
            
            setIsLoading(false)
        }

        checkDeletability()
    }, [baseApiUrl]);

    const handleDelete = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            setIsSubmitting(true);

            const apiURL = `${baseApiUrl}/${id}/delete`;

            const response = await fetch(apiURL, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || error);
            }

            setMessageConfig({
                show: true,
                subject: 'Success',
                message: 'Data deleted',
                action: () => {
                    router.push(redirectUrl);
                }
            });
        } catch (err: any) {
            setMessageConfig({
                show: true,
                subject: "Error",
                message: `Action Failed: ${err}`
            });
        } finally {
            setIsSubmitting(false);
        }
    }

    if (isLoading) return (
        <LoadingIcon />
    );
    
    return (
        <div className="card w-full max-w-md bg-base-100 shadow-xl border border-base-200 rounded-lg">
            <div className="card-body items-center text-center">
                <div className="bg-error/10 p-4 rounded-full mb-2">
                    <Trash2 className="w-8 h-8 text-error" />
                </div>

                <h2 className="card-title text-2xl font-bold">Are you sure?</h2>

                <p className="text-base-content/70">
                    You are about to delete Work Order: <span className="font-semibold text-base-content">"{id}"</span>.
                    This action cannot be undone.
                </p>

                <form onSubmit={handleDelete} className="card-actions w-full mt-6">
                    <div className="flex flex-row-reverse gap-3 w-full">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={`${THEME.ButtonBasic} gap-2`}
                        >
                            {isSubmitting ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                <Trash2 className="w-4 h-4" />
                            )}
                            {isSubmitting ? 'Deleting...' : 'Confirm Delete'}
                        </button>

                        <button
                            type="button"
                            onClick={() => router.back()}
                            disabled={isSubmitting}
                            className={`${THEME.ButtonSecondary} gap-2`}
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Go Back
                        </button>
                    </div>
                </form>

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
            </div>
        </div>
    )
}