'use client';

import { THEME } from "@/_components/constants/ui";
import CheckDisplay from "@/_components/table/Check";
import ExpandableList from "@/_components/table/ExpandableList";
import { DataTable } from "@/_components/table/Table";
import { Cell, ColumnDef } from "@tanstack/react-table";
import { AlertCircle, CheckCircle2, Loader2, SquarePlus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type InventoryReceipt = {
    id: number,
    POId: number,
    ReceiptDate: string,
    Supplier: string,
    InventoryCodes: string[],
    InventoryNames: string[],
    WorkOrders: number[],
    StyleCodes: string[],
    InvoicePending: boolean,
}

const reportColumns: ColumnDef<InventoryReceipt>[] = [
    {
        accessorKey: 'id',
        header: 'Receipt Number',
    },
    {
        accessorKey: 'POId',
        header: 'PO Number',
    },
    {
        accessorKey: 'ReceiptDate',
        header: 'Date',
    },
    {
        accessorKey: 'Supplier',
        header: 'Supplier',
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
            return <ExpandableList items={items} maxLength={1} />;
        }
    },
    {
        accessorKey: 'WorkOrders',
        header: 'Work Orders',
        cell: ({ row }) => {
            const items = row.original.WorkOrders?.map(String) || [];
            return <ExpandableList items={items} />;
        }
    },
    {
        accessorKey: 'InvoicePending',
        header: 'Invoice Status',
        cell: (({getValue}) => {
            const isPending = getValue<boolean>();
            
            return <CheckDisplay check={isPending}/>
        })
    },
]

export default function InventoryReceipts(){
    const [data, setData] = useState<InventoryReceipt[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [redirecting, setRedirecting] = useState(false);

    const router = useRouter();

    useEffect(() => {
        const fetchInventoryReceipts = async() => {
            setLoading(true);

            try {
                const response = await fetch('/api/mmc/inventory-receipt');

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.details?.message || "Failed to fetch requests");
                }

                const inventoryReceipts = await response.json();

                setData(inventoryReceipts);
            } catch(err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        fetchInventoryReceipts();
    }, []);

    const customHeaderButtons = () => {
        return (
            <>
                <Link
                    href="/mmc/inventory-receipt/add"
                    className={`${THEME.ButtonBasic} ${redirecting ? 'pointer-events-none opacity-50' : ''}`}
                    onClick={() => setRedirecting(true)}
                >
                    <SquarePlus size={18}  />
                    Add Receipt
                </Link>
            </>
        )
    }

    const onReceiptClickAction = (cell: Cell<any, any>) => {
        setRedirecting(true);
        const receiptId = cell.getValue();

        router.push(`/mmc/inventory-receipt/${receiptId}/edit`);
    }

    const onPOClickAction = (cell: Cell<any, any>) => {
        setRedirecting(true);
        const poId = cell.getValue();

        router.push(`/mmc/inventory-order/${poId}/edit`);
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
                    columns = {reportColumns}
                    data = {data}
                    isLoading={loading}
                    error={error}
                    showDownload={false}
                    showPrint={false}
                    searchFilters={['id', 'POId', 'InventoryNames', 'WorkOrders']}
                    dropdownFilters={['Supplier']}
                    toggleFilters={['InvoicePending']}
                    customActions={customHeaderButtons()}
                    columnClickHandlers={{
                        id: onReceiptClickAction,
                        POId: onPOClickAction,
                    }}
                />
            </div>
        </>
    )
}