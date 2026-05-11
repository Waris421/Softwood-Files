'use client'

import { useEffect, useMemo, useRef, useState } from "react";
import { AlertCircle, Check, ChevronsUpDown, Loader2, X} from "lucide-react";
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

    //Set the static values
    useEffect(() => {
        setMounted(true);

        if (isStatic) {
            const sanitizedStatic = staticOptions.map((opt: any) => sanitizeOption(opt)).filter(Boolean) as DropdownOption[];
            setOptions(sanitizedStatic);
        } else {
            fetchOptions('');
        }

        if (defaultValue) {
            setSelectedValue(sanitizeOption(defaultValue));
        }
    }, [apiUrl, staticOptions]);

    const fetchOptions = async(searchQuery: string) => {
        if (isStatic || !apiUrl) return;

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
                label: option.label,
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
                                {options.map((option, idx) => {
                                    const isSelected = selectedValue?.value === option.value;
                                    return(
                                        <CommandItem
                                            key={`${idx}-${option.value}`}
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
                                    )})}
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

    const inputRef = useRef<HTMLInputElement>(null);

    // Sync options with staticOptions only when the CONTENT changes
    useEffect(() => {
        setMounted(true);

        if (isStatic) {
            const sanitizedStatic = staticOptions
                .map((opt: any) => sanitizeOption(opt))
                .filter(Boolean) as DropdownOption[];

            setOptions(prev => {
                if (JSON.stringify(prev) === JSON.stringify(sanitizedStatic)) return prev;
                return sanitizedStatic;
            });
        } else {
            fetchOptions('');
        }
    }, [isStatic, JSON.stringify(staticOptions), apiUrl]);

    // Set up the default values
    useEffect(() => {
        if (defaultValues.length > 0 && options.length > 0 && selected.length === 0) {
            // Convert defaultValues to strings to match sanitized option values
            const stringifiedDefaults = defaultValues.map(v => String(v));

            const initiallySelected = options.filter((opt) =>
                stringifiedDefaults.includes(opt.value)
            );

            if (initiallySelected.length > 0) {
                setSelected(initiallySelected);

                onSelect?.(initiallySelected);
            }
        }
    }, [options, defaultValues]);

    //Focus on search bar when popover opens
    useEffect(() => {
        if (open) {
            const timer = setTimeout(() => {
                inputRef.current?.focus();
            }, 0);
            return () => clearTimeout(timer);
        }
    }, [open]);

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
                label: option.label,
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
                                ref={inputRef}
                                placeholder="Search..." 
                                onValueChange={(v) => {
                                    setSearch(v);
                                    if (!isStatic) debouncedSearch(v);
                                }}
                                className="border-none focus:ring-0" 
                            />
                        </div>
                        <CommandList>
                            {loading && (
                                <div className="p-4 flex justify-center">
                                    <Loader2 className="animate-spin h-4 w-4" />
                                </div>
                            )}

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

                            {/* Only render this ONCE */}
                            <CommandGroup>
                                {options.map((opt, idx) => (
                                    <CommandItem
                                        key={`${idx}-${opt.value}`}
                                        value={`${opt.label} ${opt.value}`.toLowerCase()}
                                        onSelect={() => toggleOption(opt)}
                                        className="cursor-pointer"
                                    >
                                        <Checkbox
                                            checked={selected.some((s) => s.value === opt.value)}
                                            className="h-4 w-4 mr-2" // Added margin for spacing
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
            if (!defaultValue) return;
            const currentOptions = await fetchOptions(defaultValue);
            const match = currentOptions.find(opt => opt.value === String(defaultValue));
            if (match) {
                setSelectedValue(match);
                if (onSelect) onSelect(match);
            }
        }
        initialise();
    }, [apiUrl, defaultValue]);

    useEffect(() => {
        if (open && options.length === 0 && !isLoading) {
            fetchOptions('');
        }
    }, [open]);

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
                                {options.map((option, idx) => {
                                    const isSelected = selectedValue?.value === option.value;
                                    return (
                                        <CommandItem
                                            key={`${idx}-${option.value}`}
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

export {
    SingleDropdown,
    SingleDropdownAsync,
    MultiDropdown
}
