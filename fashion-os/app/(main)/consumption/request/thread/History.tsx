'use client';

import { THEME } from "@/_components/constants/ui";
import ActionDialog from "@/_components/DialogBox/ActionDialog";
import { SingleDropdown } from "@/_components/Dropdown/Dropdown";
import { DataTable } from "@/_components/table/Table";
import { Cell, ColumnDef } from "@tanstack/react-table";
import { Edit, Trash, Copy } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

type ConsHistory = {
    ConsumptionNumber: number,
    RequestBy: string,
    AddedOn: string,
    Status: string,
    Style: string,
    Length: number,
}

const historyColumns: ColumnDef<ConsHistory>[] = [
    {
        accessorKey: 'id',
        header: 'Cons. No.',
    },
    {
        accessorKey: 'RequestBy',
        header: 'Request By'
    },
    {
        accessorKey: 'AddedOn',
        header: 'Date'
    },
    {
        accessorKey: 'Style',
        header: 'Style Name',
    },
    {
        accessorKey: 'Status',
        header: 'Status',
    },
    {
        accessorKey: 'ConsumptionValue',
        header: 'Total Cons.',
    },
]

export default function ConsumptionHistory() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isOpen, setIsOpen] = useState(false);
    const [coords, setCoords] = useState({ top: 0, left: 0 });
    const [origin, setOrigin] = useState("center");
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [templateRequests, setTemplateRequests] = useState<any[]>([]);
    const [selectedRequest, setSelectedRequest] = useState<any>(null);
    const [showTemplateCard, setShowTemplateCard] = useState(false);

    const dialogRef = useRef(null);
    const router = useRouter();

    useEffect(() => {
        const fetchConsumptionHistory = async() => {
            try {
                setLoading(true);
                const response = await fetch('/api/consumption/thread');
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.details?.message || "Failed to fetch requests");
                }

                const historyRaw = await response.json();
                const history = historyRaw.map((entry:any) => ({
                    ...entry,
                    AddedOn: new Intl.DateTimeFormat('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                    }).format(new Date(entry.AddedOn)).replace(/ /g, '-'),
                }));

                setData(history);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }

        }

        fetchConsumptionHistory();
    }, []);

    const onCellClickFunction = (cell: Cell<any, any>, e?: React.MouseEvent) => { 
        const id = cell.getValue();
        if (e) {
            const mouseX = e.clientX;
            const mouseY = e.clientY;

            setCoords({
                top: mouseY + window.scrollY + 5,
                left: mouseX + window.scrollX + 10
            });

            setOrigin(`0% 0%`);
        }

        setIsOpen(true);
        setSelectedId(id);
    }

    //The use selected consumption as template for others
    const useAsTemplate = async () => {
        setIsOpen(false);

        try {
            setLoading(true);

            const response = await fetch('/api/consumption/thread/request/pending');
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.details?.message || "Failed to fetch requests");
            }

            const requestsRaw = await response.json();

            const formattedRequests = requestsRaw.map((item: any) => ({
                label: item.Style,
                value: item.RequestNumber,
            }));

            setTemplateRequests(formattedRequests);
            setShowTemplateCard(true);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    function duplicateConsumption() {
        const sourceId = selectedId;
        const targetId = selectedRequest.value;
        
        console.log(sourceId);

        setShowTemplateCard(false);
        setSelectedRequest(null);
        setSelectedId(null);
    }

    const buttonAction2 = () => {
        console.log(`Action 2 for id: ${selectedId}`);

        setIsOpen(false);
        setSelectedId(null);
    }

    const buttonAction3 = () => {
        console.log(`Action 3 for id: ${selectedId}`);

        setIsOpen(false);
        setSelectedId(null);
    }

    const dialogBoxActions = [
        { label: 'Use As Template', icon: <Copy size={16}/>, onClick: useAsTemplate },
        { label: 'Action 2', icon: <Edit size={16}/>, onClick: buttonAction2 },
        { label: 'Action 3', icon: <Trash size={16}/>, onClick: buttonAction3 }
    ]
    
    return (
        <div className="container mx-auto py-10">
            <DataTable 
                columns={historyColumns}
                data={data}
                searchFilters={['Style']}
                dropdownFilters={['RequestBy', 'Status']}
                isLoading={loading}
                columnClickHandlers={{
                    id: onCellClickFunction
                }}
                error={error}
            />
            
            {/* Dialogue box upon clicking a consumption */}
            {isOpen && (
                <ActionDialog 
                    isOpen={isOpen}
                    onClose={() => setIsOpen(false)}
                    coords={coords}
                    origin={origin}
                    actions={dialogBoxActions}
                />
            )}

            {/* Target selection card for consumption template */}
            {showTemplateCard && (
                <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/50">
                    <div className="card w-96 bg-base-100 shadow-xl">
                        <div className="card-body">
                            <h2 className="card-title text-primary">Select a template</h2>
                            <div className="py-4">
                                <label className="label-text font-bold mb-2 block">Select Target Consumption</label>
                                <SingleDropdown 
                                    inputName="templateTarget"
                                    isStatic={true}
                                    staticOptions={templateRequests}
                                    widthClass="w-full"
                                    onSelect={(opt) => setSelectedRequest(opt)}
                                />
                            </div>
                            <div className="card-actions justify-end">
                                <button className="btn btn-ghost btn-sm" onClick={() => setShowTemplateCard(false)}>Cancel</button>
                                <button
                                    className={THEME.ButtonBasic}
                                    onClick={duplicateConsumption}
                                    disabled={!selectedRequest}
                                >
                                    Confirm
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}