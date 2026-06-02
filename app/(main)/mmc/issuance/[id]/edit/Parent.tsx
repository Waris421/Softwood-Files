'use client';

import { useCallback, useEffect, useState } from "react";
import Table from "./Table";
import MessageBox from "@/_components/generic/MessageBox";
import { THEME } from "@/_components/constants/ui";
import { Loader2, Save } from "lucide-react";

type Props = { id: number };

const GET_URL = (id: number) => `/api/mmc/issuance/${id}/update`;

export default function Parent({ id }: Props) {
    const [tableData, setTableData] = useState<any[]>([]);
    const [inventory, setInventory] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [messageConfig, setMessageConfig] = useState<{ show: boolean; subject: string; message: string; action?: () => void; } | null>(null);

    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            try {
                const response = await fetch(GET_URL(id));
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.details?.message || "Failed to load issuance");
                }
                const data = await response.json();
                setTableData(data.inventories || []);
            } catch (err: any) {
                setMessageConfig({ show: true, subject: "Fetch Error", message: err.message });
            } finally {
                setIsLoading(false);
            }
        };
        loadData();
    }, [id]);

    const handleDataChange = useCallback((data: any[]) => {
        setInventory(data);
    }, []);

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            const response = await fetch(GET_URL(id), {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ inventory }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || "Save failed");
            }

            const resData = await response.json();
            setMessageConfig({
                show: true,
                subject: 'Success',
                message: `Saved Successfully. Issuance: ${resData.issuanceId}`,
                action: () => window.location.reload()
            });
        } catch (err: any) {
            setMessageConfig({ show: true, subject: "Error", message: err.message });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <div className="p-4">
                <button
                    onClick={handleSubmit}
                    disabled={isSubmitting || isLoading}
                    className={`${THEME.ButtonBasic} w-full`}
                >
                    {isSubmitting ? (
                        <><Loader2 className="h-4 w-4 animate-spin" /> Saving...</>
                    ) : (
                        <><Save className="h-4 w-4" /> Save</>
                    )}
                </button>
            </div>

            <Table
                initialData={tableData}
                isLoading={isLoading}
                onDataChange={handleDataChange}
            />

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
        </>
    );
}
