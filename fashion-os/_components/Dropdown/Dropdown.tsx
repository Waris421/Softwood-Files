'use client'

import { useEffect, useState } from "react";
import { useDebouncedCallback } from "use-debounce";
import { AlertCircle, Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { Button } from "@/_components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/_components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/_components/ui/popover";
import { cn } from "@/lib/utils";

interface ApiOption {
    value: string;
    text: string;
}

interface DropdownOption {
  value: string;
  label: string;
}

interface DropDownProps {
    apiUrl: string;
    placeholder?: string;
    inputName: string;
    onSelect?: (option: DropdownOption | null) => void;
}

export default function DropDown({
    apiUrl,
    placeholder = "Type to search...",
    inputName,
    onSelect
}: DropDownProps) {
    const [mounted, setMounted] = useState(false);
    const [open, setOpen] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [options, setOptions] = useState<DropdownOption[]>([]);
    const [selectedValue, setSelectedValue] = useState<DropdownOption | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        setMounted(true)
    }, []);
    
    const fetchOptions = async(searchQuery: string) => {
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
    
    return (
        <div className="w-75">
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className="w-full justify-between"
                    >
                        <span className="truncate">
                            {selectedValue ? selectedValue.label : placeholder}
                        </span>
                        <ChevronsUpDown className="opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-75 p-0">
                    <Command shouldFilter={false}>
                        <CommandInput 
                        placeholder="Type to search" 
                        onValueChange={debouncedSearch} 
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
                                    value={option.value ?? ""} 
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
            <input type="hidden" name={inputName} value={selectedValue?.value || ''}/>
        </div>
    )
}