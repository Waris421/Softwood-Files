'use client';

import ExpandableList from "@/_components/table/ExpandableList";
import { DataTable } from "@/_components/table/Table";
import { ColumnDef } from "@tanstack/react-table";
import { useEffect, useState } from "react";

type Issuance = {
    id: number,
    IssuanceDate: string,
    Department: string,
    IssuedTo: string,
    InventoryCodes: string[],
    InventoryNames: string[],
    WorkOrders: number[],
    StyleCodes: string[],
}

const reportColumns: ColumnDef<Issuance>[] = [
    {
        accessorKey: 'id',
        header: 'Issuance Number',
    },
    {
        accessorKey: 'IssuanceDate',
        header: 'Date',
    },
    {
        accessorKey: 'Department',
        header: 'Department',
    },
    {
        accessorKey: 'IssuedTo',
        header: 'Issued To',
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
        accessorKey: 'WorkOrders',
        header: 'Work Orders',
        cell: ({row}) => {
            const items = row.original.WorkOrders?.map(String) || [];
            return <ExpandableList items={items} />;
        }
    },
    {
        accessorKey: 'StyleCodes',
        header: 'Styles',
        cell: ({row}) => {
            const items = row.original.StyleCodes || [];
            return <ExpandableList items={items} />;
        }
    },
]

export default function Issuances() {
    const [data, setData] = useState<Issuance[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchIssuances = async() => {
            setLoading(true);

            try {
                const response = await fetch('/api/mmc/issuance');

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.details?.message || "Failed to fetch requests");
                }

                const issuances = await response.json();

                setData(issuances);
            } catch(err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchIssuances();
    }, []);

    return (
        <div className="container mx-auto py-10 relative">
            <DataTable 
                columns = {reportColumns}
                data={data}
                isLoading={loading}
                error={error}
                showDownload={false}
                showPrint={false}
                searchFilters={['id',  'InventoryCodes', 'InventoryNames', 'WorkOrders', 'IssuedTo']}
                dropdownFilters={['Department']}
            />
        </div>
    )
}