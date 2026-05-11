'use client';

import { useCallback, useEffect, useState } from "react";
import { useFormRegistry } from "./FormContext";
import { FormField } from "@/_components/generic/FormItems";
import { THEME } from "@/_components/constants/ui";
import { SingleDropdown, SingleDropdownAsync } from "@/_components/Dropdown/Dropdown";

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

const CUSTOMER_OPTIONS_URL = '/api/options/customers';

const FORM_NAME_WITH_PARENT = 'style';

const CATEGORY_OPTIONS = [
    {'value': 'Man', 'label': 'Man'},
    {'value': 'Woman', 'label': 'Woman'},
    {'value': 'Boy', 'label': 'Boy'},
    {'value': 'Girl', 'label': 'Girl'},
    {'value': 'Baby', 'label': 'Baby'},
]

export default function StyleForm({ children }: { children?: React.ReactNode }) {
    const { setFormData, registerValidator, getCombinedData, initialData } = useFormRegistry();
    const [errors, setErrors] = useState<Record<string, string>>({});

    const [formData, setLocalFormData] = useState({
        Code: '', Name: '', Notes: '', Customer: '', Category: '',
    });

    //Pull default values at the start from parent
    useEffect(() => {
        const initialValues = getCombinedData()[FORM_NAME_WITH_PARENT];
        if (initialValues) {
            setLocalFormData(prev => ({
                ...prev,
                ...initialValues
            }));
        }
    }, [initialData, getCombinedData]);

    //Sync local state to Parent Registry whenever formData changes
    useEffect(() => {
        setFormData(FORM_NAME_WITH_PARENT, formData);
    }, [formData, setFormData]);

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
        registerValidator(FORM_NAME_WITH_PARENT, validateForm);
    }, [validateForm, registerValidator]);
    
    return (
        <form className="lg:col-span-2 grid grid-cols-1 md:grid-cols-6 gap-2">
            <FormField label="Code" error={errors.Code} required>
                <input type="text" readOnly placeholder="Style Code" className={THEME.TextInputReadOnly} value={formData.Code}
                onChange={(e) => handleInputChange('Code', e.target.value)}/>
            </FormField>
            <FormField label="Name" error={errors.Name} required>
                <input type="text" placeholder="Style Name" className={THEME.TextInput} value={formData.Name}
                onChange={(e) => handleInputChange('Name', e.target.value)}/>
            </FormField>
            <FormField label="Notes" error={errors.Notes}>
                <input type="text" placeholder="If needed" className={THEME.TextInput} value={formData.Notes}
                onChange={(e) => handleInputChange('Notes', e.target.value)}/>
            </FormField>
            <FormField label="Customer" error={errors.Customer} required>
                <SingleDropdownAsync
                    inputName='Customer' placeholder="Select Customer" apiUrl={CUSTOMER_OPTIONS_URL} 
                    widthClass="w-full" onSelect={(val: any) => handleInputChange('Customer', val?.value)} 
                    defaultValue={formData.Customer}
                />
            </FormField>
            <FormField label="Category" error={errors.Category} required>
                <SingleDropdown
                    inputName='Category' placeholder="Select an option" staticOptions={CATEGORY_OPTIONS} 
                    widthClass="w-full" onSelect={(val: any) => handleInputChange('Category', val?.value)} 
                    defaultValue={formData.Category}
                />
            </FormField>
            <div className="pb-1">
                {children}
            </div>
        </form>
    )
}