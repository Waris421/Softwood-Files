'use client'

import { useEffect, useState, MouseEvent } from "react";
import { useDebouncedCallback } from "use-debounce";
import { AlertCircle, Check, ChevronsUpDown, Loader2, X } from "lucide-react";
import { Button } from "@/_components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/_components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/_components/ui/popover";
import { cn } from "@/_components/generic/utils";
import { THEME } from "../constants/ui";

interface ApiOption {
    value: string | number;
    text: string;
}

interface DropdownOption {
  value: string;
  label: string;
}

interface DropDownProps {
    apiUrl?: string;
    isStatic?: boolean;
    staticOptions?: any[];
    widthClass?: string;
    placeholder?: string;
    inputName: string;
    onSelect?: (option: DropdownOption | DropdownOption[] | null) => void;
    defaultValue?: any;
    isMultiSelect?: boolean;
    isRequired?: boolean;
}

export default function DropDown({
    apiUrl,
    isStatic = false,
    staticOptions = [],
    widthClass = "w-75",
    placeholder = "Type to search...",
    inputName,
    onSelect,
    defaultValue,
    isMultiSelect = false,
    isRequired = false,
}: DropDownProps) {
    const [mounted, setMounted] = useState(false);
    const [open, setOpen] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [options, setOptions] = useState<DropdownOption[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const sanitizeOption = (opt: any): DropdownOption | null => {
        if (!opt) return null;
        return {
            value: String(opt.value ?? ""),
            label: String(opt.label ?? opt.text ?? ""),
        };
    }
    const [selectedValue, setSelectedValue] = useState<DropdownOption | DropdownOption[] | null>(
        isMultiSelect ? (Array.isArray(defaultValue) ? defaultValue.map(sanitizeOption).filter(Boolean) : []) : (defaultValue || null)
    );

    useEffect(() => {
        setMounted(true)
        
        if (isStatic) {
            const sanitizedStatic = staticOptions.map(opt => sanitizeOption(opt)).filter(Boolean) as DropdownOption[];
            setOptions(sanitizedStatic);
        }

        if (defaultValue) {
            setSelectedValue(sanitizeOption(defaultValue));
        }
    }, [isStatic, staticOptions, defaultValue]);
    
    const fetchOptions = async(searchQuery: string) => {
        if (isStatic || !apiUrl) return;

        if (!searchQuery) {
            setOptions([]);
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const connector = apiUrl.includes("?") ? "&" : "?";
            const response = await fetch(`${apiUrl}${connector}search=${encodeURIComponent(searchQuery)}`);
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`Error: ${errorData.details.message}`);
            }
            
            const apiOptions: ApiOption[] = await response.json();

            const formatted: DropdownOption[] = apiOptions.map(option => ({
                value: String(option.value),
                label: option.text,
            }));
            setOptions(formatted)
        } catch (error: any) {
            console.error('Fetch error:', error);
            setOptions([])
            setError(error.message || "Something went wrong");
        } finally {
            setIsLoading(false);
        }        
    }

    const debouncedSearch = useDebouncedCallback((value: string) => {
        fetchOptions(value);
    }, 500);

    const handleSelect = (option: DropdownOption) => {
        if (isMultiSelect) {
            const currentValues = Array.isArray(selectedValue) ? selectedValue : [];
            const isExisting = currentValues.some((item) => item.value === option.value);

            const newValue = isExisting
                ? currentValues.filter((item) => item.value !== option.value)
                : [...currentValues, option];

            setSelectedValue(newValue);

            if (onSelect) onSelect(newValue);
        } else {
            const newValue = (selectedValue as DropdownOption)?.value === option.value ? null : option;

            setSelectedValue(newValue);
            if (onSelect) onSelect(newValue);
            setOpen(false);
        }
    }

    const handleClear = (e: MouseEvent | React.PointerEvent) => {
        e.preventDefault();
        e.stopPropagation();

        const emptyValue = isMultiSelect ? [] : null;
        
        setSelectedValue(emptyValue);
        if (onSelect) onSelect(emptyValue);
    };

    // Helper to check if an option is selected
    const isItemSelected = (value: string) => {
        if (isMultiSelect && Array.isArray(selectedValue)) {
            return selectedValue.some((item) => item.value === value);
        }

        return (selectedValue as DropdownOption)?.value === value;
    }

    //Helper to check if there is a selected value or not.
    const isPlaceholderActive = () => {
        if (isMultiSelect && Array.isArray(selectedValue)) {
            return selectedValue.length === 0;
        }
        return !selectedValue;
    };
    
    // Helper to get the display label
    const getDisplayLabel = () => {
        if (isMultiSelect && Array.isArray(selectedValue)) {
            return selectedValue.length > 0 
                ? `${selectedValue.length} selected` 
                : placeholder;
        }
        return (selectedValue as DropdownOption)?.label || placeholder;
    }

    if (!mounted) {
        return (
            <div className={cn("w-40", widthClass)}>
                <Button variant="outline" className="w-full justify-between opacity-50 cursor-not-allowed">
                    <span className="truncate">{placeholder}</span>
                    <ChevronsUpDown className="opacity-50" />
                </Button>
            </div>
        );
    }
    
    return (
        <div className={cn("w-40", widthClass)}>
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className={THEME.DropDown}
                    >
                        <span className={cn(
                            "truncate",
                            isPlaceholderActive() ? "text-muted-foreground" : ""
                        )}>
                            {getDisplayLabel()}
                        </span>
                        <div className="flex items-center ml-2 border-l pl-2 gap-1">
                            {((isMultiSelect && Array.isArray(selectedValue) && selectedValue.length > 0) || (!isMultiSelect && selectedValue)) && (
                                <span
                                    role="button"
                                    onPointerDown={handleClear}
                                    className="p-0.5 hover:bg-secondary rounded-sm transition-colors cursor-pointer"
                                >
                                    <X className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
                                </span>
                            )}
                            <ChevronsUpDown className="h-4 w-4 opacity-50 shrink-0" />
                        </div>
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="p-0 w-(--radix-popover-trigger-width) min-w-max">
                    <Command shouldFilter={isStatic}>
                        <CommandInput 
                            placeholder="Type to search" 
                            onValueChange={isStatic ? undefined : debouncedSearch}
                        />
                        <CommandList>
                            {isLoading && (
                                <div className="flex items-center justify-center p-4">
                                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                                </div>
                            )}

                            {!isLoading && error && (
                                <div className="p-2">
                                    <div className="alert alert-error py-2 px-3 text-xs shadow-sm rounded-md">
                                        <AlertCircle className="h-4 w-4" />
                                        <span>{error}</span>
                                    </div>
                                </div>
                            )}

                            {!isLoading && options.length === 0 && (
                                <CommandEmpty>No results found.</CommandEmpty>
                            )}
                            <CommandGroup>
                                {options.map((option) => (
                                    <CommandItem
                                    key={option.value}
                                    value={`${option.label} ${option.value}`.toLowerCase()}
                                    onSelect={() => handleSelect(option)}
                                    >
                                    <Check
                                        className={cn(
                                        "mr-2 h-4 w-4",
                                        isItemSelected(option.value) ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    {option.label}
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>
            {/* Hidden Input For submitting value to backend */}
            {isMultiSelect && Array.isArray(selectedValue) ? (
                selectedValue.map((opt) => (
                    <input key={opt.value} type="hidden" name={inputName} value={opt.value} />
                ))
            ) : (
                <input type="hidden" name={inputName} required={isRequired} value={(selectedValue as DropdownOption)?.value ?? ""} />
            )}
        </div>
    )
}