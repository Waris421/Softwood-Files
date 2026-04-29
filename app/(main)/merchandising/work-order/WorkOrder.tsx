'use client';

import { THEME } from "@/_components/constants/ui";
import { DataTable } from "@/_components/table/Table";
import { ColumnDef } from "@tanstack/react-table";
import { Loader2, SquarePlus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type StyleCard = {
    OrderNumber: number,
    Style: string,
    Customer: string,
    Quantity: number,
    DeliveryDate: string,
    Merchandiser: string,
}

const reportColumns: ColumnDef<StyleCard>[] = [
    {
        accessorKey: 'OrderNumber',
        header: 'Work Order',
    },
    {
        accessorKey: 'Style',
        header: 'Style',
    },
    {
        accessorKey: 'Customer',
        header: 'Customer',
    },
    {
        accessorKey: 'Quantity',
        header: 'Quantity',
    },
    {
        accessorKey: 'DeliveryDate',
        header: 'Ex-Factory',
    },
    {
        accessorKey: 'Merchandiser',
        header: 'Merchandiser',
    },
]

export default function WorkOrders(){
    const [data, setData] = useState<StyleCard[]>([]);
    const [loading, setLoading] = useState(true);
    const [redirecting, setRedirecting] = useState(false);
    const [error, setError] = useState(null);
    const [isOpen, setIsOpen] = useState(false);
    const [selectedCode, setSelectedCode] = useState<string | null>(null);
    const [selectedName, setSelectedName] = useState<string | null>(null);
    const [anchorRef, setAnchorRef] = useState<HTMLElement | null>(null);

    const router = useRouter();

    useEffect(() => {
        const fetchWorkOrders = async() => {
            try {
                setLoading(true);

                const response = await fetch('/api/merchandising/work-order');
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.details?.message || "Failed to fetch requests");
                }

                const workOrders = await response.json();

                setData(workOrders);
            } catch(err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        fetchWorkOrders();
    }, [])

    const customHeaderButtons = () => {
        return (
            <>
                <Link
                    href="/merchandising/work-order/add"
                    className={`${THEME.ButtonBasic} ${redirecting ? 'pointer-events-none opacity-50' : ''}`}
                    onClick={() => setRedirecting(true)}
                >
                    <SquarePlus size={18}  />
                    Add Order
                </Link>
            </>
        )
    }
    
    return (
        <>
            {redirecting && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/50">
                    <Loader2 className="animate-spin text-primary" size={40} />
                </div>
            )}

            <DataTable 
                columns={reportColumns}
                data={data}
                showDownload={false}
                showPrint={false}
                isLoading={loading}
                error={error}
                customActions={customHeaderButtons()}
            />
        </>
    )
}