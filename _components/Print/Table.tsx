'use client';

import * as React from "react";
import { ColumnDef, flexRender, Row } from "@tanstack/react-table";

interface PrintTableProps<TData> {
  rows: Row<TData>[];
  columns: ColumnDef<TData, any>[];
  pageHeader?: string;
}

export const PrintTable = React.forwardRef<HTMLDivElement, PrintTableProps<any>>(
    ({ rows, columns, pageHeader='' }, ref) => {
        return (
            <div ref={ref} className="p-8 w-full print-container">
                <h1 className="text-2xl font-bold mb-4 text-center">{pageHeader}</h1>
                <p className="mb-4 text-sm text-gray-500">
                    Generated on: {new Date().toLocaleDateString()}
                </p>

                <table className="w-full table-fixed border-collapse">
                    <thead>
                        <tr className="border-b-2 border-black">
                            {columns.map((column, index) => (
                                <th 
                                key={index} 
                                className="py-3 px-2 text-left text-xs font-bold uppercase"
                                >
                                {typeof column.header === "string" 
                                    ? column.header 
                                    : (column.id || `Col ${index}`)}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((row) => (
                            <tr key={row.id} className="border-b border-gray-200 break-inside-avoid">
                                {row.getVisibleCells().map((cell) => (
                                    <td key={cell.id} className="py-2 px-2 text-sm">
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
                
                
                <div className="mt-8 text-right text-xs text-gray-400">
                    Total Records: {rows.length}
                </div>
            </div>
        )
    }
)

PrintTable.displayName = 'PrintTable';