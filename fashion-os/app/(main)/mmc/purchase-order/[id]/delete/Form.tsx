'use client';

import { THEME } from "@/_components/constants/ui";
import MessageBox from "@/_components/generic/MessageBox";
import { ArrowLeft, Loader2, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function PODeleteForm({ id }: { id: string }) {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [messageConfig, setMessageConfig] = useState<{ show: boolean; subject: string; message: string; action?: () => void } | null>(null);

    const handleDelete = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const res = await fetch(`/api/mmc/purchase-order/${id}/delete`, {
                method: 'DELETE',
            });
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.message || 'Delete failed');
            }
            setMessageConfig({
                show: true,
                subject: 'Success',
                message: 'Purchase Order deleted successfully',
                action: () => router.push('/mmc/purchase-order'),
            });
        } catch (err: any) {
            setMessageConfig({
                show: true,
                subject: 'Error',
                message: `Delete failed: ${err}`,
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="card w-full max-w-md bg-base-100 shadow-xl border border-base-200 rounded-lg">
            <div className="card-body items-center text-center">
                <div className="bg-error/10 p-4 rounded-full mb-2">
                    <Trash2 className="w-8 h-8 text-error" />
                </div>
                <h2 className="card-title text-2xl font-bold">Are you sure?</h2>
                <p className="text-base-content/70">
                    You are about to delete Purchase Order <span className="font-semibold text-base-content">#{id}</span>. This action cannot be undone.
                </p>
                <form onSubmit={handleDelete} className="card-actions w-full mt-6">
                    <div className="flex flex-row-reverse gap-3 w-full">
                        <button type="submit" disabled={isSubmitting} className={`${THEME.ButtonBasic} gap-2`}>
                            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                            {isSubmitting ? 'Deleting...' : 'Confirm Delete'}
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
    );
}
