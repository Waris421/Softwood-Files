'use client'

import { useEffect, useState, MouseEvent } from "react";
import { useDebouncedCallback } from "use-debounce";
import { AlertCircle, Check, ChevronsUpDown, Loader2, X } from "lucide-react";
import { Button } from "@/_components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/_components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/_components/ui/popover";
import { cn } from "@/_components/generic/utils";

interface ApiOption {
    value: string;
    text: string;
}

interface DropdownOption {
  value: string;
  label: string;
}

interface DropDownProps {
    apiUrl?: string;
    isStatic?: boolean;
    staticOptions?: DropdownOption[];
    widthClass?: string;
    placeholder?: string;
    inputName: string;
    onSelect?: (option: DropdownOption | null) => void;
    defaultValue?: DropdownOption;
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
}: DropDownProps) {
    const [mounted, setMounted] = useState(false);
    const [open, setOpen] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [options, setOptions] = useState<DropdownOption[]>([]);
    const [selectedValue, setSelectedValue] = useState<DropdownOption | null>(defaultValue || null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        setMounted(true)
        
        if (isStatic) {
            setOptions(staticOptions);
        }

        if (defaultValue) {
            setSelectedValue(defaultValue);

            if (onSelect) onSelect(defaultValue);
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

            const formatted =  apiOptions.map(option => ({
                value: option.value,
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

    const handleClear = (e: MouseEvent | React.PointerEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setSelectedValue(null);
        if (onSelect) onSelect(null);
    };

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
                        className="w-full justify-between bg-gray-200 dark:bg-gray-600"
                    >
                        <span className="truncate">
                            {selectedValue ? selectedValue.label : placeholder}
                        </span>
                        <div className="flex items-center ml-2 border-l pl-2 gap-1">
                            {selectedValue && (
                                <span
                                    role="button"
                                    tabIndex={0}
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
                <PopoverContent className={cn("p-0", widthClass)}>
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
                                    key={option.value ?? "null-identifier"}
                                    value={`${option.label} ${option.value}`.toLowerCase()}
                                    onSelect={() => {
                                        const newValue = selectedValue?.value === option.value ? null : option;
                                        setSelectedValue(newValue);
                                        if (onSelect) onSelect(newValue);
                                        setOpen(false);
                                    }}
                                    >
                                    <Check
                                        className={cn(
                                        "mr-2 h-4 w-4",
                                        selectedValue?.value === option.value ? "opacity-100" : "opacity-0"
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
            <input type="hidden" name={inputName} value={selectedValue?.value ?? ""} readOnly/>
        </div>
    )
}