'use client';

import { UserPlus, UserCheck, Check, AlertCircle, Loader2 } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import Dropdown from '@/_components/Dropdown/Dropdown';
import { THEME } from '@/_components/constants/ui';
import MessageBox from '@/_components/generic/MessageBox';
import DatePicker from '@/_components/Datepicker/Datepicker';

//Schema of the form
type FormSchema = {
    Name: string;
    FatherSpouse: string;
    Department: string;
    SubDepartment: string;
    Manager: string;
    DateOfBirth: string;
    Gender: string;
    CreateAccount: boolean;
    Username: string;
    Email: string;
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

//Helper function to generate an error element
const ErrorLabel = ({ message }: { message?: string }) => {
    if (!message) return null;
    return (
        <label className="label py-1">
            <span className={THEME.ErrorText}>
                <AlertCircle size={14} /> {message}
            </span>
        </label>
    )
}

//Helper function to generate a form field
const FormField = ({ label, error, required, children }: any) => (
    <div className="form-control w-full">
        <label className="label font-semibold text-sm">
            {label}{required && <span className="text-error ml-1">*</span>}
        </label>
        {children}
        <ErrorLabel message={error} />
    </div>
);

export default function WorkerAddForm(){
    const [formData, setFormData] = useState({
        Name: '', FatherSpouse: '',Department: '', SubDepartment: '', Manager: '',
        DateOfBirth: '', Gender: '', CreateAccount: false, Username: '', Email: '',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isLoading, setIsLoading] = useState(true);
    const [messageConfig, setMessageConfig] = useState<{ show: boolean; subject: string; message: string; action?: () => void; } | null>(null);
    const [options, setOptions] = useState({ departments: [], managers: [] });
    
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(`/api/hr/workers/add`);
                if (!response.ok) throw new Error("Failed to load form data.");
                
                const data = await response.json();
                
                setOptions({
                    departments: data.departments.map((d: any) => ({ label: String(d.label), value: String(d.value) })),
                    managers: data.managers.map((m: any) => ({ label: String(m.label), value: String(m.value) }))
                });
            } catch (err: any) {
                setMessageConfig({ show: true, subject: "Fetch Error", message: err.message });
            } finally {
                setIsLoading(false);
            }
        }

        fetchData();
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

    //Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        //Errors in the form
        if (!validateForm()) return ;
        
        //Form is valid now.
        const response = await fetch(`/api/hr/workers/add`, {
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

        console.log(response);
    };

    if (isLoading) return (
        <div className="flex flex-col items-center justify-center p-20 gap-4">
            <Loader2 className="animate-spin text-primary" size={40} />
            <p className="text-sm font-medium">Loading form options...</p>
        </div>
    );
    
    return (
        <div className="max-w-2xl mx-auto p-6 bg-base-100 rounded-xl shadow-xl border border-base-200">
            {/* Employee Addition form */}
            <div className="flex items-center gap-3 mb-8 border-b pb-4">
                <UserPlus className="text-primary w-6 h-6" />
                <h2 className="text-2xl font-bold">Add New Employee</h2>
            </div>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name */}
                <FormField label="Name" error={errors.Name} required>
                    <input type="text" placeholder="Full Name" className={THEME.TextInput} value={formData.Name}
                        onChange={(e) => handleInputChange('Name', e.target.value)} />
                </FormField>
                <FormField label="Father/Spouse" error={errors.FatherSpouse} required>
                    <input type="text" placeholder="Full Name" className={THEME.TextInput} value={formData.FatherSpouse}
                        onChange={(e) => handleInputChange('FatherSpouse', e.target.value)} />
                </FormField>

                {/* Date of Birth */}
                <FormField label="Date of Birth" error={errors.DateOfBirth} required>
                    <DatePicker inputName='DateOfBirth' value={formData.DateOfBirth} required={true}
                        disabledDates={(date) => date > new Date()} onChange={(val) => handleInputChange('DateOfBirth', val)} />
                </FormField>
                
                {/* Department */}
                <FormField label="Department" error={errors.Department} required>
                    <Dropdown inputName='Department' placeholder="Select Department" isStatic staticOptions={options.departments} 
                        widthClass="w-full" onSelect={(val: any) => handleInputChange('Department', val?.value)} />
                </FormField>

                {/* Sub department */}
                <FormField label="Sub Department">
                    <input type="text" className={THEME.TextInput} value={formData.SubDepartment} placeholder='If applicable'
                        onChange={(e) => handleInputChange('SubDepartment', e.target.value)} />
                </FormField>

                {/* Manager */}
                <FormField label="Manager" error={errors.Manager}>
                    <Dropdown inputName='Manager' placeholder="Select Manager" isStatic staticOptions={options.managers} 
                        widthClass="w-full" onSelect={(val: any) => handleInputChange('Manager', val?.value)} />
                </FormField>

                {/* Gender */}
                <FormField label="Gender" error={errors.Gender}>
                    <Dropdown inputName='Gender' placeholder="Select option" isStatic widthClass="w-full"
                        staticOptions={[{ label: 'Male', value: 'Male' }, { label: 'Female', value: 'Female' }]}
                        onSelect={(val: any) => handleInputChange('Gender', val?.value)} />
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
                {formData.CreateAccount && 
                    <>
                        <FormField label="Username" error={errors.Username}>
                            <input type="text" className={THEME.TextInput} value={formData.Username} placeholder='john.doe'
                                onChange={(e) => handleInputChange('Username', e.target.value)} />
                        </FormField>
                        <FormField label="Email Address" error={errors.Email}>
                            <input type="email" className={THEME.TextInput} value={formData.Email} placeholder='johndoe@domain.com'
                                onChange={(e) => handleInputChange('Email', e.target.value)} />
                        </FormField>
                    </>
                }

                <div className="md:col-span-2 mt-4">
                    <button type="submit" className={`${THEME.ButtonBasic} w-full`}>
                        <Check className="w-4 h-4" />
                        Save Employee
                    </button>
                </div>
            </form>

            {/* Any wanrning/message box */}
            {messageConfig?.show && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <MessageBox 
                        subject={messageConfig.subject}
                        message={messageConfig.message}
                        confirmText="Close"
                        onConfirm={() => {
                            if (messageConfig.action) {
                                messageConfig.action();
                            }
                            setMessageConfig(null)
                        }}  
                    />
                </div>
            )}
        </div>
    )
}
