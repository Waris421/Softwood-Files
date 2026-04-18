'use client';

import { THEME } from "@/_components/constants/ui";
import { FormField } from "@/_components/generic/FormItems";
import LoadingIcon from "@/_components/generic/Loading";
import MessageBox from "@/_components/generic/MessageBox";
import { ArrowRight, CopyPlus, Loader2, Save } from "lucide-react";
import { useEffect, useState } from "react";

interface FormProps {
    code: string;
    baseApiUrl?: string;
    redirectUrl?: string;
}

//Schema of the form
type FormSchema = {
    Source: string;
    Target: string;
}

//data type of validation schema
type ValidationSchemaType = {
    [K in keyof FormSchema]?: (val: any, data: FormSchema) => string | null;
}

const VALIDATION_SCHEMA: ValidationSchemaType= {
    Source: (val) => (!val.trim() ? 'Source is required' : null),
    Target: (val) => (!val.trim() ? 'Target is required' : null),
}

export default function InventoryDuplicateForm({
    code,
    baseApiUrl = '/api/mmc/inventory',
    redirectUrl = '/mmc/inventory'
}: FormProps) {
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [messageConfig, setMessageConfig] = useState<{ show: boolean; subject: string; message: string; action?: () => void; } | null>(null);

    const [formData, setFormData] = useState({
        Source: code, Target: code
    });

    useEffect(() => {
        setIsLoading(false)
    }, [baseApiUrl]);

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

    //Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        //Errors in the form
        if (!validateForm()) return ;

        //Form is valid now
        const apiURL = `${baseApiUrl}/${code}/copy`;
        try {
            setIsSubmitting(true);
            const response = await fetch(apiURL, {
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
        <div className="max-w-6xl mx-auto p-6 bg-base-100 rounded-xl shadow-xl border border-base-200">
            <div className="flex items-center justify-between mb-8 border-b pb-4">
                <div className="flex items-center gap-3">
                    <CopyPlus className="text-primary w-6 h-6" />
                    <h2 className="text-2xl font-bold">Copying Inventory Card</h2>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-7 items-center gap-4 bg-base-200/30 p-6 rounded-lg border border-dashed border-base-300">
                    <div className="md:col-span-3">
                        <FormField label="Source Code (Existing)" required>
                            <input 
                                type="text" 
                                className={THEME.TextInputReadOnly} 
                                value={formData.Source} 
                                readOnly 
                            />
                        </FormField>
                    </div>
                    
                    {/* Only show arrow for horizontally aliged fields */}
                    <div className="flex justify-center md:col-span-1 pt-6">
                        <ArrowRight className="text-base-content/30 hidden md:block" />
                        <div className="divider md:hidden">Copy to</div>
                    </div>

                    <div className="md:col-span-3">
                        <FormField label="New Target Code" error={errors.Target} required>
                            <input 
                                type="text" 
                                placeholder="Enter new unique code..." 
                                className={THEME.TextInput} 
                                value={formData.Target}
                                onChange={(e) => handleInputChange('Target', e.target.value)}
                                autoFocus
                            />
                        </FormField>
                    </div>
                </div>
                <div className="md:col-span-3 mt-4">
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