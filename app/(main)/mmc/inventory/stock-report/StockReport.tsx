'use client';

import ActionDialog from "@/_components/DialogBox/ActionDialog";
import TableDialog from "@/_components/DialogBox/TableDialog";
import ExpandableList from "@/_components/table/ExpandableList";
import { DataTable } from "@/_components/table/Table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/_components/ui/dialog";
import { Cell, ColumnDef } from "@tanstack/react-table";
import { View } from "lucide-react";
import { useEffect, useState } from "react";

interface VariantDetail {
    Variant: string,
    Quantity: number,
}

interface TransactionDetail {
    InventoryName: string,
    PONumber: number,
    ReceiptDate: string,
    Quantity: number,
    Supplier: string,
    WorkOrders: string[]
    Styles: string[]
}

type InventoryStockReport = {
    InventoryCode: string,
    InventoryName: string,
    Group: string,
    Balance: number,
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
        accessorKey: 'Balance',
        header: 'Stock Quantity',
        filterFn: "inNumberRange" as any,
    },
    {
        accessorKey: 'Unit',
        header: 'Unit',
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

    const totalVariantQuantity = variantDetails.reduce((acc, item) => acc + item.Quantity, 0);
    const totalTransactionQuantity = transactionDetails.reduce((acc, item) => acc + item.Quantity, 0);

    return (
        <div className="container mx-auto py-10 relative">
            {/* The main data table */}
            <DataTable 
                title= 'Raw Material Stock Report'
                columns={reportColumns}
                data={data}
                isLoading={loading}
                error={error}
                columnClickHandlers={{
                    InventoryCode: onCellClickFunction
                }}
                dropdownFilters={['Group']}
                searchFilters={['InventoryName', 'InventoryCode']}
                sliderFilters={['Balance']}
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
            <Dialog open={!!isVarTableOpen} onOpenChange={() => setIsVarTableOpen(false)}>
                <DialogContent className="sm:max-w-125">
                    <DialogHeader>
                        <DialogTitle>Variant Details</DialogTitle>
                        <DialogDescription>
                            Stock breakdown for [Inventory Name]
                        </DialogDescription>
                    </DialogHeader>
                    <div className="mt-4 overflow-y-auto overflow-x-auto rounded-lg border border-base-200 h-80">
                        <table className="table table-zebra table-pin-rows w-full">
                            <thead className="bg-base-200">
                                <tr>
                                    <th>Variant</th>
                                    <th className="text-right">Quantity</th>
                                </tr>
                            </thead>
                            <tbody>
                                {variantDetails.map((variant, index) => (
                                    <tr key={index} className="hover">
                                        <td className="font-medium text-primary">
                                            {variant.Variant}
                                        </td>
                                        <td className="text-right font-mono">
                                            {variant.Quantity.toFixed(2)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>

                            <tfoot className="bg-base-200 font-bold text-base-content">
                                <tr>
                                    <td>Total</td>
                                    <td className="text-right font-mono text-lg">
                                        {totalVariantQuantity.toFixed(2)}
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Dialog box to show transaction details */}
            <Dialog open={!!isTrTableOpen} onOpenChange={() => setIsTrTableOpen(false)}>
                <DialogContent className="sm:max-w-250">
                    <DialogHeader>
                        <DialogTitle>Transaction History</DialogTitle>
                        <DialogDescription>
                            {`Stock transaction history for ${transactionDetails[0]?.InventoryName}`}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="mt-4 overflow-y-auto overflow-x-auto rounded-lg border border-base-200 h-120">
                        <table className="table table-zebra table-pin-rows w-full">
                            <thead className="bg-base-200">
                                <tr>
                                    <th>PO Number</th>
                                    <th>Receipt Date</th>
                                    <th>WOs</th>
                                    <th>Styles</th>
                                    <th>Supplier</th>
                                    <th className="text-right">Receipt Qty</th>
                                </tr>
                            </thead>
                            <tbody>
                                {transactionDetails.map((transaction, index) => (
                                    <tr key={index} className="hover">
                                        <td className="font-medium text-primary">
                                            {transaction.PONumber}
                                        </td>
                                        <td className="font-medium text-primary">
                                            {transaction.ReceiptDate}
                                        </td>
                                        <td className="font-medium text-primary">
                                            <ExpandableList items={transaction.WorkOrders} />
                                        </td>
                                        <td className="font-medium text-primary">
                                            <ExpandableList items={transaction.Styles} />
                                        </td>
                                        <td className="font-medium text-primary">
                                            {transaction.Supplier}
                                        </td>
                                        <td className="text-right font-mono">
                                            {transaction.Quantity.toFixed(2)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot className="bg-base-200 font-bold text-base-content">
                                <tr>
                                    <td colSpan={5} className="text-right">Total</td>
                                    <td className="text-right font-mono text-lg text-primary">
                                        {totalTransactionQuantity.toFixed(2)}
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}