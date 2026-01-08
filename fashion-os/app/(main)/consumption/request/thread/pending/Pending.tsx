'use client';

import { DataTable } from "@/_components/table/Table";
import { ColumnDef } from "@tanstack/react-table";
import { useEffect, useState } from "react";
import { useRouter } from 'next/navigation';
import { Button } from "@/_components/ui/button";
import { ArrowUpDown } from "lucide-react";

type ConsRequest = {
    RequestNumber: number,
    FullName: string,
    RequestDate: string,
    Status: string,
    Style: string,
}

const requestColumns: ColumnDef<ConsRequest>[] = [
    {
        accessorKey: 'RequestNumber',
        header: ({ column }) => {
            return (
                <div onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                    Request Number
                </div>
            )
        },
    },
    {
        accessorKey: 'FullName',
        header: 'Request By'
    },
    {
        accessorKey: 'RequestDate',
        header: 'Request Date'
    },
    {
        accessorKey: 'Style',
        header: 'Style Name',
    },
]

export default function PendingConsumptions() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const router = useRouter();

    useEffect(() => {
        const fetchPendingRequests = async () => {
            try {
                setLoading(true);

                const response = await fetch('/api/consumption/thread/request/pending');
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.details?.message || "Failed to fetch requests");
                }
                const requestsRaw = await response.json();

                const requests = requestsRaw.map((request:any) => ({
                    ...request,
                    RequestDate: new Intl.DateTimeFormat('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                    }).format(new Date(request.RequestDate)).replace(/ /g, '-'),
                }));

                setData(requests);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        fetchPendingRequests();
    }, []);

    const onCellClickFunction = (value: number) => {
        router.push(`/consumption/request/thread/${value}/update`);
    }

    if (error) {
        return (
            <div className="container mx-auto py-10 text-red-500 font-bold">
                Error: {error}. Check with your administrator.
            </div>
        );
    }

    return (
        <div className="container mx-auto py-10">
            <DataTable 
                columns={requestColumns}
                data={data}
                filterKey='Style'
                isLoading={loading}
                clickableColumnId='RequestNumber'
                onCellClick={onCellClickFunction}
            />
        </div>
    )
}