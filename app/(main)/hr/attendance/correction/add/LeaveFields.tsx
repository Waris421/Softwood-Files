'use client';

import { THEME } from "@/_components/constants/ui";
import { DatePicker, DateRangePicker } from "@/_components/Datepicker/Datepicker";
import { SingleDropdown } from "@/_components/Dropdown/Dropdown";
import { DropdownOption } from "@/_components/Dropdown/types";
import { FormField } from "@/_components/generic/FormItems";
import TimePicker from "@/_components/Timepicker/Timepicker.";
import { UserMinus } from "lucide-react";

interface LeaveFieldsProps {
  data: any;
  errors: Record<string, string>;
  onChange: (field: any, value: any) => void;
}

const FULL_LEAVE_TYPES = ['FSL', 'FCL', 'AL', 'CPL'];
const HALF_LEAVE_TYPES = ['HSL', 'HCL']
const SHORT_LEAVE_TYPES = ['SHL']

export function LeaveFields({ data, errors, onChange }: LeaveFieldsProps) {
    const LeaveOptions: DropdownOption[] = data.AllowableOptions;
    const selectedLeaveType = data.SelectedLeaveType;

    const isFullLeave = FULL_LEAVE_TYPES.includes(selectedLeaveType);
    const isHalfLeave = HALF_LEAVE_TYPES.includes(selectedLeaveType);
    const isShortLeave = SHORT_LEAVE_TYPES.includes(selectedLeaveType);
    
    
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

            {(isHalfLeave || isShortLeave) && (
                <FormField label="Leave Date" error={errors.LeaveDate} required>
                    <DatePicker 
                        value={data.LeaveDate}
                        inputName="LeaveDate"
                        onChange={(val) => onChange('LeaveDate', val)}
                    />
                </FormField>
            )}
            
            {isFullLeave && (
                <FormField label="Leave Date" error={errors.LeavesRange} required>
                    <DateRangePicker
                        value={data.LeavesRange}
                        onChange={(val) => {
                            onChange("LeavesRange", val || { from: "", to: "" });
                        }}
                        placeholder="Pick start and end date"
                    />
                </FormField>
            )}

            {isShortLeave && (
                <>
                    <FormField label="Start Time" error={errors.SHLStartTime} required>
                        <TimePicker 
                            inputName="SHLStartTime"
                            value={data.SHLStartTime}
                            onChange={(val) => onChange('SHLStartTime', val)}
                        />
                    </FormField>

                    <FormField label="Duration" error={errors.SHLDuration} required>
                        <input 
                            type="number"
                            placeholder="Max 120"
                            className={THEME.TextInput}
                            min={0}
                            max={120}
                            value={data.SHLDuration}
                            onChange={(e) => onChange('SHLDuration', e.target.value)}
                        />
                    </FormField>
                </>
            )}
            
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