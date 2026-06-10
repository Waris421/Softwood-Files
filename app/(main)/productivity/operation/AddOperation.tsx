'use client';

import { THEME } from "@/_components/constants/ui";
import { SingleDropdown } from "@/_components/Dropdown/Dropdown";
import { FormField } from "@/_components/generic/FormItems";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/_components/ui/dialog";
import { useState } from "react";
import { CATEGORY_OPTIONS, LEVEL_OPTIONS, MACHINE_TYPE_OPTIONS, SECTION_OPTIONS, SAM_FACTOR } from "./Constants";
import { Check, Loader2 } from "lucide-react";

interface AddOperationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

//Schema of the form
type FormSchema = {
    OperationName: string;
    Section: string;
    Category: string;
    Level: Number;
    SAM: number;
    Rate: Number;
    OperationCode: string;
    MachineType: string;
}

//data type of validation schema
type ValidationSchemaType = {
    [K in keyof FormSchema]?: (val: any, data: FormSchema) => string | null;
}

//Validation schema for the different fields of the form
const VALIDATION_SCHEMA: ValidationSchemaType= {
    OperationName: (val) => (!val.trim() ? 'Name is required' : null),
    Section: (val) => (!val ? 'Please select an option' : null),
    Category: (val) => (!val ? 'Please select an option' : null),
    Level: (val) => (!val ? 'Please select an option' : null),
    SAM: (val) => (val<=0 ? 'SAM must be greater than 0' : null),
    Rate: (val) => (val<=0 ? 'Rate must be greater than 0' : null),
    MachineType: (val) => (!val.trim() ? 'Please select an option' : null),
}

export function AddOperationModal({ isOpen, onClose, onSuccess }: AddOperationModalProps) {
    const [formData, setFormData] = useState({
        OperationName: '', Section: '',Category: '', Level: 1, SAM: 0,
        Rate: 0, OperationCode: '', MachineType: '',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [submitting, setSubmitting] = useState(false);

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

    const handleSAMORLevelChange = (field: keyof FormSchema, value: any) => {
        handleInputChange(field, value);

        const currentSAM = field === 'SAM' ? Number(value) : Number(formData.SAM);
        const currentLevel = field === 'Level' ? Number(value) : Number(formData.Level);

        const factorObj = SAM_FACTOR.find((f: any) => Number(f.level) === currentLevel);
        const factor = factorObj ? factorObj.factor : 0;

        const newRate = (currentSAM * factor).toFixed(2);

        handleInputChange('Rate', newRate);
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        
        //Errors in the form
        if (!validateForm()) return ;

        setSubmitting(true);

        try {
            const response = await fetch('/api/productivity/operation/add', {
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
            console.log(err);
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="bg-gray-100 dark:bg-gray-700 rounded-xl shadow-xl max-w-2xl mx-auto border border-base-200">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold text-base-content text-left">
                        Add New Operation
                    </DialogTitle>
                    <DialogDescription className="text-left text-base-content/70">
                        Fill out the details carefully to add a new operation
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField label="Name" error={errors.OperationName} required>
                        <input type="text" placeholder="Full Name" className={THEME.TextInput} value={formData.OperationName}
                                onChange={(e) => handleInputChange('OperationName', e.target.value)} />
                    </FormField>
                    <FormField label="Section" error={errors.Section} required>
                        <SingleDropdown inputName='Section' placeholder="Select Section" staticOptions={SECTION_OPTIONS} 
                            widthClass="w-full" onSelect={(val: any) => handleInputChange('Section', val?.value)} />
                    </FormField>
                    <FormField label="Category" error={errors.Category} required>
                        <SingleDropdown inputName='Category' placeholder="Select Category" staticOptions={CATEGORY_OPTIONS} 
                            widthClass="w-full" onSelect={(val: any) => handleInputChange('Category', val?.value)} />
                    </FormField>
                    <FormField label="Level" error= {errors.Level} required>
                        <SingleDropdown inputName='Level' placeholder="Select Level" staticOptions={LEVEL_OPTIONS} defaultValue={`${formData.Level}`}
                            widthClass="w-full" onSelect={(val: any) => handleSAMORLevelChange('Level', val?.value)} />
                    </FormField>
                    <FormField label="SAM" error={errors.SAM} required>
                        <input type="number" placeholder="SAM" className={THEME.TextInput} value={formData.SAM}
                                onChange={(e) => handleSAMORLevelChange('SAM', e.target.value)} />
                    </FormField>
                    <FormField label="Rate" error={errors.Rate} required>
                        <input type="number" placeholder="Rate" className={THEME.TextInput} value={formData.Rate}
                                onChange={(e) => handleInputChange('Rate', e.target.value)} />
                    </FormField>
                    <FormField label="Code" error={errors.Code}>
                        <input type="text" placeholder="Full Code" className={THEME.TextInput} value={formData.OperationCode}
                                onChange={(e) => handleInputChange('OperationCode', e.target.value)} />
                    </FormField>
                    <FormField label="Machine Type" error= {errors.MachineType} required>
                        <SingleDropdown inputName='MachineType' placeholder="Select a type" staticOptions={MACHINE_TYPE_OPTIONS} 
                            widthClass="w-full" onSelect={(val: any) => handleInputChange('MachineType', val?.value)} />
                    </FormField>
                    <div className="md:col-span-2 mt-4">
                        <button type="submit" className={`${THEME.ButtonBasic} w-full ${submitting ? 'opacity-70 cursor-not-allowed' : ''}`} disabled={submitting}>
                            {submitting ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Check className="w-4 h-4" />
                            )}
                            {submitting ? 'Saving...' : 'Save Operation'}
                        </button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}