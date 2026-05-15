'use client';

import { THEME } from "@/_components/constants/ui";
import { DatePicker } from "@/_components/Datepicker/Datepicker";
import { MultiDropdown, SingleDropdown } from "@/_components/Dropdown/Dropdown";
import { DropdownOption } from "@/_components/Dropdown/types";
import { FormField } from "@/_components/generic/FormItems";
import MessageBox from "@/_components/generic/MessageBox";
import TimePicker from "@/_components/Timepicker/Timepicker.";
import { Clock9, Loader2, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

//Schema of the form
type FormSchema = {
    StartDate: string,
    EndDate: string,
    StartTime: string,
    EndTime: string,
    Employees: string[],
}

//data type of validation schema
type ValidationSchemaType = {
    [K in keyof FormSchema]?: (val: any, data: FormSchema) => string | null;
}

//Validation schema for the different fields of the form
const VALIDATION_SCHEMA: ValidationSchemaType = {
    StartDate: (val) => (!val ? 'Start date is required' : null),
    StartTime: (val) => (!val ? 'Start time is required' : null),
    EndTime: (val) => (!val ? 'End time is required' : null),
    Employees: (val: string[]) => {
        if (!val || val.length === 0) {
            return 'At least one employee must be selected';
        }
        return null;
    }
}

export default function ShiftDefineForm() {
    const [formData, setFormData] = useState({
        StartDate: '', EndDate: '',StartTime: '', EndTime: '', Employees: [],
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isLoading, setIsLoading] = useState(true);
    const [messageConfig, setMessageConfig] = useState<{ show: boolean; subject: string; message: string; action?: () => void; } | null>(null);
    const [options, setOptions] = useState({ employees: [], departments: []});
    const [selectedDepartment, setSelectedDepartment] = useState<string>('');
    const router = useRouter();

    async function fetchOptions(department: String) {
        const response = await fetch(`/api/hr/workers/shift-define?department=${department}`);
        if (!response.ok) throw new Error("Failed to load form data.");

        const data = await response.json();

        const departmentOptions = data.departments.map((d: any) => ({label: String(d.label), value: String(d.value)}));
        const employeeOptions = data.employees.map((d: any) => ({label: String(d.label), value: String(d.value)}));

        return {
            departmentOptions: departmentOptions,
            employeeOptions: employeeOptions,
        };
    }

    const updateEmployeeOptions = async (department: string) => {
        try {
            const data = await fetchOptions(department);
            setOptions(prev => ({
                ...prev,
                
                // Only update departments on initial load (when dept is empty)
                departments: department === '' ? data.departmentOptions : prev.departments,
                employees: data.employeeOptions,
            }));
        } catch (err: any) {
            setMessageConfig({ show: true, subject: "Fetch Error", message: err.message });
        }
    }

    useEffect(() => {
        const loadData = async () => {
            if (options.departments.length === 0) setIsLoading(true);

            await updateEmployeeOptions(selectedDepartment);

            setIsLoading(false);
        }
        loadData();
    }, []);

    //Helper function that triggers when user types something
    const handleInputChange = (field: keyof FormSchema, value: any) => {
        //Update the data in the form object
        setFormData(prev => ({ ...prev, [field]: value }));

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
                // 2. Use 'formData[field]' directly; since 'val' is 'any' above, this works perfectly
                const errorMessage = errorGetter(formData[field], formData);
                if (errorMessage) newErrors[field] = errorMessage;
            }
        });

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleDepartmentChange = useCallback(async (selectedOption: DropdownOption | null) => {
        const newVal = selectedOption?.value || '';

        //Return if the same department is selected again.
        if (newVal === selectedDepartment) return;

        setSelectedDepartment(newVal);

        //Clear the previously selected employees
        setFormData(prev => ({ ...prev, Employees: [] }));

        try {
            await updateEmployeeOptions(newVal);
        } catch (err) {
            console.error(err);
        }
    }, [selectedDepartment])

    //Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        //Errors in the form
        if (!validateForm()) return ;

        //Form is valid now.
        const response = await fetch(`/api/hr/workers/shift-define`, {
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
            {/* Shift Definition Form */}
            <div className="flex items-center gap-3 mb-8 border-b pb-4">
                <Clock9 className="text-primary w-6 h-6" />
                <h2 className="text-2xl font-bold">Employee Shift Management</h2>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField label="Department" error={errors.Department}>
                    <SingleDropdown
                        inputName='Department'
                        placeholder="Select Department" 
                        isStatic
                        staticOptions={options.departments} 
                        widthClass="w-full"
                        onSelect={handleDepartmentChange}
                    />
                </FormField>

                <FormField label='Employees' error={errors.Employee} required>
                    <MultiDropdown 
                        inputName='Employees'
                        placeholder='Select an Employee'
                        isStatic
                        staticOptions={options.employees}
                        widthClass='w-full'
                        showValue={true}
                        onSelect={(selectedOptions: DropdownOption[]) => {
                            const values = selectedOptions.map(opt => opt.value);
                            handleInputChange('Employees', values);
                        }}
                    />
                </FormField>

                <FormField label="Start Date" error={errors.StartDate} required>
                    <DatePicker inputName='StartDate' value={formData.StartDate} required={true}
                                            onChange={(val) => handleInputChange('StartDate', val)} />
                </FormField>

                <FormField label="End Date (if applicable)" error={errors.EndDate}>
                    <DatePicker inputName='EndDate' value={formData.EndDate} required={true}
                                            onChange={(val) => handleInputChange('EndDate', val)} />
                </FormField>

                <FormField label="Start Time" error={errors.StartTime} required>
                    <TimePicker inputName="StartTime" value={formData.StartTime} required={true} startingHour={8}
                                            onChange={(val) => handleInputChange('StartTime', val)}/>
                </FormField>

                <FormField label="End Time" error={errors.EndTime} required>
                    <TimePicker inputName="EndTime" value={formData.EndTime} required={true}
                                            onChange={(val) => handleInputChange('EndTime', val)}/>
                </FormField>

                <div className="md:col-span-2 mt-4">
                    <button type="submit" className={`${THEME.ButtonBasic} w-full`}>
                        <Save className="w-4 h-4" />
                        Save Data
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