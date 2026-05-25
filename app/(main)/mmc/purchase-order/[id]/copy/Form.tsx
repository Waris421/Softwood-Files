'use client';

import { THEME } from "@/_components/constants/ui";
import MessageBox from "@/_components/generic/MessageBox";
import { ArrowLeft, Copy, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function POCopyForm({ id }: { id: string }) {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [messageConfig, setMessageConfig] = useState<{ show: boolean; subject: string; message: string; action?: () => void } | null>(null);

    const handleCopy = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const res = await fetch(`/api/mmc/purchase-order/${id}/copy`, {
                method: 'POST',
            });
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.message || 'Copy failed');
            }
            const data = await res.json();
            const newId = data.PONumber;
            setMessageConfig({
                show: true,
                subject: 'Success',
                message: `PO #${id} copied successfully. New PO number is #${newId}.`,
                action: () => router.push(`/mmc/purchase-order/${newId}/edit`),
            });
        } catch (err: any) {
            setMessageConfig({
                show: true,
                subject: 'Error',
                message: `Copy failed: ${err}`,
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="card w-full max-w-md bg-base-100 shadow-xl border border-base-200 rounded-lg">
            <div className="card-body items-center text-center">
                <div className="bg-primary/10 p-4 rounded-full mb-2">
                    <Copy className="w-8 h-8 text-primary" />
                </div>
                <h2 className="card-title text-2xl font-bold">Copy Purchase Order</h2>
                <p className="text-base-content/70">
                    This will create a new Purchase Order as a copy of{' '}
                    <span className="font-semibold text-base-content">PO #{id}</span>.
                    You will be redirected to edit the new PO.
                </p>
                <form onSubmit={handleCopy} className="card-actions w-full mt-6">
                    <div className="flex flex-row-reverse gap-3 w-full">
                        <button type="submit" disabled={isSubmitting} className={`${THEME.ButtonBasic} gap-2`}>
                            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Copy className="w-4 h-4" />}
                            {isSubmitting ? 'Copying...' : 'Confirm Copy'}
                        </button>
                        <button type="button" onClick={() => router.back()} disabled={isSubmitting} className={`${THEME.ButtonSecondary} gap-2`}>
                            <ArrowLeft className="w-4 h-4" /> Go Back
                        </button>
                    </div>
                </form>
                {messageConfig?.show && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                        <MessageBox
                            subject={messageConfig.subject}
                            message={messageConfig.message}
                            confirmText="Go to New PO"
                            onConfirm={() => {
                                if (messageConfig.action) messageConfig.action();
                                setMessageConfig(null);
                            }}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
