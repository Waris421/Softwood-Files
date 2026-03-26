'use client';

import { DataTable } from "@/_components/table/Table";
import { Cell, ColumnDef } from "@tanstack/react-table";
import { useEffect, useState } from "react";
import { UserPlus, Files, Clock3, Building2, CalendarX, Plane } from "lucide-react";
import { THEME } from "@/_components/constants/ui";
import { useRouter } from "next/navigation";
import Link from "next/link";

type WorkerList = {
    Code: number,
    Name: string,
    Department: string,
    Manager: string,
    Age: number,
    JobDuration: number,
    Status: string,
    Gender: string,
}

const listColumns: ColumnDef<WorkerList>[] = [
    {accessorKey: 'id', header: 'Code'},
    {accessorKey: 'WorkerName', header: 'Name'},
    {accessorKey: 'Department', header: 'Department'},
    {accessorKey: 'Manager', header: 'Manager'},
    {accessorKey: 'Age', header: 'Age'},
    {accessorKey: 'JobDuration', header: 'Job Duration'},
    {accessorKey: 'Status', header: 'Working Status'},
    {accessorKey: 'Gender', header: 'Gender'},
]

export default function WorkerList() {    
    const [data, setData] = useState<WorkerList[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const router = useRouter()

    useEffect(() => {
        const controller = new AbortController();
        const signal = controller.signal;

        const fetchWorkers = async () => {
            try {
                setLoading(true);

                const response = await fetch('/api/hr/workers', { signal });
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.details?.message || "Failed to fetch workers");
                }

                const workers = await response.json();

                setData(workers)
            } catch (err: any) {
                if (err.name === 'AbortError') return;
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        fetchWorkers();

        return () => controller.abort();
    }, []);
    
    const onCellClickFunction = (cell: Cell<any, any>, e?: React.MouseEvent) => {
        const id = cell.getValue();
        
        router.push(`/hr/worker/${id}/update`);
    }

    return (
        <div className="container mx-auto py-10 relative">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold">Employees</h1>
                    <p className="text-sm text-base-content/70">Manage employees related data</p>
                </div>

                <div className="flex flex-wrap gap-2">
                    <Link href="/hr/worker/add" className={THEME.ButtonBasic}>
                        <UserPlus size={18} />
                        Add Employee
                    </Link>
                    <Link href="/hr/worker/shift-define" className={THEME.ButtonBasic}>
                        <Clock3 size={18} />
                        Define Shift
                    </Link>
                    <Link href="/hr/holiday/add" className={THEME.ButtonBasic}>
                        <CalendarX size={18} />
                        Define Holiday
                    </Link>
                    <Link href="/hr/saturday/set" className={THEME.ButtonOutLine}>
                        <Plane size={18} />
                        Define Saturday
                    </Link>
                    <Link href="/hr/office" className={THEME.ButtonOutLine}>
                        <Building2 size={18} />
                        Manage Offices
                    </Link>
                    <Link href="/hr/worker/bulk-add" className={THEME.ButtonOutLine}>
                        <Files size={18} />
                        Worker Uploader
                    </Link>
                </div>
            </div>

            {/* The main data table */}
            <DataTable 
                columns={listColumns}
                data={data}
                isLoading={loading}
                error={error}
                dropdownFilters={['Department']}
                searchFilters={['id', 'WorkerName']}
                sliderFilters={['Age', 'JobDuration']}
                showPrint={false}
                clickableColumnId="id"
                onCellClick={onCellClickFunction}
            />
        </div>
    )
}