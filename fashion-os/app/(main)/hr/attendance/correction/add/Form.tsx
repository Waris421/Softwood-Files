'use client';

import LoadingIcon from "@/_components/generic/Loading";
import MessageBox from "@/_components/generic/MessageBox";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

//The generic parts of the form
interface CorrectionFormProps {
    pk?: number;            //May be used in some forms
    baseApiUrl?: string;    //The api which communicates with backend
    redirectUrl?: string;   //The url on which to redirect on successful submission
}

//Schema of the form
type FormSchema = {
    CorrectionType: string;
    Date: string,
}

//data type of validation schema
type ValidationSchemaType = {
    [K in keyof FormSchema]?: (val: any, data: FormSchema) => string | null;
}


//Validation schema for the different fields of the form
const VALIDATION_SCHEMA: ValidationSchemaType = {
    CorrectionType: (val: string[]) => {
        if (!val || val.length === 0) {
            return 'At least one type must be selected';
        }
        return null;
    },
}

export default function CorrectionForm({
    baseApiUrl = "/api/hr/attendance/correction/add",
    redirectUrl = "/hr/attendance",
}: CorrectionFormProps) {
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [messageConfig, setMessageConfig] = useState<{ show: boolean; subject: string; message: string; action?: () => void; } | null>(null);
    
    const searchParams = useSearchParams();
    const pathname = usePathname()
    const router = useRouter();

    useEffect(() => {
        const loadData = async () => {
            try {
                const params = new URLSearchParams(Object.fromEntries(searchParams.entries()));

                const requestUrl = `${baseApiUrl}?${params.toString()}`;

                const response = await fetch(requestUrl);
                if (!response.ok) {
                    const error = await response.json();

                    const errorTitle = error.error;
                    const errorMessage = error.details;

                    setMessageConfig({
                        show: true,
                        subject: errorTitle,
                        message: errorMessage,
                        action: () => {
                            window.location.reload();
                        }
                    });
                    return ;
                }

                const data = await response.json();
                console.log(data);
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

    const formData: FormSchema = {
        Date: searchParams.get('date') ?? '',
        CorrectionType: searchParams.get('type') ?? '',
    }

    if (isLoading) return (
        <LoadingIcon />
    );

    return (
        <div className="max-w-2xl mx-auto p-6 bg-base-100 rounded-xl shadow-xl border border-base-200">

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