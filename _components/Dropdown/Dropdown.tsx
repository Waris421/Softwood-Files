'use client'

import { useEffect, useMemo, useState } from "react";
import { Check, ChevronsUpDown, Loader2, X} from "lucide-react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList} from "@/_components/ui/command";
import { cn } from "@/_components/generic/utils";
import { Checkbox } from "../ui/checkbox";
import { useDebouncedCallback } from "use-debounce";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Button } from "../ui/button";
import { THEME } from "../constants/ui";

interface DropdownOption {
    value: string;
    label: string;
}

interface ApiOption {
    value: string | number;
    label: string;
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

function SingleDropdown({
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

    const sanitizedOptions = useMemo(() => {
        return staticOptions.map(opt => sanitizeOption(opt)).filter(Boolean) as DropdownOption[];
    }, [staticOptions]);

    const [selectedValue, setSelectedValue] = useState<DropdownOption | null>(null);

    useEffect(() => { setMounted(true); }, []);

    // Sync selected value with defaultValue or options changes
    useEffect(() => {
        if (defaultValue) {
            const found = sanitizedOptions.find(opt => opt.value === String(defaultValue));
            setSelectedValue(found || null);
        } else {
            setSelectedValue(null);
        }
    }, [defaultValue, sanitizedOptions]);

    const handleSelect = (option: DropdownOption) => {
        const isCurrentlySelected = selectedValue?.value === option.value;
        const newValue = isCurrentlySelected ? null : option;
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
                    <Command filter={applySearch}>
                        <CommandInput placeholder="Type to search" />
                        <CommandList>
                            <CommandEmpty>No results found.</CommandEmpty>
                            <CommandGroup>
                                {sanitizedOptions.map((option) => {
                                    const isSelected = selectedValue?.value === option.value;
                                    return (
                                        <CommandItem
                                            key={option.value}
                                            value={`${option.label} ${option.value}`.toLowerCase()}
                                            onSelect={() => handleSelect(option)}
                                            className={cn(
                                                "flex items-center justify-between py-2 px-3 cursor-pointer",
                                                isSelected ? "bg-accent text-accent-foreground" : ""
                                            )}
                                        >
                                            <span className="truncate flex-1">
                                                {option.label} {showValue ? `(${option.value})` : ''}
                                            </span>
                                            {isSelected && (
                                                <Check className="ml-2 h-4 w-4 shrink-0"/>
                                            )}
                                        </CommandItem>
                                    )
                                })}
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

function SingleDropdownAsync({
    apiUrl,
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

    useEffect(() => { setMounted(true); }, []);

    const fetchOptions = async(searchQuery: string) => {
        setIsLoading(true);
        setError(null);
        try {
            if (!apiUrl) throw new Error('A search url is required');
            const connector = apiUrl.includes("?") ? "&" : "?";
            const response = await fetch(`${apiUrl}${connector}search=${encodeURIComponent(searchQuery)}`);
            if (!response.ok) throw new Error("Failed to fetch data");

            const data: ApiOption[] = await response.json();
            const formattedOptions = data.map(opt => ({ 
                value: String(opt.value), 
                label: opt.label 
            }));
            setOptions(formattedOptions);

            return formattedOptions;
        } catch (err: any) {
            setError(err.message);
            setOptions([]);
            return [];
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        const initialise = async () => {
            setMounted(true);

            const currentOptions = await fetchOptions(defaultValue || '');

            if (defaultValue && currentOptions.length > 0) {
                const match = currentOptions.find(opt => opt.value === String(defaultValue));
                if (match) {
                    setSelectedValue(match);
                    if (onSelect) onSelect(match);
                }
            }
        }

        initialise();
        
    }, [apiUrl, defaultValue]);

    const debouncedSearch = useDebouncedCallback((val) => fetchOptions(val), 500);

    const handleSelect = (option: DropdownOption) => {
        const newValue = selectedValue?.value === option.value ? null : option;
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
                    <Command shouldFilter={false}>
                            <CommandInput placeholder="Type to search..." onValueChange={debouncedSearch} />
                            <CommandList>
                                {isLoading && <div className="p-4 text-center"><Loader2 className="animate-spin h-4 w-4 inline" /></div>}
                                {error && <div className="p-2 text-red-500 text-xs">{error}</div>}
                                {!isLoading && !error && options.length === 0 && <CommandEmpty>No results found.</CommandEmpty>}
                                <CommandGroup>
                                    {options.map((option) => {
                                        const isSelected = selectedValue?.value === option.value;
                                        return (
                                            <CommandItem
                                                key={option.value}
                                                value={`${option.label} ${option.value}`.toLowerCase()}
                                                onSelect={() => handleSelect(option)}
                                                className={cn(
                                                    "flex items-center justify-between py-2 px-3 cursor-pointer",
                                                    isSelected ? "bg-accent text-accent-foreground" : ""
                                                )}
                                            >
                                                <span className="truncate flex-1">
                                                    {option.label} {showValue ? `(${option.value})` : ''}
                                                </span>
                                                {isSelected && (
                                                    <Check className="ml-2 h-4 w-4 shrink-0"/>
                                                )}
                                            </CommandItem>
                                        )
                                    })}
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

function MultiDropdown({
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
    const [search, setSearch] = useState("");
    const [selected, setSelected] = useState<DropdownOption[]>([]);

    const sanitizedOptions = useMemo(() => {
        return staticOptions.map(opt => sanitizeOption(opt)).filter(Boolean) as DropdownOption[];
    }, [staticOptions]);

    useEffect(() => { setMounted(true); }, []);

    //nitial sync for default values
    useEffect(() => {
        if (defaultValues.length > 0) {
            const defaults = defaultValues.map(String);
            const matches = sanitizedOptions.filter(opt => defaults.includes(opt.value));
            setSelected(matches);
        }
    }, [defaultValues, sanitizedOptions]);

    const visibleOptions = useMemo(() => {
        if (!search) return sanitizedOptions;
        return sanitizedOptions.filter(opt => 
            opt.label.toLowerCase().includes(search.toLowerCase()) || 
            opt.value.toLowerCase().includes(search.toLowerCase())
        );
    }, [sanitizedOptions, search]);

    const toggleOption = (opt: DropdownOption) => {
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

    const isAllVisibleSelected = visibleOptions.every(opt => selected.some(s => s.value === opt.value));

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
                    <Command filter={applySearch}>
                        <div className="flex items-center border-b px-3">
                            <Checkbox 
                                checked={isAllVisibleSelected} 
                                onCheckedChange={handleSelectAll}
                                className="h-4 w-4"
                                aria-label="Select all visible"
                                disabled={sanitizedOptions.length === 0}
                            />
                            <CommandInput 
                                placeholder="Search..." 
                                onValueChange={setSearch}
                                className="border-none focus:ring-0" 
                            />
                        </div>
                        <CommandList>
                            <CommandEmpty>No results found.</CommandEmpty>
                            {/* Only render this ONCE */}
                            <CommandGroup>
                                {sanitizedOptions.map((opt) => (
                                    <CommandItem
                                        key={opt.value}
                                        value={`${opt.label} ${opt.value}`.toLowerCase()}
                                        onSelect={() => toggleOption(opt)}
                                        className="cursor-pointer"
                                    >
                                        <Checkbox
                                            checked={selected.some((s) => s.value === opt.value)}
                                            className="h-4 w-4 mr-2"
                                        />
                                        {opt.label} {showValue ? `(${opt.value})` : ""}
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

function MultiDropdownAsync({
    apiUrl,
    widthClass = "w-75",
    placeholder = "Search and select...",
    inputName,
    onSelect,
    defaultValues = [],
    isRequired = false,
    showValue = false,
}: DropDownProps) {
    const [mounted, setMounted] = useState(false);
    const [open, setOpen] = useState(false);
    const [options, setOptions] = useState<DropdownOption[]>([]);
    const [selected, setSelected] = useState<DropdownOption[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => { setMounted(true); }, []);

    const fetchOptions = async (query: string) => {
        if (!apiUrl) return;
        setIsLoading(true);
        setError(null);
        
        try {
            const connector = apiUrl.includes("?") ? "&" : "?";
            const res = await fetch(`${apiUrl}${connector}search=${encodeURIComponent(query)}`);
            if (!res.ok) throw new Error("Failed to fetch");
            const data: ApiOption[] = await res.json();
            setOptions(data.map(opt => ({ value: String(opt.value), label: opt.label })));
        } catch (err: any) {
            setError(err.message);
            setOptions([]);
        } finally {
            setIsLoading(false);
        }
    }

    const debouncedSearch = useDebouncedCallback(fetchOptions, 500);

    const toggleOptions = (opt: DropdownOption) => {
        const isSelected = selected.some(s => s.value === opt.value);

        const next = isSelected ? selected.filter(s => s.value !== opt.value) : [...selected, opt];
        setSelected(next);
        onSelect?.(next);
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
            
        </div>
    )
}

export {
    SingleDropdown,
    SingleDropdownAsync,
    MultiDropdown,
    MultiDropdownAsync,
}
