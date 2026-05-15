'use client';

import { useCallback, useEffect, useState } from "react";
import Filters from "./Filters";
import Table from "./Table";
import { DropdownOption } from "@/_components/Dropdown/types";
import MessageBox from "@/_components/generic/MessageBox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/_components/ui/dialog";
import { SingleDropdownAsync } from "@/_components/Dropdown/Dropdown";
import { THEME } from "@/_components/constants/ui";
import { cn } from "@/_components/generic/utils";

//The Threadhold above which no data would be shown user. Optimise as per user experience
const ROW_THRESHOLD = 100;

const API_URL = "/api/merchandising/pending-orders"
const SUPPLIER_OPTIONS_URL = '/api/options/suppliers'

export default function Parent() {
    const [formData, setFormData] = useState<any>({ Inventories: [], Supplier: '' });
    const [showSupplierSelection, setShowSupplierSelection] = useState(false);
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
                
                const apiURL = `${API_URL}?${searchParams.toString()}`;

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

    const handlePreSubmit = () => {
        if (formData.Inventories.length === 0) {
            setMessageConfig({
                show: true,
                subject: "Missing Information",
                message: "At least one inventory is required.",
            });
            return;
        }

        formData.Supplier = '';
        setShowSupplierSelection(true);
    }

    const handleFinalSubmit = async () => {
        const isSupplierEmpty = !formData.Supplier?.trim();

        if (isSupplierEmpty) {
            setMessageConfig({
                show: true,
                subject: "Missing Information",
                message: 'Please select a supplier',
            });

            return ;
        }

        setShowSupplierSelection(false);
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
            const poNumber = resData.poNumber;

            setMessageConfig({
                show: true,
                subject: 'Success',
                message: `Saved Successfully. PO Number: ${poNumber}`,
                action: () => {
                    setFormData({ Inventories: [], Supplier: '' });
                    setRefreshTrigger(prev => prev + 1);     
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
                onTableSubmit={handlePreSubmit}
                isLoading={isLoading}
                options={{ invFilterOptions: inventoryFilterOptions, typeFilterOptions: typeFilterOptions }}
            />

            <Table
                initialData={tableData}
                isLoading={isLoading}
                onDataChange={handleTableDataChange}
            />

            <Dialog open={showSupplierSelection} onOpenChange={setShowSupplierSelection}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Select Supplier</DialogTitle>
                        <DialogDescription>
                            Please choose a supplier for the {formData.Inventories.length} selected items.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-4">
                        <label className="label">
                            <span className="label-text font-bold">Supplier Name</span>
                        </label>

                        <SingleDropdownAsync 
                            inputName="Supplier"
                            placeholder="click to search"
                            apiUrl={SUPPLIER_OPTIONS_URL}
                            widthClass="w-full"
                            onSelect={(val: any) => setFormData({...formData, Supplier: val?.value})} 
                        />
                    </div>

                    <DialogFooter>
                        <button
                            className={THEME.ButtonOutLine}
                            onClick={() => setShowSupplierSelection(false)}
                        >
                            Cancel
                        </button>

                        <button
                            className={formData.Supplier ? `${THEME.ButtonBasic}` : `${THEME.ButtonOutLine}`}
                            onClick={handleFinalSubmit}
                            disabled={!formData.Supplier}
                        >
                            Confirm & Submit
                        </button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

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