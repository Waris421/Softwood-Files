'use client';

import { THEME } from "@/_components/constants/ui";
import ActionDialog from "@/_components/DialogBox/ActionDialog";
import { DataTable } from "@/_components/table/Table";
import { Cell, ColumnDef } from "@tanstack/react-table";
import { Copy, Loader2, Pencil, SquarePlus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type StyleCard = {
    Code: string,
    Name: string,
    Category: string,
    Customer: string,
    Fabric: string,
    Route: string
}

const reportColumns: ColumnDef<StyleCard>[] = [
    {
        accessorKey: 'Code',
        header: 'Code',
    },
    {
        accessorKey: 'Name',
        header: 'Name',
    },
    {
        accessorKey: 'Category',
        header: 'Category',
    },
    {
        accessorKey: 'Customer',
        header: 'Customer',
    },
    {
        accessorKey: 'Fabric',
        header: 'Fabric',
    },
    {
        accessorKey: 'Route',
        header: 'Production Route',
    },
]

export default function StyleCards() {
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
        const fetchStyleCards = async() => {
            try {
                setLoading(true);

                const response = await fetch('/api/merchandising/style');
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.details?.message || "Failed to fetch requests");
                }

                const styleCards = await response.json();

                setData(styleCards);
            } catch(err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        fetchStyleCards();
    }, []);

    const customHeaderButtons = () => {
        return (
            <>
                <Link
                    href="/merchandising/style/add"
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
        const styleCode = cell.getValue();
        const customer = cell.row.original.Customer;
        setSelectedCode(styleCode);
        setSelectedName(customer);

        if (e) setAnchorRef(e.currentTarget as HTMLElement);
        setIsOpen(true);
    }

    const dialogBoxActions = [
        { label: 'Edit',   icon: <Pencil size={16}/>, onClick: () => router.push(`/merchandising/style/${selectedCode}/edit`)   },
        { label: 'Copy',   icon: <Copy   size={16}/>, onClick: () => router.push(`/merchandising/style/${selectedCode}/copy`)   },
        { label: 'Delete', icon: <Trash2 size={16}/>, onClick: () => router.push(`/merchandising/style/${selectedCode}/delete`) },
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
                isLoading={loading}
                error={error}
                dropdownFilters={['Customer', 'Fabric',  'Category', 'Route']}
                searchFilters={['Code', 'Name']}
                showDownload={false}
                showPrint={false}
                customActions={customHeaderButtons()}
                columnClickHandlers={{
                    Code: onCodeClickFunction
                }}
            />

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