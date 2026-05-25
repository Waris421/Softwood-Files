'use client';

import { THEME } from "@/_components/constants/ui";
import ActionDialog from "@/_components/DialogBox/ActionDialog";
import { DataTable } from "@/_components/table/Table";
import { Cell, ColumnDef } from "@tanstack/react-table";
import { Copy, Loader2, Pencil, SquarePlus, Trash2, View } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type InventoryCard = {
    Code: string,
    Name: string,
    Group: string,
    Unit: string,
    InUse: boolean,
}

const reportColumns: ColumnDef<InventoryCard>[] = [
    {
        accessorKey: 'Code',
        header: 'Code',
    },
    {
        accessorKey: 'Name',
        header: 'Name',
    },
    {
        accessorKey: 'Group',
        header: 'Group',
    },
    {
        accessorKey: 'Unit',
        header: 'Unit',
    },
    {
        accessorKey: 'InUse',
        header: 'In Use',
    },
]

export default function InventoryCards() {
    const [data, setData] = useState<InventoryCard[]>([]);
    const [loading, setLoading] = useState(true);
    const [redirecting, setRedirecting] = useState(false);
    const [error, setError] = useState(null);
    const [isOpen, setIsOpen] = useState(false);
    const [selectedCode, setSelectedCode] = useState<string | null>(null);
    const [selectedName, setSelectedName] = useState<string | null>(null);
    const [anchorRef, setAnchorRef] = useState<HTMLElement | null>(null);
    const router = useRouter();

    useEffect(() => {
        const fetchInventoryCards = async() => {
            try {
                setLoading(true);

                const response = await fetch('/api/mmc/inventory');
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.details?.message || "Failed to fetch requests");
                }

                const inventoryCards = await response.json();

                setData(inventoryCards);
            } catch(err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        fetchInventoryCards();
    }, []);

    const customHeaderButtons = () => {
        return (
            <>
                <Link
                    href="/mmc/inventory/add"
                    className={`${THEME.ButtonBasic} ${redirecting ? 'pointer-events-none opacity-50' : ''}`}
                    onClick={() => setRedirecting(true)}
                >
                    <SquarePlus size={18}  />
                    Add Card
                </Link>
            </>
        )
    }

    const onCodeClickFunction = (cell: Cell<any, any>, e?: React.MouseEvent) => {
        const invCode = cell.getValue();
        const invName = cell.row.original.Name;
        setSelectedCode(invCode);
        setSelectedName(invName);
        
        if (e) setAnchorRef(e.currentTarget as HTMLElement);

        setIsOpen(true);
    }

    const dialogBoxActions = [
        { label: 'Edit', icon: <Pencil size={16}/>, onClick: () => {editButtonClick()} },
        { label: 'Copy', icon: <Copy size={16}/>, onClick: () => {copyButtonClick()} },
        { label: 'Delete', icon: <Trash2 size={16}/>, onClick: () => {deleteButtonClick()} },
    ]

    const editButtonClick = () => {
        setRedirecting(true);
        router.push(`/mmc/inventory/${selectedCode}/edit`);
    }

    const copyButtonClick = () => {
        setRedirecting(true);
        router.push(`/mmc/inventory/${selectedCode}/copy`);
    }

    const deleteButtonClick = () => {
        setRedirecting(true);
        router.push(`/mmc/inventory/${selectedCode}/delete`);
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
                    title="Inventory Cards"
                    columns={reportColumns}
                    data={data}
                    isLoading={loading}
                    error={error}
                    dropdownFilters={['Group']}
                    searchFilters={['Name', 'Code']}
                    toggleFilters={['InUse']}
                    customActions={customHeaderButtons()}
                    showDownload={false}
                    showPrint={false}
                    columnClickHandlers={{
                        Code: onCodeClickFunction
                    }}
                />
            </div>

            {/* Dialogue box upon clicking an inventory */}
            {isOpen && (
                <ActionDialog 
                    isOpen={isOpen}
                    title="Choose an action"
                    description={`select an option for ${selectedName}`}
                    actions={dialogBoxActions}
                    onClose={() => setIsOpen(false)}
                    anchorRef={anchorRef ? { current: anchorRef } : undefined}
                />
            )}
        </>
    )
}