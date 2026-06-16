'use client';

import { THEME } from "@/_components/constants/ui";
import { FormField } from "@/_components/generic/FormItems";
import { TimerIcon } from "lucide-react";

interface OverTimeFieldsProps {
  data: any;
  errors: Record<string, string>;
  onChange: (field: any, value: any) => void;
}

export function OverTimeFields({ data, errors, onChange }: OverTimeFieldsProps) {
    return (
        <>
            <FormField label="Reason" error={errors.OverTimeReason} required>
                <input 
                    type="text" 
                    placeholder="Please mention"
                    className={THEME.TextInput}
                    value={data.OverTimeReason}
                    onChange={(e) => onChange('OverTimeReason', e.target.value)}
                />
            </FormField>
            <FormField label="Duration (hrs)" error={errors.OverTimeDuration} required>
                <input 
                    type="number" 
                    placeholder="Please mention"
                    className={THEME.TextInput}
                    value={data.OverTimeDuration}
                    max={data.OverTimeDuration}
                    onChange={(e) => onChange('OverTimeDuration', e.target.value)}
                />
            </FormField>
        </>
    )
}

export function OverTimeHeader(){
    return (
        <div className="flex items-center gap-3 mb-8 border-b pb-4">
            <TimerIcon className="text-primary w-6 h-6" />
            <h2 className="text-2xl font-bold">Over Time Request</h2>
        </div>
    )
}