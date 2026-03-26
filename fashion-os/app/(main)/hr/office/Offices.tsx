'use client';

import { THEME } from "@/_components/constants/ui";
import { DataTable } from "@/_components/table/Table";
import { Cell, ColumnDef } from "@tanstack/react-table";
import { Database, MapPinPlus, Plus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

type OfficeList = {
    Name: string,
    Location: string,
    Radius: string,
    Employees: number
}

const listColumns: ColumnDef<OfficeList>[] = [
    {accessorKey: 'Name', header: 'Office Name'},
    {accessorKey: 'Location', header: 'Location'},
    {accessorKey: 'Radius', header: 'Radius'},
    {accessorKey: 'Count', header: 'Employees'},
]

export default function OfficeList() {
    const [data, setData] = useState<OfficeList[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    
    const router = useRouter();

    return (
        <div className="container mx-auto py-10 relative">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold">Offices</h1>
                    <p className="text-sm text-base-content/70">Manage Offices</p>
                </div>
                
                <div className="flex flex-wrap gap-2">
                    <Link href="/hr/office/add" className={THEME.ButtonBasic}>
                        <Plus size={19} />
                        Add Office
                    </Link>

                    <Link href="/hr/cache-location" className={THEME.ButtonBasic}>
                        <Database size={18} />
                        View Location Database
                    </Link>

                    <Link href="/hr/office/assign" className={THEME.ButtonBasic}>
                        <MapPinPlus size={18}/>
                        Office Assignment
                    </Link>
                </div>
            </div>

            {/* The main data table */}
            <DataTable 
                columns={listColumns}
                data={data}
                isLoading={loading}
                error={error}
                showPrint={false}
                showDownload={false}
                searchFilters={['Name']}
                columnClickHandlers={{
                    Name: (cell) => console.log("Office clicked:", cell.getValue()),
                }}
            />
        </div>
    )
}