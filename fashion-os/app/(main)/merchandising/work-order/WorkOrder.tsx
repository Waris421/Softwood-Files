'use client';

import { THEME } from "@/_components/constants/ui";
import ActionDialog from "@/_components/DialogBox/ActionDialog";
import { DataTable } from "@/_components/table/Table";
import { Cell, ColumnDef } from "@tanstack/react-table";
import { Copy, Loader2, Pencil, SquarePlus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type WorkOrder = {
    OrderNumber: number,
    StyleCode: string,
    Customer: string,
    Quantity: number,
    DeliveryDate: string,
    Merchandiser: string,
}

const reportColumns: ColumnDef<WorkOrder>[] = [
    {
        accessorKey: 'OrderNumber',
        header: 'Work Order',
    },
    {
        accessorKey: 'StyleCode',
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
    const router = useRouter();
    const [data, setData] = useState<WorkOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const [redirecting, setRedirecting] = useState(false);
    const [error, setError] = useState(null);
    const [isOpen, setIsOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<number | null>(null);
    const [selectedStyle, setSelectedStyle] = useState<string | null>(null);
    const [anchorRef, setAnchorRef] = useState<HTMLElement | null>(null);

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

                setData(Array.isArray(workOrders) ? workOrders : (workOrders.results ?? []));
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

    const onOrderClickFunction = (cell: Cell<any, any>, e?: React.MouseEvent) => {
        const order = cell.getValue();
        const style = cell.row.original.StyleCode;

        setSelectedOrder(order);
        setSelectedStyle(style);

        if (e) {
            setAnchorRef(e.currentTarget as HTMLElement);
            (e.currentTarget as HTMLElement).blur();
        };
        setIsOpen(true);
    }

    const dialogBoxActions = [
        { label: 'Edit', icon: <Pencil size={16}/>, onClick: () => router.push(`/merchandising/work-order/${selectedOrder}/edit`) },
        { label: 'Copy', icon: <Copy size={16}/>, onClick: () => router.push(`/merchandising/work-order/${selectedOrder}/copy`) },
        { label: 'Delete', icon: <Trash2 size={16}/>, onClick: () => router.push(`/merchandising/work-order/${selectedOrder}/delete`) },

    ]
    
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
                searchFilters={['OrderNumber', 'StyleCode']}
                dropdownFilters={['Customer', 'Merchandiser']}
                columnClickHandlers={{
                    OrderNumber: onOrderClickFunction
                }}
            />

            {/* Dialogue box upon clicking an inventory */}
            {isOpen && (
                <ActionDialog 
                    isOpen={isOpen}
                    title="Choose an action"
                    description={`select an option for ${selectedStyle}`}
                    actions={dialogBoxActions}
                    onClose={() => setIsOpen(false)}
                    anchorRef={anchorRef ? { current: anchorRef } : undefined}
                />
            )}
        </>
    )
}