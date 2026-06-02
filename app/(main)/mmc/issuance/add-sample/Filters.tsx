'use client';

import { THEME } from "@/_components/constants/ui";
import { MultiDropdown, SingleDropdown, SingleDropdownAsync } from "@/_components/Dropdown/Dropdown";
import { DropdownOption } from "@/_components/Dropdown/types";
import { FormField } from "@/_components/generic/FormItems";
import { PackageCheck, RefreshCw } from "lucide-react";
import { useState } from "react";

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
    onDataChange: (data: FormSchema) => void;
    onTableSubmit: () => void;
    isLoading: boolean;
    options: FiltersOptions;
}

const DEPARTMENT_OPTIONS_URL = '/api/options/departments';

export default function Filters({
    onFilterSubmit, onDataChange, onTableSubmit, isLoading, options
}: FiltersProps) {
    const [formData, setFormData] = useState({
        Inventories: [], Department: '',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const {invFilterOptions=[]} = options;

    //Helper function that triggers when user types something
    const handleInputChange = (field: keyof FormSchema, value: any) => {
        const newData = { ...formData, [field]: value };

        setFormData(newData);
        onDataChange(newData);

        //Clear the error on the field if there was one previously
        if (errors[field]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    }

    //Check the form for errors. Return true if there is an error
    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        (Object.keys(VALIDATION_SCHEMA) as (keyof FormSchema)[]).forEach((field) => {
            const errorGetter = VALIDATION_SCHEMA[field];
            
            if (errorGetter) {
                const errorMessage = errorGetter(formData[field], formData);
                if (errorMessage) newErrors[field] = errorMessage;
            }
        });

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        //Errors in the form
        if (validateForm()) {
            onFilterSubmit(formData);
        }
    }

    return (
        <div className="sticky top-16 z-30 bg-gray-100 dark:bg-gray-600 opacity-90 border-b border-base-200 px-4">
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField label='Inventory' error={errors.Inventories}>
                    <MultiDropdown 
                        inputName="Inventories"
                        placeholder='select if needed'
                        isStatic
                        staticOptions={invFilterOptions}
                        widthClass='w-full'
                        showValue={true}
                        onSelect={(selectedOptions: DropdownOption[]) => {
                            const values = selectedOptions.map(opt => opt.value);
                            handleInputChange('Inventories', values);
                        }}
                        defaultValues={formData.Inventories}
                    />
                </FormField>

                <FormField label='Department' error={errors.Department}>
                    <SingleDropdownAsync
                        inputName="Department"
                        apiUrl={DEPARTMENT_OPTIONS_URL}
                        widthClass="w-full"
                        onSelect={(val: any) => handleInputChange('Department', val?.value)}
                    />
                </FormField>
                <div className="flex flex-row gap-2 pb-1">
                    <button
                        type="submit"
                        className={`${THEME.ButtonBasic} flex-1 h-12 mt-2 flex items-center justify-center gap-2 ${isLoading ? `opacity-70 cursor-not-allowed` : ''}`}
                    >
                        <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                        {isLoading ? 'Searching...' : 'Search'}
                    </button>
                    <button
                        type="button"
                        className={`${THEME.ButtonSecondary} flex-1 h-12 mt-2 flex items-center justify-center gap-2 ${isLoading ? `opacity-70 cursor-not-allowed` : ''}`}
                        onClick={onTableSubmit}
                    >
                        <PackageCheck className={`h-4 w-4`} />
                        Issue Selected
                    </button>
                </div>
            </form>
        </div>
    )
}