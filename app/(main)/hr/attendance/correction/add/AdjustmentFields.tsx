'use client';

import { THEME } from "@/_components/constants/ui";
import LocationPreview from "@/_components/DialogBox/LocationPreview";
import { FormField } from "@/_components/generic/FormItems";
import TimePicker from "@/_components/Timepicker/Timepicker.";
import { Clock, MapPin } from "lucide-react";
import { useState } from "react";

interface AdjustmentFieldsProps {
  data: any;
  errors: Record<string, string>;
  onChange: (field: any, value: any) => void;
}

interface LocationData {
    Name: string;
    Latitude: number | string;
    Longitude: number | string;
}

export function AdjustmentFields({ data, errors, onChange }: AdjustmentFieldsProps) {
    const [previewLocation, setPreviewLocation] = useState<LocationData | null>(null);

    const handlePreviewLocation = (name: string, lat: any, long: any) => {
        if (!lat || !long) return;
        setPreviewLocation({
            Name: name,
            Latitude: lat,
            Longitude: long
        });
    };

    return (
        <>
            <FormField label='Login Location' error={errors.InLocation}>
                <div className="relative flex items-center">
                    <input 
                        type="text" 
                        placeholder="Location" 
                        className={`${data.InLocationFlag ? THEME.TextInput : THEME.TextInputReadOnly} pr-12`}
                        value={data.InLocation}
                        readOnly={!data.InLocationFlag}
                        onChange={data.InLocationFlag ? (e) => onChange('InLocation', e.target.value) : undefined}
                    />
                    {data.InLatitude && data.InLongitude && (
                        <button
                            type="button"
                            onClick={() => handlePreviewLocation(data.InLocation, data.InLatitude, data.InLongitude)}
                            className="absolute right-2 p-2 text-primary rounded-md disabled:opacity-30 cursor-pointer"
                            title="Open in Maps"
                        >
                            <MapPin className="w-5 h-5" />
                        </button>
                    )}
                </div>
            </FormField>

            <FormField label="Login Time" error={errors.InTime}>
                {data.InTimeFlag ? (
                    <TimePicker inputName='Login Time' value={data.InTime} required={true} onChange={(val) => onChange('InTime', val)}/>
                    ) : (
                    <input type="text" placeholder="Time" className={THEME.TextInputReadOnly} value={data.InTime} readOnly />
                )}                    
            </FormField>

            <FormField label='Logout Location' error={errors.OutLocation}>
                <div className="relative flex items-center">
                    <input 
                        type="text" 
                        placeholder="Location" 
                        className={`${data.OutLocationFlag ? THEME.TextInput : THEME.TextInputReadOnly} pr-12`}
                        value={data.OutLocation}
                        readOnly={!data.OutLocationFlag}
                        onChange={data.OutLocationFlag ? (e) => onChange('OutLocation', e.target.value) : undefined}
                    />
                    {data.OutLatitude && data.OutLongitude && (
                        <button
                            type="button"
                            onClick={() => handlePreviewLocation(data.OutLocation, data.OutLatitude, data.OutLongitude)}
                            className="absolute right-2 p-2 text-primary rounded-md disabled:opacity-30 cursor-pointer"
                            title="Open in Maps"
                        >
                            <MapPin className="w-5 h-5" />
                        </button>
                    )}
                </div>
            </FormField>

            <FormField label="Logout Time" error={errors.OutTime}>
                {data.OutTimeFlag ? (
                    <TimePicker inputName='Logout Time' value={data.OutTime} required={true} onChange={(val) => onChange('OutTime', val)}/>
                    ) : (
                    <input type="text" placeholder="Time" className={THEME.TextInputReadOnly} value={data.OutTime} readOnly />
                )}                    
            </FormField>

            {data.InLocationFlag && (
                <FormField label="Login Location Adjustment Reason" error={errors.InLocationReason} required>
                    <input type="text" placeholder={data.InDetails} className={THEME.TextInput} value={data.InLocationReason || ""} onChange={(e) => onChange('InLocationReason', e.target.value)} />
                </FormField>
            )}

            {data.OutLocationFlag && (
                <FormField label="Logout Location Adjustment Reason" error={errors.OutLocationReason} required>
                    <input type="text" placeholder={data.OutDetails} className={THEME.TextInput} value={data.OutLocationReason || ""} onChange={(e) => onChange('OutLocationReason', e.target.value)} />
                </FormField>
            )}

            {data.InTimeFlag && (
                <FormField label="Login Time Adjustment Reason" error={errors.InTimeReason} required>
                    <input type="text" placeholder={data.InDetails} className={THEME.TextInput} value={data.InTimeReason || ""} onChange={(e) => onChange('InTimeReason', e.target.value)} />
                </FormField>
            )}

            {data.OutTimeFlag && (
                <FormField label="Logout Time Adjustment Reason" error={errors.OutTimeReason} required>
                    <input type="text" placeholder={data.OutDetails} className={THEME.TextInput} value={data.OutTimeReason || ""} onChange={(e) => onChange('OutTimeReason', e.target.value)} />
                </FormField>
            )}

            <LocationPreview 
                location={previewLocation} 
                onClose={() => setPreviewLocation(null)} 
            />
        </>
    )

}

export function AdjustmentTitle() {
    return (
        <div className="flex items-center gap-3 mb-8 border-b pb-4">
            <Clock className="text-primary w-6 h-6" />
            <h2 className="text-2xl font-bold">Attendance Adjustment</h2>
        </div>
    )
}