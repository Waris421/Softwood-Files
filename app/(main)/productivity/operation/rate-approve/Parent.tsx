'use client';

import { DropdownOption } from "@/_components/Dropdown/types";
import MessageBox from "@/_components/generic/MessageBox";
import { useCallback, useEffect, useState } from "react";
import Filters from "./Filters";
import Table from "./Table";

const API_URL = '/api/productivity/operation/rate-approve';

export default function Parent() {
    const [formData, setFormData] = useState<any>({ Operations: ''});
    const [filters, setFilters] = useState<any>({});
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [rawData, setRawData] = useState<any[]>([]);          //Data from the server
    const [tableData, setTableData] = useState<any[]>([]);      //Data that the user see
    const [isLoading, setIsLoading] = useState(false);
    const [messageConfig, setMessageConfig] = useState<{ show: boolean; subject: string; message: string; action?: () => void; } | null>(null);
    const [operationFilterOptions, setOperationFilterOptions] = useState<DropdownOption[]>([]);

    //Get options for the dropdown options of minor filters
    const generateDropdownOptions = (data: any[]) => {
        const operationMap = new Map();

        data.forEach(item => {
            if (item.id && !operationMap.has(item.id)) {
                operationMap.set(item.id, item.Name);
            }
        });

        setOperationFilterOptions(Array.from(operationMap).map(([id, name]) => ({
            value: id,
            label: name
        })));
    }

    //Fetch the data from api
    useEffect(() => {
        const fetchData = async() => {
            setIsLoading(true);
            try {
                const response = await fetch(API_URL);
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(`${errorData.details.message}`);
                };

                const data = await response.json();
                
                setRawData(data);
                generateDropdownOptions(data);

            } catch (err: any) {
                setMessageConfig({
                    show: true,
                    subject: "Fetch Error",
                    message: err.message,
                    action: () => setRefreshTrigger(prev => prev + 1),
                });
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [refreshTrigger]);

    //Refresh the visible data when the filters change
    useEffect(() => {
        setIsLoading(true);
        let filtered = [...rawData];

        if (filters.Operations && filters.Operations.length > 0) {
            const selectedOps = Array.isArray(filters.Operations) ? filters.Operations : [filters.Operations];
            filtered = filtered.filter(item => selectedOps.includes(String(item.id)));
        }

        const limitedData = filtered.slice(0, 25);

        setTableData(limitedData);

        setIsLoading(false);
    }, [rawData, filters]);

    const handleFilterSubmit = (allFilters: any) => {
        setIsLoading(true);

        setFilters(allFilters);

        setIsLoading(false);
    }

    const handleTableDataChange = useCallback((selectedItems: any[]) => {
        setFormData((prev: any) => {
            if (JSON.stringify(prev.Operations) === JSON.stringify(selectedItems)) {
                return prev;
            }

            return {
                ...prev,
                Operations: selectedItems,
            };
        });
    }, []);

    const handleSubmit = async () => {
        if (formData.Operations.length === 0) {
            setMessageConfig({
                show: true,
                subject: "Missing Operations",
                message: "At least one Operation is required.",
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
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || error);
            }
            setRefreshTrigger(prev => prev + 1);
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
                onTableSubmit={handleSubmit}
                onPageRefresh={() => setRefreshTrigger(prev => prev + 1)}
                isLoading={isLoading}
                options={{opFilterOptions: operationFilterOptions}}
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