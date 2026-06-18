'use client';

import { THEME } from "@/_components/constants/ui";
import { FormField } from "@/_components/generic/FormItems";
import LoadingIcon from "@/_components/generic/Loading";
import { cn } from "@/_components/generic/utils";
import TimePicker from "@/_components/Timepicker/Timepicker.";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/_components/ui/dialog";
import { AlertCircle, Check, Loader, XCircle } from "lucide-react";
import { useEffect, useState } from "react";

interface EditAdjustmentModalProps {
    onClose: () => void;
    onSuccess: () => void;
    adjustmentId: number | null;
}

//Schema of the form
type FormSchema = {
    Date: string,
    Reason: string,
    Time?: string,
    Location?: string,
}

//data type of validation schema
type ValidationSchemaType = {
    [K in keyof FormSchema]?: (val: any, data: FormSchema, responseData: FormSchema | null) => string | null;
}

//Validation schema for the different fields of the form
const VALIDATION_SCHEMA: ValidationSchemaType= {
    Date: (val) => (!val ? 'Date is invalid' : null),
    Reason: (val) => (!val ? 'Reason is required' : null),
    Time: (val, data, responseData) => {
        if (responseData?.Time && !val) {
            return 'Time is required';
        }
        return null;
    },
    Location: (val, data, responseData) => {
        if (responseData?.Location && !val) {
            return 'Location is required';
        }
        return null;
    }
}

const API_URL = (id: number) => `/api/hr/attendance/correction/${id}/update`;

const INITIAL_FORM_STATE: FormSchema = {
    Date: '',
    Reason: '',
    Time: undefined,
    Location: undefined,
};

export function EditAdjustmentModal({ onClose, onSuccess, adjustmentId }: EditAdjustmentModalProps) {
    const [formData, setFormData] = useState<FormSchema>(INITIAL_FORM_STATE);
    const [responseData, setResponseData] = useState<FormSchema | null> (null);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [fetching, setFetching] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [fetchError, setFetchError] = useState<string | null>(null);
    const [saveError, setSaveError] = useState<string | null>(null);

    useEffect(() => {
        const fetchAdjustmentData = async() => {
            if (!adjustmentId) {
                setFormData(INITIAL_FORM_STATE);
                setResponseData(null);
                return;
            }

            setFetchError(null);
            setSaveError(null);
            setErrors({});
            setFetching(true);
            try {
                const response = await fetch(API_URL(adjustmentId));
                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.details?.message || error);
                }

                const data: FormSchema = await response.json();
                setFormData(data);
                setResponseData(data);
            } catch (err: any) {
                setFetchError(err.message || 'An unexpected error occurred.');
            } finally {
                setFetching(false);
            }
        }

        fetchAdjustmentData();
    }, [adjustmentId]);

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
                const errorMessage = errorGetter(formData[field], formData, responseData);
                if (errorMessage) newErrors[field] = errorMessage;
            }
        });

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        //Errors in the form
        if (!validateForm() || !adjustmentId) return;

        setSubmitting(true);

        try {
            const response = await fetch(API_URL(adjustmentId), {
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
        <Dialog open={!!adjustmentId} onOpenChange={() => onClose()}>
            <DialogContent className={cn("rounded-xl shadow-xl max-w-2xl mx-auto border border-base-200", THEME.Background.Highlighted200)}>
                <DialogHeader className="p-4 border-b">
                    <DialogTitle className="text-xl font-bold text-base-content text-left">
                        Updating Adjustment# {adjustmentId}, Dated: {formData.Date}
                    </DialogTitle>
                    <DialogDescription className="text-left text-base-content/70">
                        Fill out the details carefully to update the adjustment
                    </DialogDescription>
                </DialogHeader>
                {fetching ? (
                    <LoadingIcon size={30} className="animation-duration-[2.5s]"/>
                ) : fetchError ? (
                    <div className="alert rounded-lg shadow-sm flex flex-col md:flex-row items-center justify-between gap-4 my-4">
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
                                <div className="alert rounded-lg sm:col-span-1 md:col-span-2 flex items-center gap-2 py-3 shadow-sm">
                                    <XCircle className={cn("w-5 h-5", THEME.Text.RedText)} />
                                    <span className={cn("text-sm font-medium", THEME.Text.RedText)}>{saveError}</span>
                                </div>
                            )}

                            {responseData?.Time && (
                                <FormField label="Time" error={errors.Time} required>
                                    <TimePicker
                                        inputName="Time"
                                        value={formData.Time}
                                        placeholder="Select Time"
                                        onChange={(val) => handleInputChange("Time", val)}
                                    />
                                </FormField>
                            )}

                            {responseData?.Location && (
                                <FormField label="Location" error={errors.Location} required>
                                    <input type="text" placeholder="Location" className={THEME.TextInput} value={formData.Location}
                                        onChange={(e) => handleInputChange('Location', e.target.value)} />
                                </FormField>
                            )}

                            <FormField label="Reason" error={errors.Reason} required>
                                <input type="text" placeholder="Reason for adjustment" className={THEME.TextInput} value={formData.Reason}
                                        onChange={(e) => handleInputChange('Reason', e.target.value)} />
                            </FormField>
                            <div className="md:col-span-2 mt-4">
                                <button type="submit" className={`${THEME.ButtonBasic} w-full h-12 flex items-center justify-center gap-2 ${submitting ? 'opacity-70 cursor-not-allowed' : ''}`} disabled={submitting}>
                                    {submitting ? (
                                        <Loader className="w-4 h-4 animate-spin animation-duration-[2.5s]" />
                                    ) : (
                                        <Check className="w-4 h-4" />
                                    )}
                                    {submitting ? 'Saving...' : 'Save Adjustment'}
                                </button>
                            </div>
                            
                        </form>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}