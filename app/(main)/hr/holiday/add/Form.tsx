'use client'

import { THEME } from "@/_components/constants/ui";
import { DatePicker } from "@/_components/Datepicker/Datepicker";
import { MultiDropdown } from "@/_components/Dropdown/Dropdown";
import { DropdownOption } from "@/_components/Dropdown/types";
import { FormField } from "@/_components/generic/FormItems";
import MessageBox from "@/_components/generic/MessageBox";
import { CalendarX, Check, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

//Schema of the form
type FormSchema = {
    Departments: string[];
    StartDate: string;
    EndDate: string;
    Description: string;
}

//data type of validation schema
type ValidationSchemaType = {
    [K in keyof FormSchema]?: (val: any, data: FormSchema) => string | null;
}

//Validation schema for the different fields of the form
const VALIDATION_SCHEMA: ValidationSchemaType = {
    Departments: (val: string[]) => {
        if (!val || val.length === 0) {
            return 'Select at least 1 department';
        }
        return null;
    },
    StartDate: (val) => (!val ? 'Start date is required' : null),
    EndDate: (val) => (!val ? 'End date is required' : null),
    Description: (val) => (!val ? 'Description is required' : null),
}

export default function HolidayForm() {
    const [formData, setFormData] = useState({
        StartDate: '', EndDate: '', Departments: [], Description: '',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isLoading, setIsLoading] = useState(true);
    const [messageConfig, setMessageConfig] = useState<{ show: boolean; subject: string; message: string; action?: () => void; } | null>(null);
    const [options, setOptions] = useState({ departments: []});
    const router = useRouter();

    useEffect(() => {
        const loadData = async () => {
            try {
                const response = await fetch(`/api/hr/holiday/add`);
                if (!response.ok) throw new Error(`Failed to load form data.`);

                const data = await response.json();

                const departmentOptions = data.departments.map((d: any) => ({label: String(d.label), value: String(d.value)}));

                setOptions(prev => ({
                    ...prev,

                    departments: departmentOptions,
                }));
            } catch (err: any) {
                setMessageConfig({ show: true, subject: "Fetch Error", message: err.message });
            } finally {
                setIsLoading(false);
            }
        }

        loadData();
    }, []);

    //Helper function that triggers when user types something
    const handleInputChange = (field: keyof FormSchema, value: any) => {
        //Update the data in the form object
        setFormData(prev => {
            const newData = { ...prev, [field]: value };

            // If StartDate changes and is now AFTER the existing EndDate, reset EndDate
            if (field === 'StartDate' && prev.EndDate && new Date(value) > new Date(prev.EndDate)) {
                newData.EndDate = '';
            }

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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        //Errors in the form
        if (!validateForm()) return ;

        //Form is valid now.
        const response = await fetch(`/api/hr/holiday/add`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData),
        });

        if (!response.ok) {
            const error = await response.json();
            setMessageConfig({
                show: true,
                subject: "Error",
                message: `Saving Failed: ${error.message || error}`
            });
            return ;
        }

        setMessageConfig({
            show: true,
            subject: "Success",
            message: `Saved Successfully`
        });

        router.push('/hr/worker');
    }
        
    if (isLoading) return (
        <div className="flex flex-col items-center justify-center p-20 gap-4">
            <Loader2 className="animate-spin text-primary" size={40} />
            <p className="text-sm font-medium">Loading form options...</p>
        </div>
    );

    return (
        <div className="max-w-2xl mx-auto p-6 bg-base-100 rounded-xl shadow-xl border border-base-200">
            {/* Holiday Definition Form */}
            <div className="flex items-center gap-3 mb-8 border-b pb-4">
                <CalendarX className="text-primary w-6 h-6" />
                <h2 className="text-2xl font-bold">Holiday Management</h2>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField label='Departments' error={errors.Departments} required>
                    <MultiDropdown 
                        inputName='Department'
                        placeholder='Select Departments'
                        isStatic
                        staticOptions={options.departments}
                        widthClass='w-full'
                        showValue={false}
                        onSelect={(selectedOptions: DropdownOption[]) => {
                            const values = selectedOptions.map(opt => opt.value);
                            handleInputChange('Departments', values);
                        }}
                    />
                </FormField>

                <FormField label="Start Date" error={errors.StartDate} required>
                    <DatePicker inputName='StartDate' value={formData.StartDate} required={true}
                        onChange={(val) => handleInputChange('StartDate', val)} />
                </FormField>

                <FormField label="End Date" error={errors.EndDate} required>
                    <DatePicker inputName='EndDate' value={formData.EndDate} required={true}
                        onChange={(val) => handleInputChange('EndDate', val)}
                        disabledDates={(date) => {
                            if (!formData.StartDate) return false;
                            return new Date(date) < new Date(formData.StartDate);
                        }}/>
                </FormField>

                <FormField label="Description" error={errors.Description} required>
                    <input type="text" placeholder="Description" className={THEME.TextInput} value={formData.Description}
                        onChange={(e) => handleInputChange('Description', e.target.value)} />
                </FormField>

                <div className="md:col-span-2 mt-4">
                    <button type="submit" className={`${THEME.ButtonBasic} w-full`}>
                        <Check className="w-4 h-4" />
                        Save Holiday
                    </button>
                </div>
            </form>

            {messageConfig?.show && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <MessageBox 
                        subject={messageConfig.subject}
                        message={messageConfig.message}
                        confirmText="Close"
                        onConfirm={() => {
                            if (messageConfig.action) messageConfig.action();
                            setMessageConfig(null);
                        }}  
                    />
                </div>
            )}
        </div>
    )
}