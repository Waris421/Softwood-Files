'use client';

import { DataTable } from "@/_components/table/Table";
import { ColumnDef } from "@tanstack/react-table";
import { useEffect, useState } from "react";
import { UserPlus, Files, Clock3, Building2, CalendarX, Plane } from "lucide-react";
import { THEME } from "@/_components/constants/ui";
import { useRouter } from "next/navigation";

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
    
    const handleAddWorker = () => {
        router.push('/hr/worker/add');
    }

    const handleShiftDefine = () => {
        console.log('I am clicked');
    }

    const handleHolidayDefine = () => {
        console.log('I am clicked');
    }

    const handleSaturdayDefine = () => {
        console.log('I am clicked');
    }

    const handleOfficeDefine = () => {
        console.log('I am clicked');
    }

    const handleWorkerUploader = () => {
        router.push('/hr/worker/bulk-add');
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
                    <button
                        className={THEME.ButtonBasic}
                        onClick={handleAddWorker}
                    >
                        <UserPlus size={18} />
                        Add Employee
                    </button>
                    <button
                        className={THEME.ButtonBasic}
                        onClick={handleShiftDefine}
                    >
                        <Clock3 size={18} />
                        Define Shift
                    </button>
                    <button 
                        className={THEME.ButtonBasic}
                        onClick={handleHolidayDefine}
                    >
                        <CalendarX size={18} />
                        Define Holiday
                    </button>
                    <button 
                        className={THEME.ButtonOutLine}
                        onClick={handleSaturdayDefine}
                    >
                        <Plane size={18} />
                        Define Saturday
                    </button>
                    <button 
                        className={THEME.ButtonOutLine}
                        onClick={handleOfficeDefine}
                    >
                        <Building2 size={18} />
                        Define Offices
                    </button>
                    <button 
                        className={THEME.ButtonOutLine}
                        onClick={handleWorkerUploader}
                    >
                        <Files size={18} />
                        Worker Uploader
                    </button>
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
            />
        </div>
    )
}