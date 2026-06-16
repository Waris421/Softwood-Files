'use client';

import { useEffect, useMemo, useState } from "react";
import { useDataFilters } from "./Filters";
import { ColumnDef } from "@tanstack/react-table";
import LoadingIcon from "@/_components/generic/Loading";
import { Checkbox } from "@/_components/ui/checkbox";
import { cn } from "@/_components/generic/utils";
import { THEME } from "@/_components/constants/ui";

type Country = {
    CountryCode: string,
    CountryName: string,
    Quantity: number,
    Price: number,
    latitude: number,
    longitude: number,
}

// Helper function to format numbers into k, m, b format
const formatQuantity = (num: number): string => {
    if (num >= 1e9) return (num / 1e9).toFixed(1).replace(/\.0$/, '') + 'b';
    if (num >= 1e6) return (num / 1e6).toFixed(1).replace(/\.0$/, '') + 'm';
    if (num >= 1e3) return (num / 1e3).toFixed(1).replace(/\.0$/, '') + 'k';
    return num.toString();
};

export function CountryFilter() {
    const [data, setData] = useState<Country[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const { getFilterArray, setFilterArray, allParams } = useDataFilters();

    const urlCountries = getFilterArray('countries');
    const selectedCountries = urlCountries.length > 0 ? urlCountries : [];

    const urlMonths = getFilterArray('months');
    const activeMonths = urlMonths.length > 0 ? urlMonths : [];

    //Fetch data from the api
    useEffect(() => {
        const fetchCountries = async() => {
            try {
                setLoading(true);

                const params = new URLSearchParams();
                
                activeMonths.forEach(m => params.append('months', m));
                selectedCountries.forEach(code => params.append('countries', code));

                const response = await fetch(`/api/marketing/export-data/countries?${params.toString()}`);
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.details?.message || "Failed to fetch requests");
                }

                const resData: Country[] = await response.json();
                setData(resData);
            } catch (err: any) {
                setError(err.message || 'Something went wrong');
            } finally {
                setLoading(false);
            }
        }

        fetchCountries();
    }, [allParams]);

    //Data that match the search query
    const filteredData = useMemo(() => {
        const matched = data.filter(country => 
            country.CountryName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            country.CountryCode.toLowerCase().includes(searchQuery.toLowerCase())
        );

        return matched.slice(0, 50)
    }, [data, searchQuery]);

    const isAllVisibleSelected = filteredData.length > 0 && filteredData.every(c => selectedCountries.includes(c.CountryCode));
    const isSomeVisibleSelected = filteredData.length > 0 && filteredData.some(c => selectedCountries.includes(c.CountryCode)) && !isAllVisibleSelected;

    //Helper function to add/remove country from the selected array
    const handleCheckboxChange = (countryCode: string) => {
        const updated = selectedCountries.includes(countryCode)
            ? selectedCountries.filter((code) => code !== countryCode)
            : [...selectedCountries, countryCode];
        
        setFilterArray('countries', updated);
    }

    //Helper function to select/deselect all visible rows
    const handleSelectAllChange = () => {
        if (isAllVisibleSelected) {
            const visibleCodes = filteredData.map(c => c.CountryCode);
            setFilterArray('countries', selectedCountries.filter(code => !visibleCodes.includes(code)));
        } else {
            const visibleCodes = filteredData.map(c => c.CountryCode);
            setFilterArray('countries', Array.from(new Set([...selectedCountries, ...visibleCodes])));
        }
    };

    return (
        <div className={cn("card shadow-xl border border-base-200 rounded-lg w-full max-w-sm", THEME.Background.Base)}>
            <div className="card-body p-4 flex flex-col h-96 max-h-96">
                <div className={cn("z-20 pb-2 border-b border-base-300", THEME.Background.Base)}>
                    <div className="flex items-center justify-between py-2 px-1">
                        <span className="text-xs font-bold text-base-content/70">Country</span>
                        <div className="flex items-center justify-center size-8">
                            <Checkbox 
                                className="size-8 border-base-200"
                                checked={isAllVisibleSelected ? true : isSomeVisibleSelected ? "indeterminate" : false}
                                onCheckedChange={handleSelectAllChange}
                                disabled={loading || !!error}
                            />
                        </div>
                    </div>
                    <input 
                        type="text"
                        placeholder="Search country..."
                        className={cn(THEME.TextInput, "w-full mt-1")}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        disabled={loading || !!error}
                    />
                </div>
                {loading && <LoadingIcon />}

                {error && (
                    <div className={cn("text-xs p-2", THEME.Text.RedText)}>
                        <span>{error}</span>
                    </div>
                )}

                {!loading && !error && (
                    <div className="overflow-y-auto grow pr-1 Custom-scrollbar">
                        <table className="table table-compact w-full">
                            <tbody>
                                {filteredData.length === 0 ? (
                                    <tr>
                                        <td colSpan={2} className="text-center py-8 text-xs text-base-content/50">
                                            No countries found matching "{searchQuery}"
                                        </td>
                                    </tr>
                                ) : (
                                    filteredData.map((country) => (
                                        <tr
                                            key={country.CountryCode}
                                            className={cn("cursor-pointer transition-colors border-b border-base-200", THEME.Table.RowHover, THEME.Background.Base)}
                                            onClick={() => handleCheckboxChange(country.CountryCode)}
                                        >
                                            <td className="py-2">
                                                <div className="font-medium text-sm text-base-content">
                                                    {country.CountryName}
                                                </div>
                                                <div className="text-xs text-base-content/60 mt-0.5">
                                                    {formatQuantity(country.Quantity)} at {country.Price.toFixed(2)}
                                                </div>
                                            </td>
                                            <td className="text-center py-2 align-middle" onClick={(e) => e.stopPropagation()}>
                                                <Checkbox 
                                                    className="size-5 border-base-200"
                                                    checked={selectedCountries.includes(country.CountryCode)}
                                                    onCheckedChange={() => handleCheckboxChange(country.CountryCode)}
                                                />
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    )
}