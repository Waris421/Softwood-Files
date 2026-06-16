'use client';

import { THEME } from "@/_components/constants/ui";
import LoadingIcon from "@/_components/generic/Loading";
import MessageBox from "@/_components/generic/MessageBox";
import { Clock, Loader, PlaneIcon, Save, TimerIcon, UserMinus } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { AdjustmentFields, AdjustmentTitle } from "./AdjustmentFields";
import { LeaveFields, LeaveHeader } from "./LeaveFields";
import { DropdownOption } from "@/_components/Dropdown/types";
import { TravelFields, TravelHeader } from "./TravelFields";
import { OverTimeFields, OverTimeHeader } from "./OverTimeFields";

//The generic parts of the form
interface CorrectionFormProps {
    pk?: number;            //May be used in some forms
    baseApiUrl?: string;    //The api which communicates with backend
    redirectUrl?: string;   //The url on which to redirect on successful submission
}

type BaseFields = { Date: string };

type AdjustmentSubSchema = BaseFields & {
    CorrectionType: 'adjustment';
    InLatitude: number | null; OutLatitude: number | null;
    InLongitude: number | null; OutLongitude: number | null;
    InTime: string; OutTime: string;
    InLocation: string; OutLocation: string;
    InDetails: string; OutDetails: string;
    InLocationReason: string | null; OutLocationReason: string | null;
    InTimeReason: string | null; OutTimeReason: string | null;
    InTimeFlag: boolean; OutTimeFlag: boolean;
    InLocationFlag: boolean; OutLocationFlag: boolean;
};

type LeaveSubSchema = BaseFields & {
    CorrectionType: 'leave';
    AllowableOptions: DropdownOption[] | null;
    LeaveType: string;
    LeaveReason: string;
    LeavesRange: { from: string; to: string };
};

type TravelSubSchema = BaseFields & {
    CorrectionType: 'travel';
    TravelDateRange: { from: string; to: string };
    TravelDestination: string;
    TravelReason: string;
};

type OverTimeSubSchema = BaseFields & {
    CorrectionType: 'over-time';
    OverTimeDuration: number;
    OverTimeReason: string;
};

type FormSchema = AdjustmentSubSchema | LeaveSubSchema | TravelSubSchema | OverTimeSubSchema;

type FormKeys = keyof AdjustmentSubSchema | keyof LeaveSubSchema | keyof TravelSubSchema | keyof OverTimeSubSchema;

type ValidationSchemaType = {
    [K in FormKeys]?: (val: any, data: FormSchema) => string | null;
};

const VALIDATION_SCHEMA: ValidationSchemaType = {
    CorrectionType: (val: string) => {
        if (!val) return 'Type must be selected';
        return null;
    },
};

const getInitialState = (type: string, date: string): FormSchema => {
    const base = { Date: date };
    switch (type) {
        case 'leave':
            return { ...base, CorrectionType: 'leave', AllowableOptions: null, LeaveType: '', LeaveReason: '', LeavesRange: { from: '', to: '' } };
        case 'travel':
            return { ...base, CorrectionType: 'travel', TravelDateRange: { from: '', to: '' }, TravelDestination: '', TravelReason: '' };
        case 'over-time':
            return { ...base, CorrectionType: 'over-time', OverTimeDuration: 0, OverTimeReason: '' };
        case 'adjustment':
        default:
            return {
                ...base,
                CorrectionType: 'adjustment',
                InLatitude: null, OutLatitude: null, InLongitude: null, OutLongitude: null,
                InTime: '', OutTime: '', InLocation: '', OutLocation: '', InDetails: '', OutDetails: '',
                InLocationReason: null, OutLocationReason: null, InTimeReason: null, OutTimeReason: null,
                InLocationFlag: false, OutLocationFlag: false, InTimeFlag: false, OutTimeFlag: false,
            };
    }
};

export default function CorrectionForm({
    baseApiUrl = "/api/hr/attendance/correction/add",
    redirectUrl = "/hr/attendance",
}: CorrectionFormProps) {
    const searchParams = useSearchParams();
    const initialType = searchParams.get('type') ?? 'adjustment';
    const initialDate = searchParams.get('date') ?? '';
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [messageConfig, setMessageConfig] = useState<{ show: boolean; subject: string; message: string; action?: () => void; } | null>(null);
    const [adjData, setAdjData] = useState<FormSchema>(() => getInitialState(initialType, initialDate));

    useEffect(() => {
        const loadData = async () => {
            try {
                const params = new URLSearchParams(Object.fromEntries(searchParams.entries()));
                const response = await fetch(`${baseApiUrl}?${params.toString()}`);
                
                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.details || error.error || "Failed loading parameters");
                }

                const data = await response.json();
                setAdjData(prev => ({ ...prev, ...data }));
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
        setAdjData(prev => {
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
                const errorMessage = errorGetter(adjData[field], adjData);
                if (errorMessage) newErrors[field] = errorMessage;
            }
        });

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const getCleanPayload = (data: FormSchema) => {
        const basePayload = { CorrectionType: data.CorrectionType, Date: data.Date };
        
        switch (data.CorrectionType) {
            case 'adjustment':
                const { CorrectionType: c1, Date: d1, ...adjustmentProps } = data;
                return { ...basePayload, ...adjustmentProps };
            case 'leave':
                const { CorrectionType: c2, Date: d2, ...leaveProps } = data;
                return { ...basePayload, ...leaveProps };
            case 'travel':
                const { CorrectionType: c3, Date: d3, ...travelProps } = data;
                return { ...basePayload, ...travelProps };
            case 'over-time':
                const { CorrectionType: c4, Date: d4, ...overtimeProps } = data;
                return { ...basePayload, ...overtimeProps };
        }
    };

    const handleSubmit = async(e: React.FormEvent) => {
        e.preventDefault();

        //Errors in the form
        if (!validateForm()) return ;

        setIsSubmitting(true);

        try {
            const payload = getCleanPayload(adjData);
            const response = await fetch(baseApiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || error);
            }

            setMessageConfig({
                show: true,
                subject: 'Request Added',
                message: 'Your requeest has been submitted',
                action: () => window.location.href = redirectUrl,
            })
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
            {adjData.CorrectionType === 'adjustment' && <AdjustmentTitle />}
            {adjData.CorrectionType === 'leave' && <LeaveHeader />}
            {adjData.CorrectionType === 'travel' && <TravelHeader />}
            {adjData.CorrectionType === 'over-time' && <OverTimeHeader />}
            
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {adjData.CorrectionType === 'adjustment' && (
                    <AdjustmentFields 
                        data={adjData} 
                        errors={errors} 
                        onChange={handleInputChange} 
                    />
                )}

                {adjData.CorrectionType === 'leave' && (
                    <LeaveFields 
                        data={adjData}
                        errors={errors}
                        onChange={handleInputChange}
                    />
                )}

                {adjData.CorrectionType === 'travel' && (
                    <TravelFields
                        data={adjData}
                        errors={errors}
                        onChange={handleInputChange}
                    />
                )}

                {adjData.CorrectionType === 'over-time' && (
                    <OverTimeFields
                        data={adjData}
                        errors={errors}
                        onChange={handleInputChange}
                    />
                )}

                <div className="md:col-span-2 mt-4">
                    <button type="submit" className={`${THEME.ButtonBasic} w-full ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`} disabled={isSubmitting}>
                        {isSubmitting ? (
                            <Loader className="w-4 h-4 animate-spin" />
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