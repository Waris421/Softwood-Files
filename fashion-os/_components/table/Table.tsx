'use client';

import * as React from "react"
import { useReactToPrint } from "react-to-print";
import * as XLSX from "xlsx";
import { Cell, ColumnDef, ColumnFiltersState, FilterFn, flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, SortingState, useReactTable } from "@tanstack/react-table";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Button } from "../ui/button";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, ArrowUpDown, Inbox, ChevronUp, ChevronDown, AlertCircle, Printer, Download} from "lucide-react";
import { THEME } from "../constants/ui";
import { Skeleton } from "../ui/skeleton";
import { SingleDropdown } from "../Dropdown/Dropdown";
import { Slider } from "../ui/slider";
import { PrintTable } from "../Print/Table";

//Paramters for the dropdown table
interface DataTableProps<TData, TValue> {
    title?: string,
    columns: ColumnDef<TData, TValue>[]
    data: TData[]
    searchFilters?: string[],
    dropdownFilters?: string[],
    sliderFilters?: string[],
    isLoading?: boolean,
    columnClickHandlers?: Record<string, (cell: Cell<TData, TValue>, e?: React.MouseEvent) => void>;
    getRowClassName?: (row: TData) => string;
    error?: string | null,
    showPrint?: boolean,
    showDownload?: boolean,
}

export function DataTable<TData, TValue> ({
    title, columns, data, searchFilters, dropdownFilters, sliderFilters, isLoading, columnClickHandlers, error, showPrint=true, showDownload=true, getRowClassName,
}: DataTableProps<TData, TValue> ) {
    //Initialisations
    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
    const componentRef = React.useRef<HTMLDivElement>(null);
    
    const sliderBounds = React.useMemo(() => {
        const bounds: Record<string, { min: number; max: number }> = {};
            sliderFilters?.forEach((columnId) => {
                const values = data
                    .map((row: any) => Number(row[columnId]))
                    .filter((val) => !isNaN(val))
                
                if (values.length > 0) {
                    bounds[columnId] = {
                        min: Math.min(...values),
                        max: Math.max(...values),
                    }
                }
            });
        
            return bounds
    }, [data, sliderFilters]);

    //Helper function to filter rows irrespective of data type or text case
    const fuzzyFilterFn: FilterFn<any> = (row, columnId, filterValue) => {
        const rowValue = row.getValue(columnId);
        if (rowValue == null) return false;

        return String(rowValue).toLowerCase().includes(String(filterValue).toLowerCase());
    };
    
    //Table object
    const table = useReactTable({
        data,
        columns,
        defaultColumn: {
            filterFn: fuzzyFilterFn, 
        },
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        onSortingChange: setSorting,
        getSortedRowModel: getSortedRowModel(),
        onColumnFiltersChange: setColumnFilters,
        getFilteredRowModel: getFilteredRowModel(),

        filterFns: {
            inNumberRange: (row, columnId, filterValue: [number, number]) => {
                const [min, max] = filterValue;
                const rowValue = Number(row.getValue(columnId));
                return rowValue >= min && rowValue <= max;
            },
        },
        state: {
            sorting,
            columnFilters,
        },
        initialState: {
            pagination: {
                pageSize: 20,
            },
        },
    })

    //Helper function to get column display name from its id
    const getColumnHeaderFromId = (columnId: string) => {
        const column = table.getColumn(columnId);
        if (!column) return columnId;

        const header = column.columnDef.header;

        return typeof header === "string" ? header : columnId;
    }

    //Download the filtered data
    const handleDownload = () => {
        const rows = table.getFilteredRowModel().rows.map((row) => {
            const rowData: Record<string, any> = {};
            row.getVisibleCells().forEach((cell) => {
                const header = cell.column.columnDef.header;
                const key = typeof header === "string" ? header : cell.column.id;
                rowData[key] = cell.getValue();
            });
            return rowData;
        });
        const worksheet = XLSX.utils.json_to_sheet(rows);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, title?.replace(/\s+/g, '') || 'Data');
        
        XLSX.writeFile(workbook, `${title?.replace(/\s+/g, '') || 'Export'}.xlsx`)
    }

    //Print the filtered data
    const handlePrint = useReactToPrint({
        contentRef: componentRef,
        documentTitle: "Stock_Report",
    });

    //get the options for each drop down based on the data in those cols
    const dropDownOptions = React.useMemo(() => {
        const optionsMap: Record<string, string[]> = {};
        
        dropdownFilters?.forEach((columnId) => {
            const uniqueValues = new Set(
                data
                    .map((row: any) => row[columnId])
                    .filter((val) => val !== undefined && val !== null && val !== "")
            );
            optionsMap[columnId] = Array.from(uniqueValues).sort();
        });
        
        return optionsMap
    }, [data, dropdownFilters]);

    //Options for the go to page dropdown
    const pageOptions = React.useMemo(() => {
        return Array.from({ length: table.getPageCount() }, (_, i) => ({
            label: `Page ${i + 1}`,
            value: String(i),
        }));
    }, [table.getPageCount()]);
    
    const rowsToPrint = table.getSortedRowModel().rows;
    
    //The HTML element
    return (
        <div className="space-y-2">
            {/* Optional Title */}
            {title && (
                <div className="flex justify-center w-full py-2">
                    <h2 className="text-xl md:text-2xl font-bold text-foreground tracking-tight">
                        {title}
                    </h2>
                </div>
            )}
            
            {/*Table filters*/}
            <div className="flex flex-nowrap items-center gap-2 w-full mb-4">
                
                {/* Search a col */}
                {searchFilters?.map((columnId) => (
                    <div key={columnId} className="relative flex-1 min-w-30">
                        <input
                            placeholder={`Search ${getColumnHeaderFromId(columnId)}...`}
                            value={(table.getColumn(columnId)?.getFilterValue() as string) ?? ""}
                            onChange={(event) => table.getColumn(columnId)?.setFilterValue(event.target.value)}
                            className={`${THEME.TextInput} input-sm md:input-md`}
                        />
                    </div>
                ))}
                
                {/* Filter cols */}
                {dropdownFilters?.map((columnId) => {
                    const column = table.getColumn(columnId);
                    if (!column) return null;

                    const formattedOptions = (dropDownOptions[columnId] || []).map(option => ({
                        value: String(option),
                        label: String(option)
                    }));

                    const currentValue = column.getFilterValue() as string;
                    
                    return (
                        <div key={columnId} className="flex-1 min-w-30">
                            <SingleDropdown 
                                inputName={`filter-${columnId}`}
                                placeholder={`Filter ${getColumnHeaderFromId(columnId)}`}
                                isStatic={true}
                                staticOptions={formattedOptions}
                                widthClass="w-full"
                                defaultValue={currentValue}
                                onSelect={(data) => {
                                    if (Array.isArray(data)) {
                                        const values = data.map((opt) => opt.value);
                                        column.setFilterValue(values.length > 0 ? values : undefined);
                                    } else {
                                        column.setFilterValue(data ? data.value : undefined);
                                    }
                                }}
                            />
                        </div>
                    )
                })}

                {/* Slider Cols */}
                {sliderFilters?.map((columnId) => {
                    const column = table.getColumn(columnId);
                    if (!column) return null;

                    const bounds = sliderBounds[columnId] || { min: 0, max: 100 };
                    // Default to min if no filter is set
                    const currentValue = (column.getFilterValue() as [number, number]) ?? [bounds.min, bounds.max];

                    return (
                        <div key={columnId} className={THEME.Slider}>
                            <label className="text-xs font-medium text-muted-foreground flex justify-center">
                                <span>{getColumnHeaderFromId(columnId)}</span>
                            </label>
                            <Slider 
                                className="py-2"
                                min={bounds.min}
                                max={bounds.max}
                                step={(bounds.min - bounds.max) / 100}
                                value={currentValue}
                                onValueChange={(value) => {
                                    column.setFilterValue(value);
                                }}
                            />
        
                        </div>
                    )
                })}

                {/* Print and download buttons */}
                <div className="flex items-center gap-2 ml-auto">
                    {showDownload && (
                        <Button
                            className="btn-primary btn-sm md:btn-md gap-2 cursor-pointer"
                            variant="outline"
                            onClick={handleDownload}
                        >
                            <Download className="h-4 w-4" />
                            <span className="hidden md:inline">Download</span>
                        </Button>
                    )}
                    {showPrint && (
                        <Button
                            className="btn-primary btn-sm md:btn-md gap-2 cursor-pointer"
                            variant="outline"
                            onClick={handlePrint}
                        >
                            <Printer className="h-4 w-4" />
                            <span className="hidden md:inline">Print</span>
                        </Button>
                    )}
                </div>
            </div>

            {/*The main table*/}
            <div className="rounded-lg border bg-card shadow-sm overflow-x-auto">
                <Table className="w-full table-auto">
                    <TableHeader className="bg-muted/50">
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id} className="hover:bg-transparent">
                                {headerGroup.headers.map((header) => {
                                    const isSorted = header.column.getIsSorted();
                                    const SortingIcon = isSorted === "asc" ? ChevronUp : isSorted === "desc" ? ChevronDown : ArrowUpDown;

                                    return(
                                    <TableHead key={header.id} className="px-4 py-3 text-center">
                                        {header.isPlaceholder ? null : (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="mx-auto h-8 data-[state=open]:bg-accent flex items-center justify-center"
                                                onClick={header.column.getToggleSortingHandler()}
                                            >
                                                <span>{flexRender(header.column.columnDef.header, header.getContext())}</span>
                                                <span className="ml-2"><SortingIcon className="h-4 w-4" /></span>
                                            </Button>
                                        )}
                                    </TableHead>
                                )})}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            Array.from({ length: 1 }).map((_, i) => (
                                <TableRow key={i}>
                                    {columns.map((_, j) => (
                                        <TableCell key={j} className="p-4">
                                            <Skeleton className="h-6 w-full opacity-50" />
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : error ? (
                            /* --- ERROR STATE --- */
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center">
                                    <div className="flex flex-col items-center justify-center gap-2 text-error">
                                        <AlertCircle className="h-8 w-8" />
                                        <p className="font-medium">{error}</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => {
                                const customClasses = getRowClassName ? getRowClassName(row.original) : "";
                                return (
                                    <TableRow key={row.id} className={`hover:bg-muted/50 transition-colors ${customClasses}`}>
                                        {row.getVisibleCells().map((cell) => {
                                            const specificHandler = columnClickHandlers?.[cell.column.id];
                                            const isClickable = !!specificHandler;

                                            return (
                                                <TableCell 
                                                    key={cell.id}
                                                    tabIndex={isClickable ? 0 : -1}
                                                    onClick={(e) => {
                                                        if (isClickable) {
                                                            e.currentTarget.focus();
                                                            specificHandler(cell, e);
                                                        }
                                                    }}
                                                    className={`p-4 align-middle text-center wrap-break-word whitespace-normal
                                                        ${isClickable ? `text-blue-600 ${THEME.HyperLink}`  : "text-foreground/80"}
                                                    `}
                                                >
                                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                </TableCell>
                                            );
                                        })}
                                    </TableRow>
                                )
                            })
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="p-4 align-middle text-center">
                                    <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                                        <Inbox className="h-8 w-8 opacity-20" />
                                        <p>No results found.</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}                        
                    </TableBody>
                </Table>
            </div>
            
            {/*Table Pagination*/}
            {!error && !isLoading && (
                <div className="flex items-center justify-center px-2">
                    <div className="flex items-center space-x-1">
                        {/* First Page */}
                        <Button
                            variant="outline"
                            className="h-8 w-8 p-0"
                            onClick={() => table.setPageIndex(0)}
                            disabled={!table.getCanPreviousPage()}
                        >
                            <ChevronsLeft className="h-4 w-4" />
                        </Button>

                        {/* Previous Page */}
                        <Button
                            variant="outline"
                            className="h-8 w-8 p-0"
                            onClick={() => table.previousPage()}
                            disabled={!table.getCanPreviousPage()}
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>

                        {/* Page Indicator */}
                        <div className="flex items-center gap-2 mx-2">
                            <span className="text-sm font-medium whitespace-nowrap">
                                Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
                            </span>

                            <div className="w-32">
                                <SingleDropdown 
                                    inputName="page-selector"
                                    placeholder="Go to..."
                                    isStatic={true}
                                    staticOptions={pageOptions}
                                    widthClass="w-full"
                                    onSelect={(selected: { value: any; }) => {
                                        if (selected && !Array.isArray(selected)) {
                                            table.setPageIndex(Number(selected.value));
                                        }
                                    }}
                                />
                            </div>
                        </div>
                        <div className="flex items-center space-x-2">
                            {/* Next Page */}
                            <Button
                                variant="outline"
                                className="h-8 w-8 p-0"
                                onClick={() => table.nextPage()}
                                disabled={!table.getCanNextPage()}
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>

                            {/* Last Page */}
                            <Button
                                variant="outline"
                                className="h-8 w-8 p-0"
                                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                                disabled={!table.getCanNextPage()}
                            >
                                <ChevronsRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Print View */}
            <div className="hidden">
                <PrintTable 
                    ref={componentRef} 
                    rows={rowsToPrint} 
                    columns={columns} 
                    pageHeader={title}
                />
            </div>
        </div>
    )
}
