'use client'

import { THEME } from "@/_components/constants/ui";
import DatePicker from "@/_components/Datepicker/Datepicker";
import { SingleDropdown } from "@/_components/Dropdown/Dropdown";
import { DropdownOption } from "@/_components/Dropdown/types";
import { FormField } from "@/_components/generic/FormItems";
import MessageBox from "@/_components/generic/MessageBox";
import { CarIcon, Check, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

//Schema of the form
type FormSchema = {
    Employee: string;
    OffSaturday: string;
}

//data type of validation schema
type ValidationSchemaType = {
    [K in keyof FormSchema]?: (val: any, data: FormSchema) => string | null;
}

//Validation schema for the different fields of the form
const VALIDATION_SCHEMA: ValidationSchemaType = {
    Employee: (val) => (!val ? 'Employee is required' : null),
    OffSaturday: (val) => (!val ? 'This date is required' : null),
}
export default function SaturdayForm() {
    const [formData, setFormData] = useState({
        Employee: '', OffSaturday: '',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isLoading, setIsLoading] = useState(true);
    const [messageConfig, setMessageConfig] = useState<{ show: boolean; subject: string; message: string; action?: () => void; } | null>(null);
    const [options, setOptions] = useState({ employees: []});
    const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);
    const router = useRouter();

    async function fetchData(employeeCode: string|null) {
        let path = '/api/hr/workers/set-saturday';

        if (employeeCode) {
            const params = new URLSearchParams({ employee: employeeCode });
            path += `?${params.toString()}`;
        }

        const response = await fetch(path);
        if (!response.ok) {
            throw new Error("Failed to load form data.");
        }

        const data = await response.json();

        const employeeOptions = data.employees.map((d: any) => ({label: String(d.label), value: String(d.value)}));
        const offSaturday = data.OffSaturday;

        return {
            employeeOptions: employeeOptions,
            offSaturday: offSaturday,
        };
    }

    const handleEmployeeChange = async (selectedEmployeeOption: DropdownOption) => {
        handleInputChange('Employee', selectedEmployeeOption.value);
        
        try {
            const data = await fetchData(selectedEmployeeOption.value);

            if (data.offSaturday) {
                handleInputChange('OffSaturday', data.offSaturday);
            }
        } catch (err: any) {
            console.log(err);
            setMessageConfig({ 
                show: true, 
                subject: "Fetch Error", 
                message: "Could not retrieve employee schedule." 
            });
        }
    }

    useEffect(() => {
        const loadData = async () => {
            try {
                const data = await fetchData(selectedEmployee);

                setOptions(prev => ({
                    ...prev,
                    
                    // Only update employees on initial load (when employee is null)
                    employees: !selectedEmployee ? data.employeeOptions : prev.employees,
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
        const response = await fetch(`/api/hr/workers/set-saturday`, {
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
            {/* Saturday Definition Form */}
            <div className="flex items-center gap-3 mb-8 border-b pb-4">
                <CarIcon className="text-primary w-6 h-6" />
                <h2 className="text-2xl font-bold">Off Saturday Management</h2>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField label='Employee' error={errors.Employee} required>
                    <SingleDropdown 
                        inputName = 'Employee'
                        placeholder='Select Employee'
                        isStatic
                        staticOptions={options.employees}
                        showValue={true}
                        widthClass='w-full'
                        onSelect={handleEmployeeChange}
                    />
                </FormField>

                <FormField label="Off Saturday" error={errors.OffSaturday} required>
                    <DatePicker inputName='EndDate' value={formData.OffSaturday} required={true}
                        placeholder="Pick Any Off Saturday"
                        onChange={(val) => handleInputChange('OffSaturday', val)}
                        disabledDates={(date: Date) => (date.getDay() !== 6)}
                    />
                </FormField>

                <div className="md:col-span-2 mt-4">
                    <button type="submit" className={`${THEME.ButtonBasic} w-full`}>
                        <Check className="w-4 h-4" />
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