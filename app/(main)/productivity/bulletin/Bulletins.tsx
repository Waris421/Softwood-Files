'use client';

import { THEME } from "@/_components/constants/ui";
import { DataTable } from "@/_components/table/Table";
import { Cell, ColumnDef } from "@tanstack/react-table";
import { Loader2, SquarePlus } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

type Bulletin = {
    id: number,
    StyleCode: string,
    SMV: number,
    Rate: number,
    LeadTime: number,
    Sections: { [Section: string]: number },
    SkillLevels: { [SkillLevel: string]: number },
    MachineTypes: { [MachineType: string]: number },
}

//Helper function to properly show the breakdown columns
const renderBreakdown = (breakdownObj: Record<string, number>) => {
    if (!breakdownObj || Object.keys(breakdownObj).length === 0) return 'N/A';
    return Object.entries(breakdownObj)
        .map(([key, value]) => `${key}: ${value}`)
        .join(', ');
};

const reportColumns: ColumnDef<Bulletin>[] = [
    {
        accessorKey: 'StyleCode',
        header: 'Style Code'
    },
    {
        accessorKey: 'Sections',
        header: 'Section Breakdown',
        cell: ({ getValue }) => renderBreakdown(getValue<{ [Section: string]: number }>())
    },
    {
        accessorKey: 'SkillLevels',
        header: 'Skill Breakdown',
        cell: ({ getValue }) => renderBreakdown(getValue<{ [SkillLevel: string]: number }>())
    },
    {
        accessorKey: 'MachineTypes',
        header: 'Machine Breakdown',
        cell: ({ getValue }) => renderBreakdown(getValue<{ [MachineType: string]: number }>())
    },
    {
        accessorKey: 'SMV',
        header: 'SAM',
    },
    {
        accessorKey: 'Rate',
        header: 'Rate',
        cell: ({ getValue }) => {
            const amount = getValue<number>();
            return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'PKR' }).format(amount);
        }
    },
    {
        accessorKey: 'LeadTime',
        header: 'Lead Time',
        cell: ({ getValue }) => {
            const days = getValue<number>();
            return `${days} Days`;
        }
    },
]

export default function Bulletins() {
    const [data, setData] = useState<Bulletin[]>([]);
    const [loading, setLoading] = useState(true);
    const [redirecting, setRedirecting] = useState(false);
    const [error, setError] = useState(null);
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [messageConfig, setMessageConfig] = useState<{ show: boolean; subject: string; message: string; action?: () => void; } | null>(null);

    useEffect(() => {
        const fetchBulletins = async() => {
            setLoading(true);
            try {
                const response = await fetch('/api/productivity/bulletin');
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.details?.message || "Failed to fetch requests");
                }
                
                const bulletins: Bulletin[] = await response.json();
                setData(bulletins);
            } catch(err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchBulletins();
    }, [refreshTrigger]);

    const customHeaderButtons = () => {
        return (
            <>
                <Link
                    href="/productivity/bulletin/add"
                    className={`${THEME.ButtonBasic} ${redirecting ? 'pointer-events-none opacity-50' : ''}`}
                    onClick={() => setRedirecting(true)}
                >
                    <SquarePlus size={18}  />
                    Add Bulletin
                </Link>
            </>
        )
    }

    const onStyleCodeClickAction = (cell: Cell<any, any>) => {
        const id = cell.row.original.id;
        console.log(id);
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
                    showDownload={false}
                    showPrint={false}
                    customActions={customHeaderButtons()}
                    searchFilters={['StyleCode']}
                    sliderFilters={['SMV', 'Rate']}
                    columnClickHandlers={{
                        StyleCode: onStyleCodeClickAction
                    }}
                />
            </div>
        </>
    )
}