'use client';

import { useCallback, useEffect, useState } from "react";
import { useFormRegistry } from "./FormContext";
import { FormField } from "@/_components/generic/FormItems";
import { THEME } from "@/_components/constants/ui";
import { SingleDropdown } from "@/_components/Dropdown/Dropdown";

//Schema of the form
type FormSchema = {
    Code: string;
    Name: string;
    Notes: string;
    Category: string;
    Customer: string;
}

//data type of validation schema
type ValidationSchemaType = {
    [K in keyof FormSchema]?: (val: any, data: FormSchema) => string | null;
}

const VALIDATION_SCHEMA: ValidationSchemaType= {
    Code: (val) => (!val.trim() ? 'Code is required' : null),
    Name: (val) => (!val.trim() ? 'Name is required' : null),
    Category: (val) => (!val.trim() ? 'Category is required' : null),
    Customer: (val) => (!val.trim() ? 'Customer is required' : null),
}

const API_URL = '/api/merchandising/style/add'

export default function StyleForm({ children }: { children?: React.ReactNode }) {
    const { setFormData, registerValidator, setLoading, setError } = useFormRegistry();
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [options, setOptions] = useState({ categories: [], customers: [] });

    const [formData, setLocalFormData] = useState({
        Code: '', Name: '', Notes: '', Customer: '', Category: '',
    });

    //Sync local state to Parent Registry whenever formData changes
    useEffect(() => {
        setFormData('style', formData);
    }, [formData, setFormData])

    //Load the form data
    useEffect(() => {
        const loadInitialOptions = async() => {
            try {
                setLoading('style', true);

                const response = await fetch(API_URL);
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(`${errorData.details.message}`);
                }

                console.log('No error. Implement the rest of the code');
            } catch(err: any) {
                setError({
                    subject: "Fetch Error",
                    message: err.message,
                    action: () => window.location.reload()
                })
            } finally {
                setLoading('style', false);
            }
        }

        loadInitialOptions();
    }, []);

    //Helper function that triggers when user types something
    const handleInputChange = (field: keyof FormSchema, value: any) => {
        setLocalFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    }

    //Check the form for errors. Return true if there is an error.
    const validateForm = useCallback(() => {
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
    }, [formData]);

    //Register validation function with the parent.
    useEffect(() => {
        registerValidator('style', validateForm);
    }, [validateForm, registerValidator]);
    
    return (
        <form className="lg:col-span-2 grid grid-cols-1 md:grid-cols-6 gap-2">
            <FormField label="Code" error={errors.Code} required>
                <input type="text" placeholder="Style Code" className={THEME.TextInput} value={formData.Code}
                onChange={(e) => handleInputChange('Code', e.target.value)}/>
            </FormField>
            <FormField label="Name" error={errors.Name} required>
                <input type="text" placeholder="Style Name" className={THEME.TextInput} value={formData.Name}
                onChange={(e) => handleInputChange('Name', e.target.value)}/>
            </FormField>
            <FormField label="Notes" error={errors.Notes}>
                <input type="text" placeholder="If applicable" className={THEME.TextInput} value={formData.Notes}
                onChange={(e) => handleInputChange('Notes', e.target.value)}/>
            </FormField>
            <FormField label="Customer" error={errors.Customer} required>
                <SingleDropdown 
                    inputName='Customer' placeholder="Select Customer" isStatic staticOptions={options.customers} 
                    widthClass="w-full" onSelect={(val: any) => handleInputChange('Customer', val?.value)} 
                />
            </FormField>
            <FormField label="Category" error={errors.Category} required>
                <SingleDropdown 
                    inputName='Category' placeholder="Select an option" isStatic staticOptions={options.categories} 
                    widthClass="w-full" onSelect={(val: any) => handleInputChange('Category', val?.value)} 
                />
            </FormField>
            <div className="pb-1">
                {children}
            </div>
        </form>
    )
}