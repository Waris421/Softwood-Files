'use client'

import { useEffect, useMemo, useState } from "react";
import { AlertCircle, ChevronsUpDown, Loader2, X} from "lucide-react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList} from "@/_components/ui/command";
import { cn } from "@/_components/generic/utils";
import { Checkbox } from "../ui/checkbox";
import { useDebouncedCallback } from "use-debounce";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Button } from "../ui/button";
import { THEME } from "../constants/ui";
import { ScrollArea } from "../ui/scroll-area";

interface DropdownOption {
    value: string;
    label: string;
}

interface ApiOption {
    value: string | number;
    text: string;
}

interface DropDownProps {
    apiUrl?: string;
    isStatic?: boolean;
    staticOptions?: any[];
    widthClass?: string;
    placeholder?: string;
    inputName: string;
    onSelect?: (option: any) => void;
    defaultValue?: string;
    defaultValues?: string[]
    isRequired?: boolean;
    showValue?: boolean;
}

const sanitizeOption = (opt: any): DropdownOption | null => {
    if (!opt) return null;

    return {
        value: String(opt.value ?? ""),
        label: String(opt.label ?? opt.text ?? ""),
    };
}

const applySearch = ((value: String, search: String) => {
    if (value.toLowerCase().includes(search.toLowerCase())) return 1;
    return 0;
})

export function SingleDropdown({
    apiUrl,
    isStatic = true,
    staticOptions = [],
    widthClass = "w-75",
    placeholder = "Type to search...",
    inputName,
    onSelect,
    defaultValue = '',
    isRequired = false,
    showValue = false,
}: DropDownProps) {
    const [mounted, setMounted] = useState(false);
    const [open, setOpen] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [options, setOptions] = useState<DropdownOption[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedValue, setSelectedValue] = useState<DropdownOption | null>(null);

    //Set the selected value if it is provided or options change
    useEffect(() => {
        if (defaultValue && options.length > 0) {
            const found = options.find(opt => opt.value === String(defaultValue));
            if (found) setSelectedValue(found);
        } else if (!defaultValue) {
            setSelectedValue(null);
        }
    }, [defaultValue, options]);

    useEffect(() => {
        setMounted(true);

        if (isStatic) {
            const sanitizedStatic = staticOptions.map((opt: any) => sanitizeOption(opt)).filter(Boolean) as DropdownOption[];
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

            setOptions(formatted);
            
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
        const newValue = (selectedValue as DropdownOption)?.value === option.value ? null : option;

        setSelectedValue(newValue);

        if (onSelect) onSelect(newValue);

        setOpen(false);
    };

    const handleClear = (e: MouseEvent | React.PointerEvent) => {
        e.preventDefault();
        e.stopPropagation();

        setSelectedValue(null);
        if (onSelect) onSelect(null);
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
                            !selectedValue ? "text-muted-foreground" : ""
                        )}>
                            {(selectedValue as DropdownOption)?.label || placeholder}
                        </span>
                        <div className="flex items-center ml-2 border-l pl-2 gap-1">
                            <ChevronsUpDown className="h-4 w-4 opacity-50 shrink-0" />
                            {selectedValue && (
                                <span
                                    role="button"
                                    onPointerDown={handleClear}
                                    className="p-0.5 hover:bg-secondary rounded-sm transition-colors cursor-pointer"
                                >
                                    <X className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
                                </span>
                            )}
                        </div>
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="p-0 w-(--radix-popover-trigger-width) min-w-max">
                    <Command shouldFilter={isStatic} filter={applySearch}>
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
                                        {option.label} {showValue ? `(${option.value})` : ''}
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>
            <input 
                type="hidden" 
                name={inputName} 
                required={isRequired} 
                value={selectedValue?.value ?? ""} 
            />
        </div>
    )
}

export function MultiDropdown({
    apiUrl,
    isStatic = true,
    staticOptions = [],
    widthClass = "w-75",
    placeholder = "Type to search...",
    inputName,
    onSelect,
    defaultValues = [],
    isRequired = false,
    showValue = false,
}: DropDownProps) {
    const [mounted, setMounted] = useState(false);
    const [open, setOpen] = useState(false);
    const [selected, setSelected] = useState<DropdownOption[]>([]);
    const [options, setOptions] = useState<DropdownOption[]>([]);
    const [loading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState("");

    // Sync options with staticOptions only when the CONTENT changes
    useEffect(() => {
        setMounted(true);

        if (isStatic) {
            const sanitizedStatic = staticOptions.map((opt: any) => sanitizeOption(opt)).filter(Boolean) as DropdownOption[];

            setOptions(prev => {
                if (JSON.stringify(prev) === JSON.stringify(sanitizedStatic)) return prev;
                return sanitizedStatic;
            });
        }
    },[isStatic, JSON.stringify(staticOptions)]);


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

            setOptions(formatted);

        } catch(error: any) {
            console.error('Fetch error:', error);
            setOptions([])
            setError(error.message || "Something went wrong");
        } finally {
            setIsLoading(false);
        }
    };
    const debouncedSearch = useDebouncedCallback(fetchOptions, 500);

    const toggleOption = (opt: any) => {
        const isSelected = selected.some(s => s.value === opt.value);

        const next = isSelected ? selected.filter(s => s.value !== opt.value) : [...selected, opt];

        setSelected(next);
        onSelect?.(next);
    }

    const handleClear = (e: React.MouseEvent | React.PointerEvent) => {
        e.preventDefault();
        e.stopPropagation();

        setSelected([]);
        if (onSelect) onSelect([]);
    }

    const visibleOptions = useMemo(() => {
        if (!search) return options;
        return options.filter(opt => {
            const searchStr = `${opt.label} ${opt.value}`.toLowerCase();
            return searchStr.includes(search.toLowerCase());
        });
    }, [options, search]);

    const isAllVisibleSelected = visibleOptions.length > 0 && 
        visibleOptions.every(opt => selected.some(s => s.value === opt.value));

    const handleSelectAll = () => {
        if (isAllVisibleSelected) {
            const visibleValues = visibleOptions.map(o => o.value);
            const next = selected.filter(s => !visibleValues.includes(s.value));
            
            setSelected(next);
            onSelect?.(next);
        } else {
            const toAdd = visibleOptions.filter(opt => !selected.some(s => s.value === opt.value));
            const next = [...selected, ...toAdd];

            setSelected(next);
            onSelect?.(next);
        }
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
        <div className={cn("relative", widthClass)}>
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button variant="outline" className={cn(THEME.DropDown, "w-full justify-between")}>
                        <span className={cn(
                            "truncate",
                            selected.length === 0 ? "text-muted-foreground" : "" // Add this line
                        )}>
                            {selected.length > 0 ? `${selected.length} Selected` : placeholder}
                        </span>
                        <div className="flex items-center ml-2 border-l pl-2 gap-1">
                            <ChevronsUpDown className="h-4 w-4 opacity-50" />
                            {selected.length > 0 &&(
                                <span
                                    role="button"
                                    onPointerDown={handleClear}
                                    className="p-0.5 hover:bg-secondary rounded-sm transition-colors cursor-pointer"
                                >
                                    <X className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
                                </span>
                            )}
                        </div>
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="p-0 w-(--radix-popover-trigger-width) min-w-max">
                    <Command shouldFilter={isStatic} filter={applySearch}>
                        <div className="flex items-center border-b px-3">
                            <Checkbox 
                                checked={isAllVisibleSelected} 
                                onCheckedChange={handleSelectAll}
                                className="h-4 w-4"
                                aria-label="Select all visible"
                                disabled={loading || options.length === 0}
                            />
                            <CommandInput 
                                placeholder="Search..." 
                                onValueChange={(v) => {
                                    setSearch(v);
                                    if (!isStatic) debouncedSearch(v);
                                }}
                                className="border-none focus:ring-0" 
                            />
                        </div>
                        <CommandList>
                            {loading && 
                                <div className="p-4 flex justify-center">
                                    <Loader2 className="animate-spin h-4 w-4" />
                                </div>
                            }{options.map((opt) => (
                                    <CommandItem
                                        key={opt.value}
                                        value={`${opt.label} ${opt.value}`.toLowerCase()}
                                        onSelect={() => toggleOption(opt)}
                                    >
                                        <Checkbox 
                                            checked={selected.some(s => s.value === opt.value)}
                                            className="h-4 w-4"
                                        />
                                        {opt.label} {showValue ? `(${opt.value})` : ''}
                                    </CommandItem>
                                ))}

                            {!loading && error && (
                                <div className="p-2">
                                    <div className="alert alert-error py-2 px-3 text-xs shadow-sm rounded-md">
                                        <AlertCircle className="h-4 w-4" />
                                        <span>{error}</span>
                                    </div>
                                </div>
                            )}

                            {!loading && options.length === 0 && (
                                <CommandEmpty>No results found.</CommandEmpty>
                            )}

                            <CommandGroup>
                                {options.map((opt) => (
                                    <CommandItem
                                        key={opt.value}
                                        value={`${opt.label} ${opt.value}`.toLowerCase()}
                                        onSelect={() => toggleOption(opt)}
                                        className="cursor-pointer"
                                    >
                                        <Checkbox 
                                            checked={selected.some(s => s.value === opt.value)}
                                            className="h-4 w-4"
                                        />
                                        {opt.label} {showValue ? `(${opt.value})` : ''}
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>

            <input 
                type="hidden" 
                name={inputName} 
                required={isRequired && selected.length === 0} 
                value={JSON.stringify(selected.map(s => s.value))} 
            />
        </div>
    );
}