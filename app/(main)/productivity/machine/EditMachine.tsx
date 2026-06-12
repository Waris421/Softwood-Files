'use client';

import { THEME } from "@/_components/constants/ui";
import { SingleDropdown, SingleDropdownAsync } from "@/_components/Dropdown/Dropdown";
import { FormField } from "@/_components/generic/FormItems";
import LoadingIcon from "@/_components/generic/Loading";
import { cn } from "@/_components/generic/utils";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/_components/ui/dialog";
import { AlertCircle, Check, Loader2, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { FUNCTION_STATUS_OPTIONS, MACHINE_MANUFACTURER_OPTIONS, MACHINE_TYPE_OPTIONS } from "./Contants";

interface EditOperationModalProps {
    onClose: () => void;
    onSuccess: () => void;
    machineId: number | null;
}

//Schema of the form
type FormSchema = {
    MachineId: string;
    MachineType: string;
    FunctionStatus: string;
    Manufacturer: string;
    ModelNumber: string;
    SerialNumber: string;
    Department?: string | null;
}

//data type of validation schema
type ValidationSchemaType = {
    [K in keyof FormSchema]?: (val: any, data: FormSchema) => string | null;
}

//Validation schema for the different fields of the form
const VALIDATION_SCHEMA: ValidationSchemaType= {
    MachineId: (val) => (!val.trim() ? 'Id is required' : null),
    MachineType: (val) => (!val ? 'Please select an option' : null),
    FunctionStatus: (val) => (!val ? 'Please select an option' : null),
    Manufacturer: (val) => (!val ? 'Please select an option' : null),
    ModelNumber: (val) => (!val.trim() ? 'This is required' : null),
    SerialNumber: (val) => (!val.trim() ? 'This is required' : null),
}

const API_URL = (id: number) => `/api/productivity/machine/${id}/update`;

export function EditMachineModal({ onClose, onSuccess, machineId }: EditOperationModalProps) {
    const [formData, setFormData] = useState({
        MachineId: '', MachineType: '',FunctionStatus: 'Yes', Manufacturer: '',
        ModelNumber: '', SerialNumber: '', Department: undefined
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [fetching, setFetching] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [fetchError, setFetchError] = useState<string | null>(null);
    const [saveError, setSaveError] = useState<string | null>(null);

    useEffect(() => {
        const fetchMachineData = async() => {
            if (!machineId) return ;

            setFetchError(null);
            setSaveError(null);
            setErrors({});
            setFetching(true);

            try {
                const response = await fetch(API_URL(machineId));

                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.message || error);
                }
                const data = await response.json();

                setFormData(data);  
            } catch (err: any) {
                setFetchError(err.message || 'An unexpected error occurred.');
            } finally {
                setFetching(false);
            }
        };

        fetchMachineData();
    }, [machineId]);

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
                const errorMessage = errorGetter(formData[field], formData);
                if (errorMessage) newErrors[field] = errorMessage;
            }
        });

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        //Errors in the form
        if (!validateForm()) return ;
        if (!machineId) return ;

        setSubmitting(true);

        try {
            const response = await fetch(API_URL(machineId), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || error);
            }
            onSuccess();
            onClose();
        } catch (err: any) {
            setSaveError(err.message || 'An unexpected error occurred while saving.');
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="bg-gray-100 dark:bg-gray-700 rounded-xl shadow-xl max-w-2xl mx-auto border border-base-200">
                <DialogHeader className="p-4 border-b">
                    <DialogTitle className="text-xl font-bold text-base-content text-left">
                        Updating Machine # {machineId}: {formData.MachineId}
                    </DialogTitle>
                    <DialogDescription className="text-left text-base-content/70">
                        Fill out the details carefully to update the machine
                    </DialogDescription>
                </DialogHeader>

                {fetching ? (
                    <div className="py-8 flex justify-center items-center">
                        <LoadingIcon />
                    </div>
                ) : fetchError ? (
                    <div className="alert alert-error shadow-sm flex flex-col md:flex-row items-center justify-between gap-4 my-4">
                        <div className="flex items-start gap-2">
                            <AlertCircle className={cn("w-6 h-6 shrink-0", THEME.Text.RedText)} />
                            <div>
                                <h3 className={cn("font-bold", THEME.Text.RedText)}>Could not retrieve data</h3>
                                <p className={cn("text-sm", THEME.Text.RedText)}>{fetchError}</p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col gap-4">
                        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {saveError && (
                                <div className="alert alert-error sm:col-span-1 md:col-span-2 flex items-center gap-2 py-3 shadow-sm">
                                    <XCircle className={cn("w-5 h-5", THEME.Text.RedText)} />
                                    <span className={cn("text-sm font-medium", THEME.Text.RedText)}>{saveError}</span>
                                </div>
                            )}
                            <FormField label="MachineId" error={errors.MachineId} required>
                                <input type="text" placeholder="Full id" className={THEME.TextInput} value={formData.MachineId}
                                    onChange={(e) => handleInputChange('MachineId', e.target.value)} />
                            </FormField>
                            <FormField label="Machine Type" error={errors.MachineType} required>
                                <SingleDropdown inputName='MachineType' placeholder="Select a Type" staticOptions={MACHINE_TYPE_OPTIONS} defaultValue={formData.MachineType}
                                    widthClass="w-full" onSelect={(val: any) => handleInputChange('MachineType', val?.value)} />
                            </FormField>
                            <FormField label="Manufacturer" error={errors.Manufacturer} required>
                                <SingleDropdown inputName='Manufacturer' placeholder="Select an option" staticOptions={MACHINE_MANUFACTURER_OPTIONS} defaultValue={formData.Manufacturer}
                                    widthClass="w-full" onSelect={(val: any) => handleInputChange('Manufacturer', val?.value)} />
                            </FormField>
                            <FormField label="Model Number" error={errors.ModelNumber} required>
                                <input type="text" placeholder="Model Number" className={THEME.TextInput} value={formData.ModelNumber}
                                    onChange={(e) => handleInputChange('ModelNumber', e.target.value)} />
                            </FormField>
                            <FormField label="Serial Number" error={errors.SerialNumber} required>
                                <input type="text" placeholder="Serial Number" className={THEME.TextInput} value={formData.SerialNumber}
                                    onChange={(e) => handleInputChange('SerialNumber', e.target.value)} />
                            </FormField>
                            <FormField label="Functioning" error={errors.FunctionStatus} required>
                                <SingleDropdown inputName='FunctionStatus' placeholder="Select an option" staticOptions={FUNCTION_STATUS_OPTIONS} defaultValue={formData.FunctionStatus}
                                    widthClass="w-full" onSelect={(val: any) => handleInputChange('FunctionStatus', val?.value)} />
                            </FormField>
                            <FormField label="Department" error={errors.FunctionStatus}>
                                <SingleDropdownAsync inputName="Department" placeholder="Choose if applicable" apiUrl="/api/options/departments" defaultValue={formData.Department}
                                    widthClass="w-full" onSelect={(val: any) => handleInputChange('Department', val?.value)}/>
                            </FormField>
                            <div className="md:col-span-1 mt-4">
                                <button type="submit" className={`${THEME.ButtonBasic} w-full h-12 flex items-center justify-center gap-2 ${submitting ? 'opacity-70 cursor-not-allowed' : ''}`} disabled={submitting}>
                                    {submitting ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <Check className="w-4 h-4" />
                                    )}
                                    {submitting ? 'Saving...' : 'Save Machine'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}