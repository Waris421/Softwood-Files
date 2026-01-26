'use client';

import * as React from "react"
import { Cell, ColumnDef, ColumnFiltersState, flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, SortingState, useReactTable } from "@tanstack/react-table";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Button } from "../ui/button";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, ArrowUpDown, Inbox, ChevronUp, ChevronDown, AlertCircle} from "lucide-react";
import { THEME } from "../constants/ui";
import { Skeleton } from "../ui/skeleton";
import Dropdown from "../Dropdown/Dropdown";
import { Slider } from "../ui/slider";

//Paramters for the dropdown table
interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[]
    data: TData[]
    searchFilters?: string[],
    dropdownFilters?: string[],
    sliderFilters?: string[],
    isLoading?: boolean,
    onCellClick?: (cell: Cell<TData, TValue>, e?: React.MouseEvent) => void,
    clickableColumnId?: string,
    error?: string | null,
}

export function DataTable<TData, TValue> ({
    columns, data, searchFilters, dropdownFilters, sliderFilters, isLoading, onCellClick, clickableColumnId, error,
}: DataTableProps<TData, TValue> ) {
    //Initialisations
    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
    
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

    const table = useReactTable({
        data,
        columns,
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
    
    //Table HTML element
    return (
        <div className="space-y-2">
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
                    const selectedOption = currentValue ? { value: currentValue, label: currentValue } : null;
                    
                    return (
                        <div key={columnId} className="flex-1 min-w-30">
                            <Dropdown 
                                inputName={`filter-${columnId}`}
                                placeholder={`Filter ${getColumnHeaderFromId(columnId)}`}
                                isStatic={true}
                                staticOptions={formattedOptions}
                                widthClass="w-full"
                                defaultValue={selectedOption}
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
                            table.getRowModel().rows.map((row) => (
                                <TableRow key={row.id} className="hover:bg-muted/50 transition-colors">
                                    {row.getVisibleCells().map((cell) => {
                                        const isClickable = cell.column.id === clickableColumnId;
                                        return (
                                            <TableCell 
                                                key={cell.id}
                                                tabIndex={isClickable ? 0 : -1}
                                                onClick={(e) => {
                                                    if (isClickable) {
                                                        e.currentTarget.focus();
                                                        onCellClick?.(cell, e);
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
                            ))
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
                        <div className="flex w-25 items-center justify-center text-sm font-medium">
                            Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
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
        </div>
    )
}