'use client';

import { THEME } from "@/_components/constants/ui";
import { DataTable } from "@/_components/table/Table";
import { Cell, ColumnDef } from "@tanstack/react-table";
import { Loader2, SquarePlus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AddOperationModal } from "./AddOperation";
import { EditOperationModal } from "./EditOperation";

type Operation = {
    id: number,
    Name: string,
    Section: string,
    Category: string,
    SkillLevel: number,
    MachineType: string,
    SMV: number,
    Rate: number,
    RatePerSAM?: string,
}

const reportColumns: ColumnDef<Operation>[] = [
    {
        accessorKey: 'id',
        header: 'Code',
    },
    {
        accessorKey: 'Name',
        header: 'Operation Name',
    },
    {
        accessorKey: 'Section',
        header: 'Section',
    },
    {
        accessorKey: 'Category',
        header: 'Category',
    },
    {
        accessorKey: 'SkillLevel',
        header: 'Level',
    },
    {
        accessorKey: 'MachineType',
        header: 'Machine Type',
    },
    {
        accessorKey: 'SMV',
        header: 'SAM',
    },
    {
        accessorKey: 'Rate',
        header: 'Rate',
    },
    {
        accessorKey: 'RatePerSAM',
        header: 'Rate/SAM',
    },
]

export default function Offices() {
    const [data, setData] = useState<Operation[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [redirecting, setRedirecting] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [operationToUpdate, setOperationToUpdate] = useState<number | null>(null);

    const router = useRouter();

    useEffect(() => {
        const fetchOperations = async() => {
            setLoading(true);

            try {
                const response = await fetch('/api/productivity/operation');

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.details?.message || "Failed to fetch requests");
                }

                const operations: Operation[] = await response.json();

                setData(operations);
            } catch(err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchOperations();
    }, [refreshTrigger]);

    const customHeaderButtons = () => {
        return (
            <>
                <div
                    className={`${THEME.ButtonBasic} ${redirecting ? 'pointer-events-none opacity-50' : ''}`}
                    onClick={handleOperationAddition}
                >
                    <SquarePlus size={18}  />
                    Add Operation
                </div>
            </>
        )
    }

    const onOperationClickAction = (cell: Cell<any, any>) => {
        const operationId = cell.getValue();

        setOperationToUpdate(operationId);
        setIsEditModalOpen(true);
    }

    const onRateClickAction = (cell: Cell<any, any>) => {
        console.log(cell);
    }

    const handleOperationAddition = () => {
        setIsAddModalOpen(true);
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
                    columns={reportColumns}
                    data={data}
                    isLoading={loading}
                    error={error}
                    showDownload
                    showPrint={false}
                    searchFilters={['id', 'Name']}
                    dropdownFilters={['Section', 'SkillLevel', 'MachineType']}
                    sliderFilters={['RatePerSAM']}
                    customActions={customHeaderButtons()}
                    columnClickHandlers={{
                        id: onOperationClickAction,
                        Rate: onRateClickAction,
                    }}
                />
            </div>

            <AddOperationModal 
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSuccess={() => setRefreshTrigger(prev => prev + 1)}
            />

            <EditOperationModal 
                isOpen={isEditModalOpen}
                operationId={operationToUpdate}
                onClose={() => setIsEditModalOpen(false)}
                onSuccess={() => setRefreshTrigger(prev => prev+1)}
            />
        </>
    )
}