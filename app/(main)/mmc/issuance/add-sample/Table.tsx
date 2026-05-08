'use client';

import * as z from "zod";

interface TableProps {
  initialData: FormValues['items'];
  isLoading: boolean;
}

const rowSchema = z.object({
    InventoryCode: z.string().min(1, 'This is required'),
    InventoryName: z.string().optional(),
    Variant: z.string().optional(),
    Unit: z.string().optional(),
    InStock: z.number().min(0),
    ToIssue: z.number().min(0),
})

const formSchema = z.object({
    items: z.array(rowSchema),
})

type FormValues = z.input<typeof formSchema>;

export default function Table ({ initialData, isLoading }: TableProps) {
    return (
        <div>Table</div>
    )
}