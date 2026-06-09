'use client';

import MessageBox from "@/_components/generic/MessageBox";
import { useCallback, useEffect, useState } from "react";
import Filters from "./Filters";
import Table from "./Table";

const API_URL = `/api/mmc/issuance/add-inv`;

export default function Parent() {
    const [formData, setFormData] = useState<any>({ Inventories: [], Department: '' });
    const [filters, setFilters] = useState<any>({});
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [tableData, setTableData] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [messageConfig, setMessageConfig] = useState<{ show: boolean; subject: string; message: string; action?: () => void; } | null>(null);

    //Fetch all un-issued receipts of selected inventories
    useEffect(() => {
        const loadData = async() => {
            setIsLoading(true);
            const params = new URLSearchParams();

            if (filters && filters.length > 0) {
                filters.forEach((filter: string) => {
                    params.append('filters', filter);
                });
            } else {
                setIsLoading(false);
                return ;
            }

            const apiUrl = `${API_URL}?${params.toString()}`;

            try {
                const response = await fetch(apiUrl);
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(`${errorData.details.message}`);
                }

                const data = await response.json();

                setTableData(data);
            } catch (err: any) {
                setMessageConfig({
                    show: true,
                    subject: "Fetch Error",
                    message: err.message,
                });
            } finally {
                setIsLoading(false);
            }
        };

        loadData();
    },[filters, refreshTrigger]);

    const handleFilterSubmit = (allFilters: any) => {
        //Split department and the rest.
        const { Inventories } = allFilters;

        //Is a major filter changed
        const filterChanged = JSON.stringify(Inventories) !== JSON.stringify(filters);

        //Only call backend if a major filter is changed
        if (filterChanged) {
            setFilters(Inventories);
        }
        setRefreshTrigger(prev => prev + 1);
    };

    const handleTableDataChange = useCallback((selectedItems: any[]) => {
        setFormData((prev: any) => {
            if (JSON.stringify(prev.Inventories) === JSON.stringify(selectedItems)) {
                return prev;
            }

            return {
                ...prev,
                Inventories: selectedItems,
            };
        });
    }, []);

    const handleFinalSubmit = async () => {
        const isInventoriesEmpty = formData.Inventories.length === 0;
        const isDepartmentEmpty = !formData.Department?.trim();

        if (isInventoriesEmpty || isDepartmentEmpty) {
            let errorMessage = "";

            if (isInventoriesEmpty && isDepartmentEmpty) {
                errorMessage = "Please select a department and add at least one inventory.";
            } else if (isInventoriesEmpty) {
                errorMessage = "At lease one inventory is required.";
            } else {
                errorMessage = "Department name is required.";
            }

            setMessageConfig({
                show: true,
                subject: "Missing Information",
                message: errorMessage,
            });

            return;
        }

        setIsLoading(true);
        
        try {
            const response = await fetch(API_URL, {
                method: "POST",
                headers: {
                    "content-type": "application/json",
                },
                body: JSON.stringify(formData, (key, value) => 
                    value === undefined ? null : value
                ),
            })
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || error);
            }

            const resData = await response.json();
            const issuanceNumber = resData.issuanceNumber;

            setMessageConfig({
                show: true,
                subject: 'Success',
                message: `Saved Successfully. Issuance Number: ${issuanceNumber}`,
                action: () => {
                    setRefreshTrigger(prev => prev + 1);;
                }
            });
            setIsLoading(false);
        } catch (err: any) {
            setMessageConfig({
                show: true,
                subject: "Fetch Error",
                message: err.message,
            });
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <>
            <Filters 
                onFilterSubmit={handleFilterSubmit}
                onDataChange={(data) => setFormData((prev: any) => ({ ...prev, ...data }))}
                onTableSubmit={handleFinalSubmit}
                isLoading={isLoading}
            />
            <Table
                initialData={tableData}
                isLoading={isLoading}
                onDataChange={handleTableDataChange}
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
    )
}