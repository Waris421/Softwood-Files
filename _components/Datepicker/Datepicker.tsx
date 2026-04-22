'use client'

import { Calendar as CalendarIcon, X } from "lucide-react"
import { format } from "date-fns";
import { cn } from "../generic/utils"
import { Button } from "../ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover"
import { Calendar } from "../ui/calendar";
import { THEME } from "../constants/ui";
import { useState } from "react";
import { DateRange } from "react-day-picker";

interface DatePickerProps {
    value: string | undefined
    onChange: (date: string) => void
    placeholder?: string
    required?: boolean
    showClear?: boolean
    disabledDates?: (date: Date) => boolean
    inputName: string
}

interface DateRangeValue {
    from: string | undefined;
    to: string | undefined;
}

interface DateRangePickerProps {
    value?: DateRangeValue;
    onChange: (range: DateRangeValue) => void;
    placeholder?: string;
    required?: boolean;
    showClear?: boolean;
    disabledDates?: (date: Date) => boolean;
    inputName?: string;
}

function DatePicker ({
    value,
    onChange,
    placeholder = "Pick a date",
    required = false,
    showClear = false,
    disabledDates,
    inputName
}: DatePickerProps) {
    const [isOpen, setIsOpen] = useState(false)

    const dateValue = value ? new Date(`${value}T00:00:00`) : undefined
    
    const handleClear = (e: React.MouseEvent) => {
        e.stopPropagation();
        onChange("");
    }

    const handleSelect = (date: Date | undefined) => {
        const formattedDate = date ? format(date, "yyyy-MM-dd") : "";

        onChange(formattedDate);
        setIsOpen(false);
    }

    return (
        <>
            <Popover open={isOpen} onOpenChange={setIsOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant={"outline"}
                        className={cn(
                            THEME.DropDown, 
                            !value && "text-muted-foreground",
                        )}
                    >
                        <div className="flex items-center gap-2 overflow-hidden">
                            <CalendarIcon className="h-4 w-4 opacity-50 shrink-0" />
                            <span className="truncate">
                                {dateValue ? format(dateValue, "PPP") : placeholder}
                            </span>
                        </div>

                        {/* Clear Button: Only shows if there is a value and not required */}
                        <div className="flex items-center gap-1 cursor-pointer">
                            {value && showClear && (
                                <div
                                    role="button"
                                    onClick={handleClear}
                                    className="rounded-full p-0.5 hover:bg-muted transition-colors"
                                >
                                    <X className="h-3 w-3 opacity-70" />
                                </div>
                            )}
                        </div>
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="p-0 w-(--radix-popover-trigger-width) min-w-max">
                    <Calendar 
                        mode="single"
                        className="w-full"
                        selected={dateValue}
                        defaultMonth={dateValue}
                        onSelect={handleSelect}
                        disabled={disabledDates}
                        autoFocus
                        captionLayout="dropdown"
                    />
                </PopoverContent>
            </Popover>
            <input type="hidden" name={inputName} value={value || ""} required={required} />
        </>
    )
}

function DateRangePicker({
    value,
    onChange,
    placeholder = "Pick a date range",
    required = false,
    showClear = false,
    disabledDates,
    inputName = "date_range"
}: DateRangePickerProps) {
    const [isOpen, setIsOpen] = useState(false);

    const dateRangeValue: DateRange = {
        from: value?.from ? new Date(`${value.from}T05:00:00`) : undefined,
        to: value?.to ? new Date(`${value.to}T05:00:00`) : undefined,
    };

    const handleClear = (e: React.MouseEvent) => {
        e.stopPropagation();
        onChange({ from: undefined, to: undefined });
    }

    const handleSelect = (range: DateRange | undefined) => {
        onChange({
            from: range?.from ? format(range.from, "yyyy-MM-dd") : undefined,
            to: range?.to ? format(range.to, "yyyy-MM-dd") : undefined,
        });
    }

    const displayDate = () => {
        if (!dateRangeValue.from) return placeholder;
        if (!dateRangeValue.to) return format(dateRangeValue.from, "LLL dd, y");

        return `${format(dateRangeValue.from, "LLL dd, y")} - ${format(dateRangeValue.to, "LLL dd, y")}`;
    }

    return (
        <>
            <Popover open={isOpen} onOpenChange={setIsOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant={"outline"}
                        className={cn(
                            THEME.DropDown,
                            "justify-between text-left font-normal",
                            !value?.from && "text-muted-foreground"
                        )}
                    >
                        <div className="flex items-center gap-2 overflow-hidden">
                            <CalendarIcon className="h-4 w-4 opacity-50 shrink-0" />
                            <span className="truncate">
                                {displayDate()}
                            </span>
                        </div>
                        <div className="flex items-center gap-1">
                            {value?.from && showClear && (
                                <div
                                    role="button"
                                    onClick={handleClear}
                                    className="rounded-full p-0.5 hover:bg-muted transition-colors"
                                >
                                    <X className="h-3 w-3 opacity-70" />
                                </div>
                            )}
                        </div>
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="p-0 w-auto" align="start">
                    <Calendar 
                        autoFocus
                        mode="range"
                        className="w-full"
                        captionLayout="dropdown"
                        defaultMonth={dateRangeValue.from}
                        selected={dateRangeValue}
                        onSelect={handleSelect}
                        disabled={disabledDates}
                        numberOfMonths={2}
                    />
                </PopoverContent>
            </Popover>

            <input type="hidden" name={`${inputName}_from`} value={value?.from || ""} required={required} />
            <input type="hidden" name={`${inputName}_to`} value={value?.to || ""} required={required} />
        </>
    )
}

export {
    DatePicker,
    DateRangePicker,
}