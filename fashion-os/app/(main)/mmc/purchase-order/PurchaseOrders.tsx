'use client';

import { THEME } from "@/_components/constants/ui";
import ActionDialog from "@/_components/DialogBox/ActionDialog";
import { DataTable } from "@/_components/table/Table";
import { ColumnDef, Cell } from "@tanstack/react-table";
import { Copy, Pencil, SquarePlus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type PurchaseOrder = {
    PONumber:     number;
    DeliveryDate: string;
    Supplier:     string;
    Name:         string;
    WorkOrder:    string;
}

const columns: ColumnDef<PurchaseOrder>[] = [
    { accessorKey: 'PONumber',     header: 'PO Number' },
    { accessorKey: 'DeliveryDate', header: 'Delivery Date' },
    { accessorKey: 'Supplier',     header: 'Supplier' },
    { accessorKey: 'Name',         header: 'Inventory Items' },
    { accessorKey: 'WorkOrder',    header: 'Work Orders' },
]

export default function PurchaseOrders() {
    const router = useRouter();
    const [data, setData] = useState<PurchaseOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isOpen, setIsOpen] = useState(false);
    const [selectedPO, setSelectedPO] = useState<PurchaseOrder | null>(null);
    const [anchorRef, setAnchorRef] = useState<HTMLElement | null>(null);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                setLoading(true);
                const res = await fetch('/api/mmc/purchase-order');
                if (!res.ok) {
                    const err = await res.json();
                    throw new Error(err.message || 'Failed to load purchase orders');
                }
                const json = await res.json();
                setData(Array.isArray(json.orders) ? json.orders : []);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, []);

    const onPOClick = (cell: Cell<PurchaseOrder, any>, e?: React.MouseEvent) => {
        setSelectedPO(cell.row.original);
        if (e) setAnchorRef(e.currentTarget as HTMLElement);
        setIsOpen(true);
    };

    const dialogActions = [
        { label: 'Edit',   icon: <Pencil size={16}/>, onClick: () => router.push(`/mmc/purchase-order/${selectedPO?.PONumber}/edit`)   },
        { label: 'Copy',   icon: <Copy   size={16}/>, onClick: () => router.push(`/mmc/purchase-order/${selectedPO?.PONumber}/copy`)   },
        { label: 'Delete', icon: <Trash2 size={16}/>, onClick: () => router.push(`/mmc/purchase-order/${selectedPO?.PONumber}/delete`) },
    ];

    const addButton = () => (
        <Link href="/mmc/purchase-order/add" className={THEME.ButtonBasic}>
            <SquarePlus size={18} />
            Add PO
        </Link>
    );

    return (
        <>
            <DataTable
                columns={columns}
                data={data}
                isLoading={loading}
                error={error}
                dropdownFilters={['Supplier']}
                searchFilters={['PONumber', 'Name']}
                showDownload={false}
                showPrint={false}
                customActions={addButton()}
                columnClickHandlers={{ PONumber: onPOClick }}
            />

            {isOpen && selectedPO && (
                <ActionDialog
                    isOpen={isOpen}
                    onClose={() => setIsOpen(false)}
                    title={`PO #${selectedPO.PONumber}`}
                    description={`${selectedPO.Supplier} — ${selectedPO.DeliveryDate}`}
                    actions={dialogActions}
                    anchorRef={anchorRef ? { current: anchorRef } : undefined}
                />
            )}
        </>
    );
}
