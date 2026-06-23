'use client';

import { DataTable } from "@/_components/table/Table";
import { Cell, ColumnDef } from "@tanstack/react-table";
import { useEffect, useState } from "react";
import { ApprovalModal } from "./ApprovalDialog";

type Approval = {
    ids: number[],
    Date: string,
    EmployeeCode: number,
    EmployeeName: string,
    Description: string[],
    Approvals: (boolean | null)[],
}

const listColumns: ColumnDef<Approval>[] = [
    {
        accessorKey: 'Date',
        header: 'Date',
    },
    {
        accessorKey: 'EmployeeCode',
        header: 'Code',
    },
    {
        accessorKey: 'EmployeeName',
        header: 'Name',
    },
    {
        accessorKey: 'Description',
        header: 'Request Details',
        cell: ({ getValue }) => {
            const descriptions = getValue<(string)[]>() || [];
            const uniqueDescriptions = Array.from(
                new Set(descriptions.filter((desc): desc is string => Boolean(desc)))
            );
            return uniqueDescriptions.join(', ');
        }
    },
    {
        accessorKey: 'Approvals',
        header: 'Approval Status',
        cell: ({ getValue }) => {
            const approvals = getValue<(boolean | null)[]>() || [];

            if (approvals.includes(null)) {
                return <span>Pending</span>;
            }

            if (approvals.every(val => val === false)) {
                return <span>Rejected</span>;
            }

            if (approvals.includes(false)) {
                return <span>Partially Rejected</span>;
            }

            return <span>Approved</span>;
        }
    },
]

export default function Approvals() {
    const [data, setData] = useState<Approval[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [selectedApproval, setSelectedApproval] = useState<Approval | null>(null);

    useEffect(() => {
        const fetchData = async() => {
            setLoading(true);
            try {
                const response = await fetch('/api/hr/attendance/approval/pending');
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.details?.message || "Failed to fetch data");
                }

                const apiData: Approval[] = await response.json();
                setData(apiData);
            } catch (err: any) {
                setError(err.message || "An error occurred");
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, [refreshTrigger]);

    const onStatusClick = (cell: Cell<any, (boolean | null)[]>) => {
        const rowData = cell.row.original as Approval;
        const approvalStatuses = cell.getValue();

        if (!approvalStatuses.includes(null)) {
            return; 
        }
        
        const ids = rowData.ids;

        setSelectedApproval(rowData);
    }

    return (
        <>
            <div className="container mx-auto relative">
                <DataTable
                    columns={listColumns}
                    data={data}
                    isLoading={loading}
                    error={error}
                    showPrint={false}
                    showDownload={false}
                    searchFilters={['EmployeeCode', 'Description']}
                    dropdownFilters={['EmployeeName']}
                    columnClickHandlers={{
                        Approvals: onStatusClick
                    }}
                />
            </div>

            {selectedApproval && (
                <ApprovalModal 
                    adjustmentIds={selectedApproval.ids}
                    employeeName={selectedApproval.EmployeeName}
                    approvalDate={selectedApproval.Date}
                    onClose={() => setSelectedApproval(null)}
                    onSuccess={() => setRefreshTrigger(prev => prev + 1)}
                />
            )}
        </>
    )
}