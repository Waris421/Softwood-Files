'use client';

import { THEME } from "@/_components/constants/ui";
import { DataTable } from "@/_components/table/Table";
import { Cell, ColumnDef } from "@tanstack/react-table";
import { Loader2, SquarePlus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type Issuance = {
    id: number,
    IssuanceDate: string,
    Department: string,
    ReceivedBy: string,
    InventoryRequisition: number,
    Name: string,
    WorkOrder: string,
}

const columns: ColumnDef<Issuance>[] = [
    { accessorKey: 'id', header: 'Issuance #' },
    { accessorKey: 'IssuanceDate', header: 'Date' },
    { accessorKey: 'Department', header: 'Department' },
    { accessorKey: 'ReceivedBy', header: 'Received By' },
    { accessorKey: 'InventoryRequisition', header: 'Requisition #' },
    { accessorKey: 'Name', header: 'Inventories' },
    { accessorKey: 'WorkOrder', header: 'Work Orders' },
]

export default function Issuances() {
    const [data, setData] = useState<Issuance[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [redirecting, setRedirecting] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const fetchIssuances = async () => {
            setLoading(true);
            try {
                const response = await fetch('/api/mmc/issuance');
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.details?.message || "Failed to fetch issuances");
                }
                const issuances = await response.json();
                setData(issuances);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }
        fetchIssuances();
    }, []);

    const customHeaderButtons = () => (
        <Link
            href="/mmc/issuance/add-sample"
            className={`${THEME.ButtonBasic} ${redirecting ? 'pointer-events-none opacity-50' : ''}`}
            onClick={() => setRedirecting(true)}
        >
            <SquarePlus size={18} />
            Add Issuance
        </Link>
    )

    const onIssuanceClickAction = (cell: Cell<any, any>) => {
        setRedirecting(true);
        router.push(`/mmc/issuance/${cell.getValue()}/edit`);
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
                    columns={columns}
                    data={data}
                    isLoading={loading}
                    error={error}
                    showDownload={false}
                    showPrint={false}
                    searchFilters={['id', 'Department', 'Name', 'WorkOrder']}
                    dropdownFilters={['Department']}
                    customActions={customHeaderButtons()}
                    columnClickHandlers={{ id: onIssuanceClickAction }}
                />
            </div>
        </>
    )
}
