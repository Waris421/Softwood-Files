'use client';

import { THEME } from "@/_components/constants/ui";
import LocationPreview from "@/_components/DialogBox/LocationPreview";
import { DataTable } from "@/_components/table/Table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/_components/ui/dialog";
import { Cell, ColumnDef } from "@tanstack/react-table";
import { Database, MapPinPlus, Plus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type OfficeList = {
    id: number;
    LocationName: string;
    Latitude: number;
    Longitude: number;
    Radius: string;
    Employees: number;
}

const listColumns: ColumnDef<OfficeList>[] = [
    {accessorKey: 'LocationName', header: 'Office Name'},
    {
        id: 'Location',
        header: 'Location',
        cell: (info) => {
            const lat = info.row.original.Latitude;
            const long = info.row.original.Longitude;
            return `${lat}, ${long}`;
        }
    },
    {accessorKey: 'Radius', header: 'Radius'},
    {accessorKey: 'Employees', header: 'Employees Count'},
]

export default function OfficeList() {
    const [data, setData] = useState<OfficeList[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [previewOffice, setPreviewOffice] = useState(null);
    
    const router = useRouter();

    useEffect(() => {
        const fetchOffices = async () => {
            try {
                setLoading(true);

                const response = await fetch('/api/hr/office');
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.details?.message || "Failed to fetch offices");
                }

                const offices = await response.json();

                setData(offices);
            } catch (err: any) {
                if (err.name === 'AbortError') return;
                setError(err.message);
            } finally {
                setLoading(false);
            }   
        }

        fetchOffices();
    }, []);

    //To go to location edit page
    const onLocationNameClick = (cell: Cell<any, any>) => {
        const id = cell.row.original.id;
        router.push(`/hr/office/${id}/update`);
    }

    //To preview the location on google maps
    const onLocationClick = (cell: Cell<any, any>) => {
        setPreviewOffice(cell.row.original);
    }

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
                searchFilters={['LocationName']}
                columnClickHandlers={{
                    LocationName: onLocationNameClick,
                    Location: onLocationClick,
                }}
            />

            {/* The location previous dialog */}
            <LocationPreview
                location={previewOffice}
                onClose={() => setPreviewOffice(null)}
            />
        </div>
    )
}