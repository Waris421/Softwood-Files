'use client';

import { DropdownOption } from "@/_components/Dropdown/types";
import { useCallback, useEffect, useState } from "react";
import Filters from "./Filters";
import Table from "./Table";
import MessageBox from "@/_components/generic/MessageBox";

const API_URL = `/api/mmc/issuance/add-sample`;

export default function Parent() {
    const [formData, setFormData] = useState<any>({ Inventories: [], Department: '' });
    const [majorFilters, setMajorFilters] = useState<any>({});
    const [minorFilters, setMinorFilters] = useState<any>({});
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [rawData, setRawData] = useState<any[]>([]);          //Data from the server
    const [tableData, setTableData] = useState<any[]>([]);      //Data that the user see
    const [isLoading, setIsLoading] = useState(false);
    const [messageConfig, setMessageConfig] = useState<{ show: boolean; subject: string; message: string; action?: () => void; } | null>(null);
    const [inventoryFilterOptions, setInventoryFilterOptions] = useState<DropdownOption[]>([]);


    //Get options for the dropdown options of minor filters
    const generateDropdownOptions = (data: any[]) => {
        const inventoryMap = new Map();

        data.forEach(item => {
            if (item.Inventory && !inventoryMap.has(item.Inventory)) {
                inventoryMap.set(item.Inventory, item.InventoryName);
            }
        });

        setInventoryFilterOptions(Array.from(inventoryMap).map(([code, name]) => ({
            value: code,
            label: name
        })));
    }

    //Fetch all un-issued sampling inventory
    useEffect(() => {
        const loadData = async() => {
            setIsLoading(true);

            try {
                const response = await fetch(API_URL);
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(`${errorData.details.message}`);
                }

                const data = await response.json();

                setRawData(data);

                generateDropdownOptions(data);
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

        loadData()
    }, [majorFilters, refreshTrigger]);

    //Refresh the visible data when the minor filters change
    useEffect(() => {
        setIsLoading(true);
        let filtered = [...rawData];

        if (minorFilters.Inventories && minorFilters.Inventories.length > 0) {
            const selectedInv = Array.isArray(minorFilters.Inventories) ? minorFilters.Inventories : [minorFilters.Inventories];
            filtered = filtered.filter(item => selectedInv.includes(item.Inventory));
        }

        setTableData(filtered);

        setIsLoading(false);
    }, [rawData, minorFilters]);

    const handleFilterSubmit = (allFilters: any) => {
        setIsLoading(true);
        //Split major and minor filters.
        const { Inventories,...rest } = allFilters;

        //Is a major filter changed
        const majorChanged = JSON.stringify(rest) !== JSON.stringify(majorFilters);

        //Only call backend if a major filter is changed
        if (majorChanged) {
            setMajorFilters(rest);
            setRefreshTrigger(prev => prev + 1);
        }

        setMinorFilters({ Inventories });
        setIsLoading(false);
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
                    window.location.reload();
                }
            });
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
                options={{ invFilterOptions: inventoryFilterOptions}}
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