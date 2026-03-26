'use client';

import { THEME } from "@/_components/constants/ui";
import DatePicker from "@/_components/Datepicker/Datepicker";
import { SingleDropdown } from "@/_components/Dropdown/Dropdown";
import { FormField } from "@/_components/generic/FormItems";
import MessageBox from "@/_components/generic/MessageBox";
import { Loader2, Save, UserCheck, UserRoundPen } from "lucide-react";
import { useEffect, useState } from "react";

interface FormProps {
    pk: number;
}

//Schema of the form
type FormSchema = {
    id: string;
    Name: string;
    FatherSpouse: string;
    Department: string;
    SubDepartment: string;
    Manager: string;
    DateOfBirth: string;
    DateOfLeaving: string;
    Gender: string;
    CreateAccount: boolean;
    Username: string;
    Email: string;
    CNIC: string;
}

//data type of validation schema
type ValidationSchemaType = {
    [K in keyof FormSchema]?: (val: any, data: FormSchema) => string | null;
}

//Validation schema for the different fields of the form
const VALIDATION_SCHEMA: ValidationSchemaType= {
    Name: (val) => (!val.trim() ? 'Name is required' : null),
    Department: (val) => (!val ? 'Please select a department' : null),
    DateOfBirth: (val) => (!val ? 'Date of birth is required' : null),
    Username: (val, data) => (data.CreateAccount && !val ? 'Username is required' : null),
    Email: (val, data) => {
        if (!data.CreateAccount) return null;
        if (!val) return 'Email is required';
        if (!/\S+@\S+\.\S+/.test(val)) return 'Invalid email format';
        return null;
    }
}

export default function WorkerUpdateForm({ pk }: FormProps) {
    const [formData, setFormData] = useState({
        id: '', Name: '', FatherSpouse: '',Department: '', SubDepartment: '', Manager: '',
        DateOfBirth: '', DateOfLeaving: '', Gender: '', CreateAccount: false, Username: '',
        Email: '', CNIC: ''
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isLoading, setIsLoading] = useState(true);
    const [messageConfig, setMessageConfig] = useState<{ show: boolean; subject: string; message: string; action?: () => void; } | null>(null);
    const [options, setOptions] = useState({ departments: [], managers: [] });

     useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch(`/api/hr/workers/${pk}/update`);

                if (!res.ok) throw new Error("Failed to load worker details.");

                const data = await res.json();

                setOptions({
                    departments: data.departments.map((d: any) => ({ label: String(d.label), value: String(d.value) })),
                    managers: data.managers.map((m: any) => ({ label: String(m.label), value: String(m.value) }))
                });

                setFormData(data.employeeData);
            } catch (err: any) {
                setMessageConfig({ show: true, subject: "Fetch Error", message: err.message });
            } finally {
                setIsLoading(false);
            }
        }

        fetchData();
     }, [pk]);

    //Helper function to format the CNIC in a readable format
    const formatCNIC = (val: string) => {
        //Remove non-digits
        const digits = val.replace(/\D/g, '');
        
        if (digits.length <= 5) {
            return digits;
        } else if (digits.length <= 12){
            return `${digits.slice(0, 5)}-${digits.slice(5)}`;
        } else {
            return `${digits.slice(0, 5)}-${digits.slice(5, 12)}-${digits.slice(12, 13)}`;
        }
    }

    //Helper function that triggers when user types something
    const handleInputChange = (field: keyof FormSchema, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    }

    //Helper to calculate the latest availabe dates
    function calculateLegalAge() {
        const eighteenYearsAgo = new Date();
        eighteenYearsAgo.setFullYear(eighteenYearsAgo.getFullYear() - 18);
        return eighteenYearsAgo;
    }

    //Helper function to calculate the option label from the value
    const getOptionLabel = (value: string, optionsList: { label: string; value: string }[]) => {
        return optionsList.find(opt => opt.value === value)?.label || value;
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

    //Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        //Errors in the form
        if (!validateForm()) return ;

        //Form is valid now.
        const response = await fetch(`/api/hr/workers/${pk}/update`, {
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
        return ;
    }

    if (isLoading) return (
        <div className="flex flex-col items-center justify-center p-20 gap-4">
            <Loader2 className="animate-spin text-primary" size={40} />
            <p className="text-sm font-medium">Loading worker data...</p>
        </div>
    );

    return (
        <div className="max-w-2xl mx-auto p-6 bg-base-100 rounded-xl shadow-xl border border-base-200">
            {/* Employee Update form */}
            <div className="flex items-center gap-3 mb-8 border-b pb-4">
                <UserRoundPen className="text-primary w-6 h-6" />
                <h2 className="text-2xl font-bold">Updating Employee Data</h2>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField label="Code" error={errors.id}>
                    <input type="text" className={THEME.TextInput} value={formData.id}
                        onChange={(e) => handleInputChange('id', e.target.value)} readOnly/>
                </FormField>
                <FormField label="Name" error={errors.Name} required>
                    <input type="text" className={THEME.TextInput} value={formData.Name}
                        onChange={(e) => handleInputChange('Name', e.target.value)} />
                </FormField>
                <FormField label="Father/Spouse" error={errors.FatherSpouse} required>
                    <input type="text" placeholder="Full Name" className={THEME.TextInput} value={formData.FatherSpouse}
                        onChange={(e) => handleInputChange('FatherSpouse', e.target.value)} />
                </FormField>

                <FormField label="Date of Birth" error={errors.DateOfBirth} required>
                    <DatePicker inputName='DateOfBirth' value={formData.DateOfBirth} required={true}
                        disabledDates={(date) => date > calculateLegalAge()} onChange={(val) => handleInputChange('DateOfBirth', val)} />
                </FormField>

                <FormField label="Date of Leaving">
                    <DatePicker inputName='DateOfLeaving' value={formData.DateOfLeaving} required={true}
                        onChange={(val) => handleInputChange('DateOfLeaving', val)} />
                </FormField>

                <FormField label="Department" error={errors.Department} required>
                    <SingleDropdown
                        inputName='Department'
                        placeholder="Select Department"
                        isStatic 
                        staticOptions={options.departments}
                        defaultValue={formData.Department}
                        widthClass="w-full"
                        onSelect={(val: any) => handleInputChange('Department', val?.value)}/>
                </FormField>

                <FormField label="Sub Department">
                    <input type="text" className={THEME.TextInput} value={formData.SubDepartment}
                        onChange={(e) => handleInputChange('SubDepartment', e.target.value)} />
                </FormField>

                <FormField label="Manager" error={errors.Manager}>
                    <SingleDropdown 
                        inputName='Manager'
                        placeholder="Select Manager" 
                        isStatic
                        staticOptions={options.managers}
                        defaultValue={formData.Manager}
                        widthClass="w-full"
                        onSelect={(val: any) => handleInputChange('Manager', val?.value)}
                    />
                </FormField>

                <FormField label="Gender" error={errors.Gender}>
                    <SingleDropdown 
                        inputName='Gender' 
                        placeholder="Select option"
                        isStatic
                        widthClass="w-full"
                        staticOptions={[{ label: 'Male', value: 'Male' }, { label: 'Female', value: 'Female' }]}
                        defaultValue={formData.Gender}
                        onSelect={(val: any) => handleInputChange('Gender', val?.value)}
                    />
                </FormField>

                <FormField label="CNIC" error={errors.CNIC}>
                    <input type='text' className={THEME.TextInput} value={formData.CNIC} maxLength={15}
                        onChange={(e) => handleInputChange('CNIC', formatCNIC(e.target.value))} />
                </FormField>

                {/* --- Is user account needed? --- */}
                <div className="md:col-span-2 bg-base-200/50 p-4 rounded-lg flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <UserCheck className="w-5 h-5 text-secondary" />
                        <p className="font-bold text-sm">Create User Account?</p>
                        <input type="checkbox" className={THEME.CheckBox} checked={formData.CreateAccount}
                            onChange={(e) => handleInputChange('CreateAccount', e.target.checked)} />
                    </div>
                </div>

                {/* Conditional Username and email address Field */}
                {formData.CreateAccount && (
                    <>
                        <FormField label="Username" error={errors.Username}>
                            <input type="text" className={THEME.TextInput} value={formData.Username}
                                onChange={(e) => handleInputChange('Username', e.target.value)} />
                        </FormField>
                        <FormField label="Email Address" error={errors.Email}>
                            <input type="email" className={THEME.TextInput} value={formData.Email}
                                onChange={(e) => handleInputChange('Email', e.target.value)} />
                        </FormField>
                    </>
                )}

                <div className="md:col-span-2 mt-4">
                    <button type="submit" className={`${THEME.ButtonBasic} w-full`}>
                        <Save className="w-4 h-4" />
                        Update Record
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