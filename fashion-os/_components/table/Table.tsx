'use client';

import * as React from "react"
import { ColumnDef, ColumnFiltersState, flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, SortingState, useReactTable } from "@tanstack/react-table";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Button } from "../ui/button";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Search, ArrowUpDown, Inbox, ChevronUp, ChevronDown} from "lucide-react";
import { THEME } from "../constants/ui";
import { Skeleton } from "../ui/skeleton";

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[]
    data: TData[]
    filterKey?: string,
    isLoading?: boolean,
    onCellClick?: (value: any) => void
    clickableColumnId?: string
}

export function DataTable<TData, TValue> ({
    columns, data, filterKey, isLoading, onCellClick, clickableColumnId
}: DataTableProps<TData, TValue> ) {
    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
    
    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        onSortingChange: setSorting,
        getSortedRowModel: getSortedRowModel(),
        onColumnFiltersChange: setColumnFilters,
        getFilteredRowModel: getFilteredRowModel(),
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


    return (
        <div className="space-y-2">
            {/*Table Search*/}
            <div className="flex items-center justify-between gap-4">
                {filterKey && (
                    <div className="relative w-full max-w-sm">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <input
                            placeholder={`Filter ${filterKey}...`}
                            value={(table.getColumn(filterKey)?.getFilterValue() as string) ?? ""}
                            onChange={(event) =>
                                table.getColumn(filterKey)?.setFilterValue(event.target.value)
                            }
                            className={`${THEME.TextInput} pl-10 pr-10`}
                        />
                    </div>
                )}
            </div>

            {/*The main table*/}
            <div className="rounded-lg border bg-card shadow-sm overflow-x-auto">
                <Table className="w-full table-auto">
                    <TableHeader className="bg-muted/50">
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id} className="hover:bg-transparent">
                                {headerGroup.headers.map((header) => {
                                    const isSorted = header.column.getIsSorted();
                                    const SortingIcon = 
                                        isSorted === "asc" ? ChevronUp :
                                        isSorted === "desc" ? ChevronDown :
                                        ArrowUpDown;
                                    

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
                                                <span className="ml-2">
                                                    <SortingIcon />
                                                </span>
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
                        ): table.getRowModel().rows?.length ? (
                                table.getRowModel().rows.map((row) => (
                                    <TableRow key={row.id} className="hover:bg-muted/50 transition-colors">
                                        {row.getVisibleCells().map((cell) => {
                                            // Check if this specific cell should be clickable
                                            const isClickable = cell.column.id === clickableColumnId;
                                            
                                            return (
                                                <TableCell 
                                                    key={cell.id}
                                                    onClick={() => isClickable && onCellClick?.(cell.getValue())}
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
        </div>
    )
}