'use client';

import { useEffect, useState } from "react";
import Filters from "./Filters";
import Table from "./Table";
import { DropdownOption } from "@/_components/Dropdown/types";
import MessageBox from "@/_components/generic/MessageBox";

//The Threadhold above which no data would be shown user. Optimise as per user experience
const ROW_THRESHOLD = 100;

export default function Parent() {
    const [majorFilters, setMajorFilters] = useState<any>({});
    const [minorFilters, setMinorFilters] = useState<any>({});
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [rawData, setRawData] = useState<any[]>([]);          //Data from the server
    const [tableData, setTableData] = useState<any[]>([]);      //Data that the user see
    const [isLoading, setIsLoading] = useState(false);
    const [messageConfig, setMessageConfig] = useState<{ show: boolean; subject: string; message: string; action?: () => void; } | null>(null);
    const [inventoryFilterOptions, setInventoryFilterOptions] = useState<DropdownOption[]>([]);
    const [typeFilterOptions, setTypeFilterOptions] = useState<DropdownOption[]>([]);

    //Get options for the dropdown options of minor filters
    const generateDropdownOptions = (data: any[]) => {
        const inventoryMap = new Map();
        const typeSet = new Set<string>();

        data.forEach(item => {
            if (item.InventoryCode && !inventoryMap.has(item.InventoryCode)) {
                inventoryMap.set(item.InventoryCode, item.InventoryName);
            }
            if (item.Type) {
                typeSet.add(item.Type);
            }
        });

        setInventoryFilterOptions(Array.from(inventoryMap).map(([code, name]) => ({
            value: code,
            label: name
        })));

        setTypeFilterOptions(Array.from(typeSet).map(type => ({
            value: type,
            label: type
        })));
    }

    //Fetch the data when the major filters change.
    useEffect(() => {
        const fetchData = async() => {
            setIsLoading(true);

            try {
                const searchParams = new URLSearchParams();
                Object.entries(majorFilters).forEach(([key, value]) => {
                    if (["Inventories", "Type"].includes(key)) return;
                    if (Array.isArray(value)) {
                        value.forEach(item => searchParams.append(key, item));
                    } else if (value) {
                        searchParams.append(key, value.toString());
                    }
                });
                
                const apiURL = `/api/merchandising/pending-orders?${searchParams.toString()}`;

                const response = await fetch(apiURL);
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(`${errorData.details.message}`);
                }

                const data = await response.json();

                setRawData(data);
                generateDropdownOptions(data);

                if (data.length > ROW_THRESHOLD) {
                    setTableData([]);
                    setMessageConfig({
                        show: true,
                        subject: "Too Much Data",
                        message: `There are curenctly ${data.length} rows. Please narrow down your filters to view the data.`,
                    });
                }
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

        if (Object.keys(majorFilters).length > 0) fetchData();
    }, [majorFilters, refreshTrigger]);

    //Refresh the visible data when the minor filters change
    useEffect(() => {
        let filtered = [...rawData];

        if (minorFilters.Inventories && minorFilters.Inventories.length > 0) {
            const selectedInv = Array.isArray(minorFilters.Inventories) ? minorFilters.Inventories : [minorFilters.Inventories];
            filtered = filtered.filter(item => selectedInv.includes(item.InventoryCode));
        }

        if (minorFilters.Type && minorFilters.Type.length > 0) {
            const selectedTypes = Array.isArray(minorFilters.Type) ? minorFilters.Type : [minorFilters.Type];
            filtered = filtered.filter(item => selectedTypes.includes(item.Type));
        }

        if (filtered.length > ROW_THRESHOLD) {
            setTableData([]);
            if (rawData.length > 0) {
                setMessageConfig({
                    show: true,
                    subject: "Too Much Data",
                    message: `There are curenctly ${filtered.length} rows. Please narrow down your filters to view the data.`,
                });
            }
        } else {
            // 3. If it's below the threshold, show it!
            setTableData(filtered);
        }

    }, [rawData, minorFilters]);

    const handleFilterSubmit = (allFilters: any) => {
        setIsLoading(true);
        //Split major and minor filters.
        const { Inventories, Type, ...rest } = allFilters;

        //Is a major filter changed
        const majorChanged = JSON.stringify(rest) !== JSON.stringify(majorFilters);

        //Only call backend if a major filter is changed
        if (majorChanged) {
            setMajorFilters(rest);
            setRefreshTrigger(prev => prev + 1);
        }

        setMinorFilters({ Inventories, Type });
        setIsLoading(false);
    };

    return (
        <>
            <Filters
                onFilterSubmit={handleFilterSubmit}
                isLoading={isLoading}
                options={{ invFilterOptions: inventoryFilterOptions, typeFilterOptions: typeFilterOptions }}
            />

            <Table initialData={tableData} isLoading={isLoading}/>

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