'use client';

import { THEME } from "@/_components/constants/ui";
import { DateRangePicker } from "@/_components/Datepicker/Datepicker";
import { SingleDropdown } from "@/_components/Dropdown/Dropdown";
import { DropdownOption } from "@/_components/Dropdown/types";
import { FormField } from "@/_components/generic/FormItems";
import { UserMinus } from "lucide-react";

interface LeaveFieldsProps {
  data: any;
  errors: Record<string, string>;
  onChange: (field: any, value: any) => void;
}

export function LeaveFields({ data, errors, onChange }: LeaveFieldsProps) {
    const LeaveOptions: DropdownOption[] = data.AllowableOptions;
    
    return (
        <>
            <FormField label='Leave Type' error={errors.SelectedLeaveType} required>
                <SingleDropdown 
                    inputName="LeaveType"
                    placeholder="select a type"
                    staticOptions={LeaveOptions}
                    widthClass='w-full'
                    onSelect={(selectedOption: DropdownOption) => onChange('SelectedLeaveType', selectedOption?.value)}
                />
            </FormField>
            <FormField label="Leave Date" error={errors.LeaveStartDate} required>
                <DateRangePicker
                    value={data.LeavesRange}
                    onChange={(val) => {
                        onChange("LeavesRange", val || { from: "", to: "" });
                    }}
                    placeholder="Pick start and end date"
                />
            </FormField>
            <FormField label="Leave Reason" error={errors.LeaveReason}>
                <input 
                    type="text" 
                    placeholder="If required"
                    className={THEME.TextInput}
                    value={data.LeaveReason}
                    onChange={(e) => onChange('LeaveReason', e.target.value)}
                />
            </FormField>
        </>
    )
}

export function LeaveHeader(){
    return (
        <div className="flex items-center gap-3 mb-8 border-b pb-4">
            <UserMinus className="text-primary w-6 h-6" />
            <h2 className="text-2xl font-bold">Leave Request</h2>
        </div>
    )
}