'use client';

import { THEME } from "@/_components/constants/ui";
import { DateRangePicker } from "@/_components/Datepicker/Datepicker";
import { FormField } from "@/_components/generic/FormItems";
import { PlaneIcon } from "lucide-react";

interface TravelFieldsProps {
  data: any;
  errors: Record<string, string>;
  onChange: (field: any, value: any) => void;
}

export function TravelFields({ data, errors, onChange }: TravelFieldsProps){
    return (
        <>
            <FormField label="Travel Date" error={errors.TravelDateRange} required>
                <DateRangePicker
                    value={data.TravelDateRange}
                    onChange={(val) => {
                        onChange("TravelDateRange", val || { from: "", to: "" });
                    }}
                    placeholder="Pick start and end date"
                />
            </FormField>
            <FormField label="Travel Destination" error={errors.TravelDestination}>
                <input 
                    type="text" 
                    placeholder="Please mention"
                    className={THEME.TextInput}
                    value={data.TravelDestination}
                    onChange={(e) => onChange('TravelDestination', e.target.value)}
                />
            </FormField>
            <FormField label="Travel Reason" error={errors.TravelReason}>
                <input 
                    type="text" 
                    placeholder="If required"
                    className={THEME.TextInput}
                    value={data.TravelReason}
                    onChange={(e) => onChange('Travel', e.target.value)}
                />
            </FormField>
        </>
    )
}

export function TravelHeader(){
    return (
        <div className="flex items-center gap-3 mb-8 border-b pb-4">
            <PlaneIcon className="text-primary w-6 h-6" />
            <h2 className="text-2xl font-bold">Travel Approval Request</h2>
        </div>
    )
}