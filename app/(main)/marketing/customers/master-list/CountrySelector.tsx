'use client';

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import LoadingIcon from "@/_components/generic/Loading";
import { Checkbox } from "@/_components/ui/checkbox";
import { cn } from "@/_components/generic/utils";
import { THEME } from "@/_components/constants/ui";

type Country = {
    CountryCode: string,
    CountryName: string,
    Quantity: string,
    Price: string,
    latitude: number,
    longitude: number,
}

export default function CountrySelector({ selected, onChange }: {
    selected: string[]
    onChange: (codes: string[]) => void
}) {
    const [data, setData] = useState<Country[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const searchParams = useSearchParams()
    const searchParamsString = searchParams.toString()

    //Fetch data from the api
    useEffect(() => {
        const fetchCountries = async() => {
            try {
                setLoading(true);

                const response = await fetch(`/api/marketing/export-data/countries?${searchParamsString}`);

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
        }, [searchParamsString]);

    //Data that match the search query
    const filteredData = useMemo(() => {
        const matched = data.filter(country => 
            country.CountryName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            country.CountryCode.toLowerCase().includes(searchQuery.toLowerCase())
        );

        return matched.slice(0, 50)
    }, [data, searchQuery]);

    const isAllVisibleSelected = filteredData.length > 0 && filteredData.every(c => selected.includes(c.CountryCode));
    const isSomeVisibleSelected = filteredData.length > 0 && filteredData.some(c => selected.includes(c.CountryCode)) && !isAllVisibleSelected;

    //Helper function to add/remove country from the selected array
    const handleCheckboxChange = (countryCode: string) => {
        const updated = selected.includes(countryCode)
            ? selected.filter((code) => code !== countryCode)
            : [...selected, countryCode];
        
        onChange(updated);
    }

    //Helper function to select/deselect all visible rows
    const handleSelectAllChange = () => {
        if (isAllVisibleSelected) {
            const visibleCodes = filteredData.map(c => c.CountryCode);
            onChange(selected.filter(code => !visibleCodes.includes(code)));
        } else {
            const visibleCodes = filteredData.map(c => c.CountryCode);
            onChange(Array.from(new Set([...selected, ...visibleCodes])));
        }
    };

    return (
        <div className="card shadow-xl border border-base-200 rounded-lg w-full max-w-sm bg-base-100">
            <div className="card-body p-4 flex flex-col h-96 max-h-96">
                <div className="z-20 pb-2 border-b border-base-300 bg-base-100">
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
                                            className={cn("cursor-pointer transition-colors border-b border-base-200", THEME.Table.RowHover, "bg-base-100")}
                                            onClick={() => handleCheckboxChange(country.CountryCode)}
                                        >
                                            <td className="py-2">
                                                <div className="font-medium text-sm text-base-content">
                                                    {country.CountryName}
                                                </div>
                                                <div className="text-xs text-base-content/60 mt-0.5">
                                                    {country.Quantity} @ ${parseFloat(country.Price).toFixed(2)}
                                                </div>
                                            </td>
                                            <td className="text-center py-2 align-middle" onClick={(e) => e.stopPropagation()}>
                                                <Checkbox 
                                                    className="size-5 border-base-200"
                                                    checked={selected.includes(country.CountryCode)}
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