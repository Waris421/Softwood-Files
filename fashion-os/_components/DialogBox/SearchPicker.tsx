'use client';

import { useEffect, useMemo, useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Key, Loader2, Search, X } from "lucide-react";
import { THEME } from "../constants/ui";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { cn } from "../generic/utils";
import { createPortal } from "react-dom";

interface ColumnConfig {
    header: string; // The name displayed in the table
    key: string;    // The key returned by the API
}

interface SearchPickerProps {
    apiUrl: string;
    placeholder?: string;
    displayColumn: string;
    columnMapping: ColumnConfig[];
    onSelect: (value: any) => void;
    value: any;
    customClasses?: {
        trigger?: string;
        dialog?: string;
    };
    id: string;
}

export function SearchPicker({
    apiUrl,
    placeholder = "Click to choose",
    displayColumn,
    columnMapping,
    onSelect,
    value,
    id,
    customClasses = {}
}: SearchPickerProps) {
    const modalRef = useRef<HTMLDialogElement>(null);
    const firstInputRef = useRef<HTMLInputElement>(null);
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchTerms, setSearchTerms] = useState<Record<number, string>>({});
    const [selectedLabel, setSelectedLabel] = useState(value);
    const [mounted, setMounted] = useState(false);

    //Ensure portal only renders on client
    useEffect(() => {
        setMounted(true);
    }, []);

    const handleOpenModal = async() => {
        modalRef.current?.showModal();

        setLoading(true);
        try {
            const response = await fetch(apiUrl);
            const jsonData = await response.json();
            setData(Array.isArray(jsonData) ? jsonData : []);

            setTimeout(() => {
                firstInputRef.current?.focus();
            }, 0);
        } catch (err) {
            console.error("Failed to fetch search data", err);
        } finally {
            setLoading(false);
        }
    }

    const filteredData = useMemo(() => {
        return data.filter((row) => 
            Object.entries(searchTerms).every(([colIdx, term]) => {
                if (!term) return true;
                const apiField = columnMapping[Number(colIdx)].key;
                return String(row[apiField] || "")
                    .toLowerCase()
                    .includes(term.toLowerCase());
            })
        );
    }, [data, searchTerms, columnMapping]);

    const handleRowClick = (row: any) => {
        const val = Object.values(row)[0];
        onSelect(val);
        setSelectedLabel(row[displayColumn]);
        modalRef.current?.close();
    }

    const handleClear = (e: React.MouseEvent) => {
        e.stopPropagation();

        onSelect(null);

        setSelectedLabel("");
    }

    const modalContent = (
        <dialog id={id} ref={modalRef} className="modal">
            <div className={cn(
                "modal-box p-0 flex flex-col max-h-[90vh] bg-muted",
                customClasses.dialog || "max-w-11/12 w-11/12"
            )}>
                {/* Header */}
                <div className="p-6 pb-0 flex justify-between items-center">
                    <h3 className="font-bold text-lg">Search and Select</h3>
                    <form method="dialog">
                        <button className="btn btn-sm btn-circle btn-ghost">✕</button>
                    </form>
                </div>
                <div className="p-6 overflow-hidden flex flex-col">
                    {loading ? (
                        <div className="flex justify-center p-8">
                            <span className="loading loading-spinner loading-lg"></span>
                        </div>
                    ): (
                        <div className="overflow-x-auto border rounded-lg">
                            <table className="table table-pin-rows table-sm">
                                <thead>
                                    <tr className="bg-base-200">
                                        {columnMapping.map((col, idx) => (
                                            <th key={`header-${idx}`} className="capitalize">
                                                {col.header}
                                            </th>
                                        ))}
                                    </tr>
                                    <tr className="bg-base-100">
                                        {columnMapping.map((col, idx) => (
                                            <th key={`search-${idx}`} className="p-2">
                                                <input
                                                    ref={idx === 0 ? firstInputRef : null}
                                                    placeholder={`Filter ${col.header}...`}
                                                    className={THEME.TextInput}
                                                    value={searchTerms[idx] || ""}
                                                    onChange={(e) => setSearchTerms(prev => ({ 
                                                        ...prev, 
                                                        [idx]: e.target.value 
                                                    }))}
                                                />
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredData.map((row, rowIndex) => (
                                        <tr
                                            key={rowIndex}
                                            className="hover cursor-pointer"
                                            onClick={() => handleRowClick(row)}
                                        >
                                            {columnMapping.map((col, colIndex) => (
                                                <td key={`${rowIndex}-${colIndex}`}>
                                                    {String(row[col.key] ?? "")}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
            {/* Click outside to close */}
            <form method="dialog" className="modal-backdrop">
                <button>close</button>
            </form>
        </dialog>
    )

    return (
        <>
            <div
                className={cn("relative cursor-pointer group shrink-0", customClasses.trigger)}
                onClick={handleOpenModal}
            >
                <div className={cn(
                    THEME.TextInputReadOnly,
                    "cursor-pointer flex items-center justify-between gap-2 w-full",
                )}>
                    <span className={cn(
                        "overflow-x-auto whitespace-nowrap min-w-0 scrollbar-none",
                        selectedLabel ? "text-foreground" : "text-gray-400"
                    )}>
                        {selectedLabel || placeholder}
                    </span>
                    <div className="flex items-center gap-2 ml-auto shrink-0">
                        <Search className="h-4 w-4 opacity-50" />
                        {selectedLabel && (
                            <X 
                                className="h-4 w-4 opacity-50 hover:opacity-100 transition-opacity" 
                                onClick={handleClear}
                            />
                        )}
                    </div>
                </div>
            </div>
            
            {mounted && createPortal(modalContent, document.body)}
        </>
    )
}