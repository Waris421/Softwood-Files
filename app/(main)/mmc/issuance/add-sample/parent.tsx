'use client';

import { DropdownOption } from "@/_components/Dropdown/types";
import { useState } from "react";
import Filters from "./Filters";
import Table from "./Table";

export default function Parent() {
    const [majorFilters, setMajorFilters] = useState<any>({});
    const [minorFilters, setMinorFilters] = useState<any>({});
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [rawData, setRawData] = useState<any[]>([]);          //Data from the server
    const [tableData, setTableData] = useState<any[]>([]);      //Data that the user see
    const [isLoading, setIsLoading] = useState(false);
    const [messageConfig, setMessageConfig] = useState<{ show: boolean; subject: string; message: string; action?: () => void; } | null>(null);
    const [inventoryFilterOptions, setInventoryFilterOptions] = useState<DropdownOption[]>([]);

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
        
    return (
        <>
            <Filters
                onFilterSubmit={handleFilterSubmit}
                isLoading={isLoading}
                options={{ invFilterOptions: inventoryFilterOptions}}
            />
            <Table initialData={tableData} isLoading={isLoading}/>
        </>
    )
}