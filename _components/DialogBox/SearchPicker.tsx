'use client';

import { useEffect, useMemo, useState } from "react";
import {Search, X } from "lucide-react";
import { THEME } from "../constants/ui";
import { cn } from "../generic/utils";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import LoadingIcon from "../generic/Loading";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";

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
    isDynamic?: boolean;
}

export function SearchPicker({
    apiUrl,
    placeholder = "Click to choose",
    displayColumn,
    columnMapping,
    onSelect,
    value,
    id,
    customClasses = {},
}: SearchPickerProps) {
    const [open, setOpen] = useState(false);
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchTerms, setSearchTerms] = useState<Record<number, string>>({});
    const [selectedLabel, setSelectedLabel] = useState("");

    const handleOpenChange = async (isOpen: boolean) => {
        setOpen(isOpen);

        if (isOpen && data.length === 0) {
            setLoading(true);
            try {
                const response = await fetch(apiUrl);
                const jsonData = await response.json();
                setData(jsonData);
            } catch (err) {
                console.error("Failed to fetch search data", err);
            } finally {
                setLoading(false);
            }
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

    //Change the shown value if it updates after element is rendered.
    useEffect(() => {
        setSelectedLabel(value);
    }, [value]);

    const handleRowClick = (row: any) => {
        const val = Object.values(row)[0];
        onSelect(val);
        setSelectedLabel(row[displayColumn]);
        setOpen(false);
    }

    const handleClear = (e: React.MouseEvent) => {
        e.stopPropagation();

        onSelect(null);

        setSelectedLabel("");
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <div className={cn("relative cursor-pointer group shrink-0", customClasses.trigger)}>
                    <div className={cn(THEME.TextInputReadOnly, "cursor-pointer flex items-center justify-between gap-2 w-full")}>
                        <span className={cn(
                            "overflow-x-auto whitespace-nowrap min-w-0 scrollbar-none",
                            selectedLabel ? "text-base-content" : "text-base-content/30"
                        )}>
                            {selectedLabel || placeholder}
                        </span>
                        <div className="flex items-center gap-2 ml-auto shrink-0">
                            <Search className="h-4 w-4 opacity-50" />
                            {selectedLabel && (
                                <X className="h-4 w-4 opacity-50 hover:opacity-100 transition-opacity" onClick={handleClear} />
                            )}
                        </div>
                    </div>
                </div>
            </DialogTrigger>

            <DialogContent className={cn(
                "w-[95vw] max-h-[90vh] flex flex-col p-0",
                customClasses.dialog
            )}>
                <DialogHeader className="p-6 pb-0">
                    <DialogTitle>Search and Select</DialogTitle>
                    <DialogDescription className="sr-only">
                        Search and select an item from the table.
                    </DialogDescription>
                </DialogHeader>

                <div className="p-6 overflow-hidden flex flex-col flex-1">
                    {loading ? (
                        <div className="flex justify-center p-8">
                            <LoadingIcon />
                        </div>
                    ): (
                        <div className={cn("relative min-h-75", THEME.Table.TableContainer)}>
                            <Table className="table table-pin-rows table-sm w-full">
                                <TableHeader>
                                    <TableRow>
                                        {columnMapping.map((col, idx) => (
                                            <TableHead key={`header-${idx}`} className="bg-base-300">
                                                {col.header}
                                            </TableHead>
                                        ))}
                                    </TableRow>
                                    <TableRow>
                                        {columnMapping.map((col, idx) => (
                                            <TableHead key={`search-${idx}`} className="p-2 bg-base-100">
                                                <input
                                                    autoFocus={idx === 0}
                                                    placeholder={`Filter ${col.header}...`}
                                                    className={cn(THEME.TextInput, "min-w-37.5")}
                                                    value={searchTerms[idx] || ""}
                                                    onChange={(e) => setSearchTerms(prev => ({ ...prev, [idx]: e.target.value }))}
                                                />
                                            </TableHead>
                                        ))}
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                        {filteredData.map((row, rowIndex) => (
                                            <TableRow key={rowIndex} className={cn(THEME.Table.RowHover, 'cursor-pointer')} onClick={() => handleRowClick(row)}>
                                                {columnMapping.map((col, colIndex) => (
                                                    <TableCell key={`${rowIndex}-${colIndex}`} className="whitespace-nowrap">
                                                        {String(row[col.key] ?? "")}
                                                    </TableCell>
                                                ))}
                                            </TableRow>
                                        ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}

export function SearchPickerAsync({
    apiUrl,
    placeholder = "Click to search...",
    displayColumn,
    columnMapping,
    onSelect,
    value,
    id,
    customClasses = {},
}: SearchPickerProps) {
    const [open, setOpen] = useState(false);
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchTerms, setSearchTerms] = useState<Record<number, string>>({});
    const [debouncedTerms, setDebouncedTerms] = useState<Record<number, string>>({});
    const [selectedLabel, setSelectedLabel] = useState("");

    //Only change search terms after no key is pressed for 0.5s. This stops api spam
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedTerms(searchTerms);
        }, 500);

        return () => clearTimeout(handler);
    }, [searchTerms]);

    //Get updated options when the box opens or search is typed
    useEffect(() => {
        if (!open) return;

        const fetchData = async () => {
            setLoading(true);

            try {
                const params = new URLSearchParams();
                Object.entries(debouncedTerms).forEach(([idx, term]) => {
                    if (term && term.trim() !== "") {
                        params.append('searches', `${term}`);
                    }
                });

                const separator = apiUrl.includes('?') ? '&' : '?';
                const url = `${apiUrl}${params.toString() ? separator + params.toString() : ''}`;
                
                const response = await fetch(url);

                const jsonData = await response.json();

                setData(Array.isArray(jsonData) ? jsonData : []);

            } catch (err) {
                console.error("Failed to fetch async search data", err);
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, [debouncedTerms, open, apiUrl, columnMapping]);

    //Show the selected value in the trigger.
    useEffect(() => {
        setSelectedLabel(value);
    }, [value]);

    //Triggers when the trigger is clicked
    const handleOpenChange = (isOpen: boolean) => {
        setOpen(isOpen);
    };

    //Triggers when a row is clicked
    const handleRowClick = (row: any) => {
        const val = row[columnMapping[0].key]; 
        onSelect(val);
        setSelectedLabel(row[displayColumn]);
        setOpen(false);
    }

    //Triggers when clear button is clicked
    const handleClear = (e: React.MouseEvent) => {
        e.stopPropagation();
        onSelect(null);
        setSelectedLabel("");
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <div className={cn("relative cursor-pointer group shrink-0", customClasses.trigger)}>
                    <div className={cn(THEME.TextInputReadOnly, "cursor-pointer flex items-center justify-between gap-2 w-full")}>
                        <span className={cn(
                            "overflow-x-auto whitespace-nowrap min-w-0 scrollbar-none",
                            selectedLabel ? "text-base-content" : "text-base-content/30"
                        )}>
                            {selectedLabel || placeholder}
                        </span>
                        <div className="flex items-center gap-2 ml-auto shrink-0">
                            <Search className="h-4 w-4 opacity-50" />
                            {selectedLabel && (
                                <X className="h-4 w-4 opacity-50 hover:opacity-100" onClick={handleClear} />
                            )}
                        </div>
                    </div>
                </div>
            </DialogTrigger>
            <DialogContent className={cn("w-[95vw] max-h-[90vh] flex flex-col p-0", customClasses.dialog)}>
                <DialogHeader className="p-6 pb-0">
                    <DialogTitle>Search and select</DialogTitle>
                    <DialogDescription className="sr-only">
                        Search and select an item from the table.
                    </DialogDescription>
                </DialogHeader>
                <div className="p-6 overflow-hidden flex flex-col flex-1">
                    <div className={cn("relative min-h-75", THEME.Table.TableContainer)}>
                        <Table className={THEME.Table.Wrapper}>
                            <TableHeader className={THEME.Table.HeaderRow}>
                                <TableRow className="bg-base-200">
                                    {columnMapping.map((col, idx) => (
                                        <TableHead key={`h-${idx}`} className="p-1 border-b text-center">
                                            {col.header}
                                        </TableHead>
                                    ))}
                                </TableRow>
                                <TableRow>
                                    {columnMapping.map((col, idx) => (
                                        <TableHead key={`s-${idx}`} className="p-1 border-b text-center">
                                            <input
                                                autoFocus={idx === 0}
                                                placeholder={`Search ${col.header}...`}
                                                className={cn(THEME.TextInput, "min-w-37.5")}
                                                value={searchTerms[idx] || ""}
                                                onChange={(e) => setSearchTerms(prev => ({ ...prev, [idx]: e.target.value }))}
                                            />
                                        </TableHead>
                                    ))}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={columnMapping.length} className="text-center py-10">
                                            <div className="flex justify-center"><LoadingIcon /></div>
                                        </TableCell>
                                    </TableRow>
                                ): data.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={columnMapping.length} className={cn("text-center py-10", THEME.Text.GrayText)}>
                                            No results found
                                        </TableCell>
                                    </TableRow>
                                ): (
                                    data.map((row, rowIndex) => (
                                        <TableRow
                                            key={rowIndex}
                                            className={cn(
                                                "transition-colors cursor-pointer",
                                                THEME.Table.RowHover,
                                            )}
                                            onClick={() => handleRowClick(row)}
                                        >
                                            {columnMapping.map((col, colIndex) => (
                                                <TableCell key={`${rowIndex}-${colIndex}`} className="whitespace-nowrap">
                                                    {String(row[col.key] ?? "")}
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}