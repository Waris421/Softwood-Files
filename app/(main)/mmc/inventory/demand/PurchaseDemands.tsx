'use client';

import ExpandableList from "@/_components/table/ExpandableList";
import { DataTable } from "@/_components/table/Table";
import { Cell, ColumnDef } from "@tanstack/react-table";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

type PurchaseDemand = {
    id: number,
    POId: number,
    DemaddDate: string,
    DemandBy: string,
    InventoryCodes: string[],
    InventoryNames: string[],
    Status: string
}

const reportColumns: ColumnDef<PurchaseDemand>[] = [
    {
        accessorKey: 'id',
        header: 'Demand Number',
    },
    {
        accessorKey: 'Date',
        header: 'Demand Date',
    },
    {
        accessorKey: 'DemandBy',
        header: 'Request By',
    },
    {
        accessorKey: 'InventoryCodes',
        header: 'Codes',
        cell: ({row}) => {
            const items = row.original.InventoryCodes || [];
            return <ExpandableList items={items} />;
        }
    },
    {
        accessorKey: 'InventoryNames',
        header: 'Names',
        cell: ({row}) => {
            const items = row.original.InventoryNames || [];
            return <ExpandableList items={items} />;
        }
    },
    {
        accessorKey: 'Status',
        header: 'Status'
    },
    {
        accessorKey: 'POId',
        header: 'PO Number',
    },
]

export default function PurchaseDemands() {
    const [data, setData] = useState<PurchaseDemand[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [redirecting, setRedirecting] = useState(false);          //This disables any interaction with the page
    const [refreshTrigger, setRefreshTrigger] = useState(0);        //This helps reload the table without reloading the page.
    const [selectedDemand, setSelectedDemand] = useState<number | null>(null);
    const [anchorRef, setAnchorRef] = useState<HTMLElement | null>(null);
    const [isOpen, setIsOpen] = useState(false);

    //Fetch data from api
    useEffect(() => {
        const fetchPurchaseDemands = async() => {
            setLoading(true);

            try {
                const response = await fetch('/api/mmc/inventory/demand');

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.details?.message || "Failed to fetch requests");
                }

                const purchaseDemands = await response.json();

                setData(purchaseDemands);
            } catch(err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        
        fetchPurchaseDemands();
    }, [refreshTrigger]);

    const onPDClickFunction = (cell: Cell<any, any>, e?: React.MouseEvent) => {
        
    }
    
    return (
        <>
            {redirecting && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/50">
                    <Loader2 className="animate-spin text-primary" size={40} />
                </div>
            )}

            <div className="container mx-auto py-10 relative">
                <DataTable 
                    columns={reportColumns}
                    data={data}
                    isLoading={loading}
                    error={error}
                    showDownload={false}
                    showPrint={false}
                    searchFilters={['id', 'POId', 'InventoryNames', 'InventoryCodes', 'DemandBy']}
                    dropdownFilters={['Status']}
                />
            </div>
        </>
    )
}