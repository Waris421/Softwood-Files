'use client';

import { useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Key, Loader2, Search, X } from "lucide-react";
import { THEME } from "../constants/ui";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { cn } from "../generic/utils";

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
}

export function SearchPicker({
    apiUrl,
    placeholder = "Click to choose",
    displayColumn,
    columnMapping,
    onSelect,
    value,
    customClasses = { 
        trigger: 'w-45', 
        dialog: 'max-w-3xl' 
    }
}: SearchPickerProps) {
    const [open, setOpen] = useState(false);
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchTerms, setSearchTerms] = useState<Record<number, string>>({});
    const [selectedLabel, setSelectedLabel] = useState(value);

    // Fetch data only when opening the dialog for the first time
    const handleOpenChange = async(isOpen: boolean) => {
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
                    <div className={`${THEME.TextInputReadOnly} cursor-pointer`}>
                        <div className={cn(
                            THEME.TextInputReadOnly,
                            "cursor-pointer flex items-center justify-between gap-2 w-full",
                        )}>
                            <span className={cn(
                                "overflow-x-auto whitespace-nowrap min-w-0 scrollbar-none",
                                selectedLabel ? "text-foreground" : "text-muted-foreground"
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
                </div>
            </DialogTrigger>

            <DialogContent className={cn(
                    "max-h-[80vh] flex flex-col", 
                    customClasses.dialog
                )}
            >
                <DialogHeader>
                    <DialogTitle>Search and Select</DialogTitle>
                </DialogHeader>

                {loading ? (
                    <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>
                ) : (
                    <div className="overflow-auto border rounded-md">
                        <Table>
                            <TableHeader className="sticky top-0 bg-secondary">
                                {/* Headers */}
                                <TableRow>
                                    {columnMapping.map((col, idx) => (
                                        <TableHead key={`header-${idx}`} className="capitalize">
                                            {col.header}
                                        </TableHead>
                                    ))}
                                </TableRow>

                                {/* Search Row */}
                                <TableRow>
                                    {columnMapping.map((col, idx) => (
                                        <TableHead key={`search-${idx}`} className="p-2">
                                            <input
                                                placeholder={`Filter ${col.header}...`}
                                                className={THEME.TextInput}
                                                // Value is retrieved by column index
                                                value={searchTerms[idx] || ""}
                                                onChange={(e) => setSearchTerms(prev => ({ 
                                                    ...prev, 
                                                    [idx]: e.target.value 
                                                }))}
                                            />
                                        </TableHead>
                                    ))}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredData.map((row, rowIndex) => (
                                    <TableRow
                                        key={rowIndex}
                                        className="cursor-pointer hover:bg-muted/50"
                                        onClick={() => handleRowClick(row)}
                                    >
                                        {columnMapping.map((col, colIndex) => (
                                            <TableCell key={`${rowIndex}-${colIndex}`}>
                                                {String(row[col.key] ?? "")}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}