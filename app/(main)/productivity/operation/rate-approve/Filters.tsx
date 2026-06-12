'use client';

import { THEME } from "@/_components/constants/ui";
import { MultiDropdown } from "@/_components/Dropdown/Dropdown";
import { DropdownOption } from "@/_components/Dropdown/types";
import { FormField } from "@/_components/generic/FormItems";
import { CheckCircle2Icon, Filter, RefreshCw } from "lucide-react";
import { useState } from "react";

interface FiltersOptions {
    [key: string]: DropdownOption[];
}

type FormSchema = {
    Operations: string[];
}

//data type of validation schema
type ValidationSchemaType = {
    [K in keyof FormSchema]?: (val: any, data: FormSchema) => string | null;
}

//Validation schema for the different fields of the form
const VALIDATION_SCHEMA: ValidationSchemaType = {}

interface FiltersProps {
    onFilterSubmit: (data: FormSchema) => void;
    onDataChange: (data: FormSchema) => void;
    onTableSubmit: () => void;
    onPageRefresh: () => void;
    isLoading: boolean;
    options: FiltersOptions;
}

export default function Filters({
    onFilterSubmit, onPageRefresh,onDataChange, onTableSubmit, isLoading, options
}: FiltersProps) {
    const [formData, setFormData] = useState({
        Operations: [],
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const {opFilterOptions=[]} = options;

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
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField label='Operations' error={errors.Operations}>
                    <MultiDropdown 
                        inputName="Operations"
                        placeholder='select if needed'
                        isStatic
                        staticOptions={opFilterOptions}
                        widthClass='w-full'
                        showValue={false}
                        onSelect={(selectedOptions: DropdownOption[]) => {
                            const values = selectedOptions.map(opt => opt.value);
                            handleInputChange('Operations', values);
                        }}
                        defaultValues={formData.Operations}
                    />
                </FormField> 

                <div className="flex flex-row gap-2 pb-1">
                    <button
                        type="submit"
                        className={`${THEME.ButtonBasic} flex-1 h-12 mt-2 flex items-center justify-center gap-2 ${isLoading ? `opacity-70 cursor-not-allowed` : ''}`}
                    >
                        <Filter className={`h-4 w-4 ${isLoading ? 'animate-bounce' : ''}`} />
                        {isLoading ? 'Filtering...' : 'Filter'}
                    </button>
                    <button
                        type="button"
                        className={`${THEME.ButtonBasic} flex-1 h-12 mt-2 flex items-center justify-center gap-2 ${isLoading ? `opacity-70 cursor-not-allowed` : ''}`}
                        onClick={onPageRefresh}
                    >
                        <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                        {isLoading ? 'Refreshing...' : 'Refresh'}
                    </button>
                    <button
                        type="button"
                        className={`${THEME.ButtonSecondary} flex-1 h-12 mt-2 flex items-center justify-center gap-2 ${isLoading ? `opacity-70 cursor-not-allowed` : ''}`}
                        onClick={onTableSubmit}
                    >
                        <CheckCircle2Icon className={`h-4 w-4`} />
                        {isLoading ? 'Submitting...' : 'Approve Selected'}
                    </button>
                </div>
            </form>
        </div>
    )
}