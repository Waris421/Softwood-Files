'use client';

import { THEME } from "@/_components/constants/ui";
import { FormField } from "@/_components/generic/FormItems";
import MessageBox from "@/_components/generic/MessageBox";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/_components/ui/dialog";
import { Building2, Check, Loader2, Map } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

//The generic parts of the form
interface OfficeFormProps {
    pk?: number;            //May be used in some forms
    baseApiUrl?: string;    //The api which communicates with backend
    redirectUrl?: string;   //The url on which to redirect on successful submission
}

//Schema of the form
type FormSchema = {
    LocationName: string;
    Radius: string;
    Location: string;
}

//data type of validation schema
type ValidationSchemaType = {
    [K in keyof FormSchema]?: (val: any, data: FormSchema) => string | null;
}

const VALIDATION_SCHEMA: ValidationSchemaType= {
    LocationName: (val) => (!val.trim() ? 'Name is required' : null),
    Radius: (val) => (!val ? 'Cover Circle is required' : null),
    Location: (val) => (!val ? 'Location is required' : null),
}

export default function OfficeForm ({
    pk,
    baseApiUrl = "/api/hr/office",
    redirectUrl = "/hr/office",
}: OfficeFormProps) {
    const [formData, setFormData] = useState({
        LocationName: '', Radius: '', Location: ''
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isLoading, setIsLoading] = useState(false);
    const [messageConfig, setMessageConfig] = useState<{ show: boolean; subject: string; message: string; action?: () => void; } | null>(null);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const router = useRouter();

    const targetUrl = pk ? `${baseApiUrl}/${pk}/update` : `${baseApiUrl}/add`;

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
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        //Errors in the form
        if (!validateForm()) return ;

        setIsLoading(true);

        try {
            const response = await fetch(targetUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || error);
            }

            router.push(redirectUrl);
        } catch (err: any) {
            setMessageConfig({
                show: true,
                subject: "Error",
                message: `Saving Failed: ${err}`
            });
        } finally {
            setIsLoading(false);
        }
    }
    
    return (
        <div className="max-w-2xl mx-auto p-6 bg-base-100 rounded-xl shadow-xl border border-base-200">
            {/* Office Addition form */}
            <div className="flex items-center gap-3 mb-8 border-b pb-4">
                <Building2 className="text-primary w-6 h-6" />
                <h2 className="text-2xl font-bold">Add New Office</h2>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField label="Location Name" error={errors.LocationName} required>
                    <input type="text" placeholder="Name" className={THEME.TextInput} value={formData.LocationName}
                        onChange={(e) => handleInputChange('LocationName', e.target.value)} />
                </FormField>

                <FormField label="Cover Cricle" error={errors.Radius} required>
                    <input type="number" placeholder="kilometers" className={THEME.TextInput} value={formData.Radius}
                        onChange={(e) => handleInputChange('Radius', e.target.value)} />
                </FormField>

                <FormField label="Location" error={errors.Location} required>
                    <div className="relative flex items-center">
                        <input type="text"
                            placeholder="Copy/paste Lat, Lon from Maps"
                            className={`${THEME.TextInput} pr-12`}
                            value={formData.Location}
                            onChange={(e) => handleInputChange('Location', e.target.value)}
                        />
                        <button
                            type="button"
                            onClick={() => setIsPreviewOpen(true)}
                            disabled={!formData.Location}
                            className="absolute right-2 p-2 text-primary rounded-md disabled:opacity-30 cursor-pointer"
                            title="Show on Map"
                        >
                            <Map size={20} />
                        </button>
                    </div>
                </FormField>

                <div className="md:col-span-2 mt-4">
                    <button type="submit" className={`${THEME.ButtonBasic} w-full ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`} disabled={isLoading}>
                        {isLoading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <Check className="w-4 h-4" />
                        )}
                        {isLoading ? 'Saving...' : 'Save Office Location'}
                    </button>
                </div>
            </form>

            {/*Preview on the map*/}
            <Dialog open={isPreviewOpen} onOpenChange={() => setIsPreviewOpen(false)}>
                <DialogContent className="sm:max-w-150">
                    <DialogHeader>
                        <DialogTitle>{formData.LocationName}</DialogTitle>
                        <DialogDescription>
                            Previewing location at {formData.Location}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="w-full aspect-video rounded-md overflow-hidden border">
                        {isPreviewOpen && (
                            <iframe 
                                width="100%"
                                height="100%"
                                style={{ border: 0 }}
                                loading="lazy"
                                allowFullScreen
                                referrerPolicy="no-referrer-when-downgrade"
                                src={`https://www.google.com/maps?q=${formData.Location}&z=15&output=embed`}
                            />
                        )}
                    </div>
                    
                    <div className="flex justify-end mt-2">
                        <a
                            href={`https://www.google.com/maps/search/?api=1&query=${formData.Location}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:underline"
                        >
                            Open in Google Maps
                        </a>
                    </div>
                </DialogContent>
            </Dialog>

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