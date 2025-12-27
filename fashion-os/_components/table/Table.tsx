'use client';

import * as React from "react"
import { ColumnDef, ColumnFiltersState, flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, SortingState, useReactTable } from "@tanstack/react-table";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Button } from "../ui/button";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

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
        <div className="space-y-4">
            {/*Table Search*/}
            {filterKey && (
                <input
                    placeholder={`Filter ${filterKey}...`}
                    value={(table.getColumn(filterKey)?.getFilterValue() as string) ?? ""}
                    onChange={(event) =>
                        table.getColumn(filterKey)?.setFilterValue(event.target.value)
                    }
                    className="max-w-sm"
                />
            )}
            {/*The main table*/}
            <div className="rounded-md border border-base-300">
                <Table>
                    <TableHeader className="bg-muted/50">
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <TableHead key={header.id} className="text-center font-bold">
                                        {header.isPlaceholder
                                        ? null
                                        : flexRender(
                                            header.column.columnDef.header,
                                            header.getContext()
                                            )}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center">
                                    Loading data...
                                </TableCell>
                            </TableRow>
                        ): table.getRowModel().rows?.length ? (
                                table.getRowModel().rows.map((row) => (
                                    <TableRow key={row.id}>
                                        {row.getVisibleCells().map((cell) => {
                                            // Check if this specific cell should be clickable
                                            const isClickable = cell.column.id === clickableColumnId;
                                            
                                            return (
                                                <TableCell 
                                                    key={cell.id}
                                                    onClick={() => {
                                                        if (isClickable && onCellClick) {
                                                            // Pass the cell value to the function
                                                            onCellClick(cell.getValue() as TValue);
                                                        }
                                                    }}
                                                    className={`
                                                        text-center align-middle whitespace-normal wrap-break-word min-w-37.5
                                                        ${isClickable ? "cursor-pointer hover:underline text-blue-600 font-medium" : ""}
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
                                <TableCell colSpan={columns.length} className="h-24 text-center">
                                    No results.
                                </TableCell>
                            </TableRow>
                        )}                        
                    </TableBody>
                </Table>
            </div>
            {/*Table Pagination*/}
            <div className="flex items-center justify-center space-x-6 py-4">
                <div className="flex items-center space-x-2">
                    {/* First Page */}
                    <Button
                        variant="outline"
                        className="h-8 w-8 p-0"
                        onClick={() => table.setPageIndex(0)}
                        disabled={!table.getCanPreviousPage()}
                    >
                        <span className="sr-only">First page</span>
                        <ChevronsLeft className="h-4 w-4" />
                    </Button>

                    {/* Previous Page */}
                    <Button
                        variant="outline"
                        className="h-8 w-8 p-0"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                    >
                        <span className="sr-only">Previous page</span>
                        <ChevronLeft className="h-4 w-4" />
                    </Button>

                    {/* Page Indicator */}
                    <div className="flex items-center justify-center text-sm font-medium">
                        Page {table.getPageCount() === 0 ? 0 : table.getState().pagination.pageIndex + 1} of{" "}
                        {table.getPageCount()}
                    </div>
                    <div className="flex items-center space-x-2">
                        {/* Next Page */}
                        <Button
                            variant="outline"
                            className="h-8 w-8 p-0"
                            onClick={() => table.nextPage()}
                            disabled={!table.getCanNextPage()}
                        >
                            <span className="sr-only">Next page</span>
                            <ChevronRight className="h-4 w-4" />
                        </Button>

                        {/* Last Page */}
                        <Button
                            variant="outline"
                            className="h-8 w-8 p-0"
                            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                            disabled={!table.getCanNextPage()}
                        >
                            <span className="sr-only">Last page</span>
                            <ChevronsRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}