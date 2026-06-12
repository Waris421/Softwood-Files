'use client';

import { THEME } from "@/_components/constants/ui";
import { DataTable } from "@/_components/table/Table";
import { Cell, ColumnDef } from "@tanstack/react-table";
import { Loader2, SquarePlus } from "lucide-react";
import { useEffect, useState } from "react";
import { AddMachineModal } from "./AddMachine";
import MessageBox from "@/_components/generic/MessageBox";
import { EditMachineModal } from "./EditMachine";
import { ChangeStatusModal } from "./ChangeStatus";
import { ChangeDepartmentModal } from "./ChangeDepartment";

type Machine = [
    id: number,
    MachineId: string,
    Type: string,
    FunctionStatus: string,
    Manufacturer: string,
    ModelNumber: string,
    SerialNumber: string,
    Department: string,
]

const reportColumns: ColumnDef<Machine>[] = [
    {
        accessorKey: 'id',
        header: 'Number',
    },
    {
        accessorKey: 'MachineId',
        header: 'Id',
    },
    {
        accessorKey: 'Type',
        header: 'Machine Type',
    },
    {
        accessorKey: 'FunctionStatus',
        header: 'Working?',
    },
    {
        accessorKey: 'Manufacturer',
        header: 'Manufacturer',
    },
    {
        accessorKey: 'ModelNumber',
        header: 'Model',
    },
    {
        accessorKey: 'SerialNumber',
        header: 'Serial #'
    },
    {
        accessorKey: 'Department',
        header: 'Department',
    },
]

export default function Machines() {
    const [data, setData] = useState<Machine[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [messageConfig, setMessageConfig] = useState<{ show: boolean; subject: string; message: string; action?: () => void; } | null>(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [clickedMachineId, setClickedMachineId] = useState<number | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isFunctionModalOpen, setIsFunctionModalOpen] = useState(false);
    const [isDepartmentModalOpen, setIsDepartmentModalOpen] = useState(false);
    
    useEffect(() => {
        const fetchMachines = async() => {
            setLoading(true);

            try {
                const response = await fetch('/api/productivity/machine');

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.details?.message || "Failed to fetch requests");
                }

                const machines: Machine[] = await response.json();

                setData(machines);
            } catch(err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchMachines();
    }, [refreshTrigger]);

    const customHeaderButtons = () => {
        return (
            <>
                <div
                    className={THEME.ButtonBasic}
                    onClick={handleMachineAddition}
                >
                    <SquarePlus size={18}  />
                    Add Machine
                </div>
            </>
        )
    }

    const handleMachineAddition = () => {
        setIsAddModalOpen(true);
    }

    const onMachineClickAction = (cell: Cell<any, any>) => {
        const machineId = cell.row.original.id;

        setClickedMachineId(machineId);
        setIsEditModalOpen(true);
    }

    const onStatusClickAction = (cell: Cell<any, any>, e?: React.MouseEvent) => {
        const machineId = cell.row.original.id;
        
        setClickedMachineId(machineId);

        setIsFunctionModalOpen(true);
    }

    const onDepartmentClickAction = (cell: Cell<any, any>, e?: React.MouseEvent) => {
        const machineId = cell.row.original.id;
        setClickedMachineId(machineId);

        setIsDepartmentModalOpen(true);
    }

    return (
        <>
            <div className="container mx-auto py-10 relative">
                <DataTable 
                    columns={reportColumns}
                    data={data}
                    isLoading={loading}
                    error={error}
                    showDownload={false}
                    showPrint
                    searchFilters={['id', 'ModelNumber']}
                    dropdownFilters={['Type', 'FunctionStatus', 'Manufacturer', 'Department']}
                    customActions={customHeaderButtons()}
                    columnClickHandlers={{
                        id: onMachineClickAction,
                        FunctionStatus: onStatusClickAction,
                        Department: onDepartmentClickAction
                    }}
                />
            </div>

            {isAddModalOpen && (
                <AddMachineModal 
                    onClose={() => setIsAddModalOpen(false)}
                    onSuccess={(id: number) => {
                        setIsAddModalOpen(false);
                        setMessageConfig({
                            show: true,
                            subject: "Success",
                            message: `Machine with ID ${id} has been added successfully.`,
                            action: () => {
                                setRefreshTrigger(prev => prev + 1);
                            }
                        });
                    }}
                />
            )}

            {isEditModalOpen && (
                <EditMachineModal 
                    machineId={clickedMachineId}
                    onClose={() => setIsEditModalOpen(false)}
                    onSuccess={() => setRefreshTrigger(prev => prev+1)}
                />
            )}

            {isFunctionModalOpen && (
                <ChangeStatusModal 
                    machineId={clickedMachineId}
                    onClose={() => setIsFunctionModalOpen(false)}
                    onSuccess={() => setRefreshTrigger(prev => prev+1)}
                />
            )}

            {isDepartmentModalOpen && (
                <ChangeDepartmentModal
                    machineId={clickedMachineId}
                    onClose={() => setIsDepartmentModalOpen(false)}
                    onSuccess={() => setRefreshTrigger(prev => prev+1)}
                />
            )}

            {messageConfig?.show && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <MessageBox 
                        subject={messageConfig.subject}
                        message={messageConfig.message}
                        confirmText="Close"
                        onConfirm={() => {
                            if (messageConfig.action) messageConfig.action();
                            setMessageConfig(null);
                        }}  
                    />
                </div>
            )}
        </>
    )
}