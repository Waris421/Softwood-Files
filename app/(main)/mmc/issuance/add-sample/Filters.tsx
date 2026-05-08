'use client';

import { DropdownOption } from "@/_components/Dropdown/types";

type FormSchema = {
    Inventories?: string[];
    Department?: string;
}

//data type of validation schema
type ValidationSchemaType = {
    [K in keyof FormSchema]?: (val: any, data: FormSchema) => string | null;
}

//Validation schema for the different fields of the form
const VALIDATION_SCHEMA: ValidationSchemaType = {}

interface FiltersOptions {
    [key: string]: DropdownOption[];
}

interface FiltersProps {
    onFilterSubmit: (data: FormSchema) => void;
    isLoading: boolean;
    options: FiltersOptions;
}


export default function Filters({onFilterSubmit, isLoading, options}: FiltersProps) {
    return (
        <div>Filters</div>
    )
}