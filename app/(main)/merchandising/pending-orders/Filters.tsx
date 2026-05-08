'use client';

import { THEME } from "@/_components/constants/ui";
import { MultiDropdown, MultiDropdownAsync, SingleDropdown, SingleDropdownAsync } from "@/_components/Dropdown/Dropdown";
import { DropdownOption } from "@/_components/Dropdown/types";
import { FormField } from "@/_components/generic/FormItems";
import { RefreshCw } from "lucide-react";
import { useState } from "react";

type FormSchema = {
    StartingOrder: string;
    EndingOrder: string;
    Customers?: string[];
    Inventories?: string[];
    Type?: string
}

//data type of validation schema
type ValidationSchemaType = {
    [K in keyof FormSchema]?: (val: any, data: FormSchema) => string | null;
}

//Validation schema for the different fields of the form
const VALIDATION_SCHEMA: ValidationSchemaType = {
    StartingOrder: (val) => (!val ? 'This is required' : null),
    EndingOrder: (val) => (!val ? 'This is required' : null),
}

interface FiltersOptions {
    [key: string]: DropdownOption[];
}

interface FiltersProps {
    onFilterSubmit: (data: FormSchema) => void;
    isLoading: boolean;
    options: FiltersOptions;
}

const ORDER_OPTIONS_URL = '/api/options/work-orders?limit=15';
const CUSTOMER_OPTIONS_URL = '/api/options/customers';

export default function Filters({onFilterSubmit, isLoading, options}: FiltersProps) {
    const [formData, setFormData] = useState({
        StartingOrder: '', EndingOrder: '', Customers: [], Inventories: [], Type: ''
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const {invFilterOptions=[], typeFilterOptions=[]} = options;

    //Helper function that triggers when user types something
    const handleInputChange = (field: keyof FormSchema, value: any) => {
        //Update the data in the form object
        setFormData(prev => {
            const newData = { ...prev, [field]: value };

            return newData;
        });

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
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-6 gap-6">
                <FormField label='Starting Order' error={errors.StartingOrder} required>
                    <SingleDropdownAsync 
                        inputName="StartingOrder"
                        placeholder="select an order"
                        apiUrl={ORDER_OPTIONS_URL}
                        widthClass="w-full"
                        onSelect={(val: any) => handleInputChange('StartingOrder', val?.value)} 
                    />
                </FormField>

                <FormField label='Ending Order' error={errors.EndingOrder} required>
                    <SingleDropdownAsync 
                        inputName="EndingOrder"
                        placeholder="select an order"
                        apiUrl={ORDER_OPTIONS_URL}
                        widthClass="w-full"
                        onSelect={(val: any) => handleInputChange('EndingOrder', val?.value)} 
                    />
                </FormField>

                <FormField label='Customers' error={errors.Customer}>
                    <MultiDropdownAsync 
                        inputName="Customers"
                        placeholder="select if needed"
                        apiUrl={CUSTOMER_OPTIONS_URL}
                        widthClass="w-full"
                        onSelect={(selectedOptions: DropdownOption[]) => {
                            const values = selectedOptions.map(opt => opt.value);
                            handleInputChange('Customers', values);
                        }} 
                    />
                </FormField>

                <FormField label='Inventories' error={errors.Inventories}>
                    <MultiDropdown 
                        inputName="Inventories"
                        placeholder='select if needed'
                        isStatic
                        staticOptions={invFilterOptions}
                        widthClass='w-full'
                        showValue={false}
                        onSelect={(selectedOptions: DropdownOption[]) => {
                            const values = selectedOptions.map(opt => opt.value);
                            handleInputChange('Inventories', values);
                        }}
                        defaultValues={formData.Inventories}
                    />
                </FormField>    
                
                <FormField label='Type' errors={errors.Type}>
                        <SingleDropdown 
                            inputName="Type"
                            placeholder="select if needed"
                            isStatic
                            staticOptions={typeFilterOptions}
                            widthClass="w-full"
                            onSelect={(val: any) => handleInputChange('Type', val?.value)} 
                            defaultValue={formData.Type}
                        />
                </FormField>            

                <div className="pb-1">
                    <button
                        type="submit"
                        className={`${THEME.ButtonBasic} w-full h-15 mt-2 flex items-center justify-center gap-2 ${isLoading ? `opacity-70 cursor-not-allowed` : ''}`}
                    >
                        <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                        {isLoading ? 'Searching...' : 'Search'}
                    </button>
                </div>
            </form>
        </div>
    )
}