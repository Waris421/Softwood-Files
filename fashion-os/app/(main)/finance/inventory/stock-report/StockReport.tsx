'use client';

import ActionDialog from "@/_components/DialogBox/ActionDialog";
import TableDialog from "@/_components/DialogBox/TableDialog";
import { DataTable } from "@/_components/table/Table";
import { Cell, ColumnDef } from "@tanstack/react-table";
import { View } from "lucide-react";
import { useEffect, useState } from "react";

interface VariantDetail {
    Variant: string,
    Quantity: number,
}

interface TransactionDetail {
    InvoiceNumber: string,
    PONumber: number,
    Supplier: string,
}

type InventoryStockReport = {
    InventoryCode: string,
    InventoryName: string,
    Group: string,
    Quantity: number,
    Unit: string,
    Value: string,
    VariantDetails: VariantDetail[];
    TransactionDetails: TransactionDetail[];
}

const reportColumns: ColumnDef<InventoryStockReport>[] = [
    {
        accessorKey: 'InventoryCode',
        header: 'Code',
    },
    {
        accessorKey: 'InventoryName',
        header: 'Name',
    },
    {
        accessorKey: 'Group',
        header: 'Group',
    },
    {
        accessorKey: 'Quantity',
        header: 'Stock Quantity',
        filterFn: "inNumberRange" as any,
    },
    {
        accessorKey: 'Unit',
        header: 'Unit',
    },
    {
        accessorKey: 'Value',
        header: 'Approx Value',
    },
]

export default function StockReport () {
    const [data, setData] = useState<InventoryStockReport[]>([]);
    const [anchorRef, setAnchorRef] = useState<HTMLElement | null>(null);
    const [variantDetails, setVariantDetails] = useState<VariantDetail[]>([]);
    const [transactionDetails, setTransactionDetails] = useState<TransactionDetail[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [isVarTableOpen, setIsVarTableOpen] = useState(false);
    const [isTrTableOpen, setIsTrTableOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchStockReport = async () => {
            try {
                setLoading(true);

                const response = await fetch('/api/finance/inventory/stock-status');
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.details?.message || "Failed to fetch requests");
                }
                const stockStatus = await response.json();

                setData(stockStatus);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }
        fetchStockReport();
    }, []);

    const onCellClickFunction = (cell: Cell<any, any>, e?: React.MouseEvent) => {
        const rowData = cell.row.original;
        const varDetails = rowData.VariantDetails;
        setVariantDetails(varDetails);
        
        const trDetails = rowData.TransactionDetails;
        setTransactionDetails(trDetails);

        if (e) setAnchorRef(e.currentTarget as HTMLElement);

        setIsOpen(true);
    }

    const dialogBoxActions = [
        { label: 'Transactions', icon: <View size={16}/>, onClick: () => {setIsTrTableOpen(true)} },
        { label: 'Details', icon: <View size={16}/>, onClick: () => {setIsVarTableOpen(true)} },
    ]

    return (
        <div className="container mx-auto py-10 relative">
            {/* The main data table */}
            <DataTable 
                columns={reportColumns}
                data={data}
                isLoading={loading}
                error={error}
                clickableColumnId='InventoryCode'
                onCellClick={onCellClickFunction}
                dropdownFilters={['Group']}
                searchFilters={['InventoryName']}
                sliderFilters={['Quantity', 'Value']}
            />

            {/* Dialogue box upon clicking an inventory */}
            {isOpen && (
                <ActionDialog
                    isOpen={isOpen}
                    actions={dialogBoxActions}
                    onClose={() => setIsOpen(false)}
                    anchorRef={anchorRef ? { current: anchorRef } : undefined}
                />
            )}

            {/* Dialog box to show variant details */}
            {isVarTableOpen && (
                <TableDialog
                    isOpen={isVarTableOpen}
                    onClose={() => setIsVarTableOpen(false)}
                    data={variantDetails}
                    title="Variant Details"
                    anchorRef={anchorRef ? { current: anchorRef } : undefined}
                />
            )}

            {/* Dialog box to show transaction details */}
            {isTrTableOpen && (
                <TableDialog 
                    isOpen={isTrTableOpen}
                    onClose={() => setIsTrTableOpen(false)}
                    data={transactionDetails}
                    anchorRef={anchorRef ? {current: anchorRef} : undefined}
                    maxWidth={500}
                />
            )}
        </div>
    )
}