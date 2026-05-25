'use client'

import { THEME } from "@/_components/constants/ui";
import { MultiDropdown, SingleDropdown } from "@/_components/Dropdown/Dropdown";
import { DropdownOption } from "@/_components/Dropdown/types";
import { FormField } from "@/_components/generic/FormItems";
import LoadingIcon from "@/_components/generic/Loading";
import MessageBox from "@/_components/generic/MessageBox";
import { Loader2, MapPinPlus, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

//The generic parts of the form
interface AssignmentFormProps {
    pk?: number;            //May be used in some forms
    baseApiUrl?: string;    //The api which communicates with backend
    redirectUrl?: string;   //The url on which to redirect on successful submission
}

//Schema of the form
type FormSchema = {
    Employee: string;
    Offices: string[];
}

//data type of validation schema
type ValidationSchemaType = {
    [K in keyof FormSchema]?: (val: any, data: FormSchema) => string | null;
}

//Validation schema for the different fields of the form
const VALIDATION_SCHEMA: ValidationSchemaType = {
    Employee: (val) => (!val ? 'Employee is required' : null),
    Offices: (val: string[]) => {
        if (!val || val.length === 0) {
            return 'At least one Office must be selected';
        }
        return null;
    }
}

export default function OfficeAssignForm ({
    baseApiUrl = "/api/hr/office/assign",
    redirectUrl = "/hr/office",
}: AssignmentFormProps) {
    const [formData, setFormData] = useState({
        Employee: '', Offices: [],
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [messageConfig, setMessageConfig] = useState<{ show: boolean; subject: string; message: string; action?: () => void; } | null>(null);
    const [options, setOptions] = useState({ employees: [], offices: []});
    const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);
    const [selectedOffices, setSelectedOffices] = useState<string[]>([]);
    const router = useRouter();

    async function fetchData(employeeCode: string|null) {
        if (employeeCode) {
            const params = new URLSearchParams({ employee: employeeCode });
            baseApiUrl += `?${params.toString()}`;
        }
        const response = await fetch(baseApiUrl);
        if (!response.ok) {
            throw new Error("Failed to load form data.");
        }

        const data = await response.json();

        const employeeOptions = data.employees.map((d: any) => ({label: String(d.label), value: String(d.value)}));
        const officeOptions = data.offices.map((d: any) => ({label: String(d.label), value: String(d.value)}));
        const selectedOffices = data.selectedOffices;
        
        return {
            employeeOptions: employeeOptions,
            officeOptions: officeOptions,
            selectedOffices: selectedOffices,
        };
    }

    const handleEmployeeChange = async (selectedEmployeeOption: DropdownOption|null) => {
        if (!selectedEmployeeOption) {
            handleInputChange('Employee', null);
            return ;
        }
        handleInputChange('Employee', selectedEmployeeOption.value);

        try {
            const data = await fetchData(selectedEmployeeOption.value);

            setSelectedOffices(data.selectedOffices);
        } catch (err: any) {
            console.log(err);
            setMessageConfig({ 
                show: true, 
                subject: "Fetch Error", 
                message: "Could not retrieve office assignment." 
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
                    offices: !selectedEmployee ? data.officeOptions : prev.offices
                }));
            } catch (err: any) {
                setMessageConfig({
                    show: true,
                    subject: "Fetch Error",
                    message: err.message,
                    action: () => {
                        window.location.reload();
                    }
                });
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
                // 2. Use 'formData[field]' directly; since 'val' is 'any' above, this works perfectly
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

        setIsSubmitting(true);
        try {
            const response = await fetch(baseApiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || error);
            }

            setMessageConfig({
                show: true,
                subject: 'Success',
                message: 'Saved Successfully',
                action: () => {
                    router.push(redirectUrl)
                }
            });
        } catch (err: any) {
            setMessageConfig({
                show: true,
                subject: "Error",
                message: `Saving Failed: ${err}`
            });
        } finally {
            setIsSubmitting(false);
        }
    }

    if (isLoading) return (
        <LoadingIcon />
    );
    
    return (
        <div className="max-w-2xl mx-auto p-6 bg-base-100 rounded-xl shadow-xl border border-base-200">
            {/* Office Assignment Form */}
            <div className="flex items-center gap-3 mb-8 border-b pb-4">
                <MapPinPlus className="text-primary w-6 h-6" />
                <h2 className="text-2xl font-bold">Office Assignment</h2>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField label='Employee' error={errors.Employee} required>
                    <SingleDropdown 
                        inputName='Employee'
                        placeholder='Select Employee'
                        isStatic
                        staticOptions={options.employees}
                        showValue={true}
                        widthClass='w-full'
                        onSelect={handleEmployeeChange}
                    />
                </FormField>

                <FormField label='Offices' error={errors.Offices} required>
                    <MultiDropdown 
                        inputName="Offices"
                        placeholder="Select Offices"
                        isStatic
                        staticOptions={options.offices}
                        widthClass="w-full"
                        defaultValues={selectedOffices}
                        onSelect={(selectedOptions: DropdownOption[]) => {
                            const values = selectedOptions.map(opt => opt.value);
                            handleInputChange('Offices', values);
                        }}
                    />
                </FormField>

                <div className="md:col-span-2 mt-4">
                    <button type="submit" className={`${THEME.ButtonBasic} w-full ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`} disabled={isSubmitting}>
                        {isSubmitting ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <Save className="w-4 h-4" />
                        )}
                        {isSubmitting ? 'Saving...' : 'Save Data'}
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