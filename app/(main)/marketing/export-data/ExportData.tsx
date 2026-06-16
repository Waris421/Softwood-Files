'use client';

import { CountryFilter } from "./CountryFilter";
import { Monthfilter } from "./MonthFilter";
import { useDataFilters } from "./Filters";
import { Button } from "@/_components/ui/button";

export default function ExportData() {
    const { setMultipleFilters } = useDataFilters();
    
    const handleApplyFilters = () => {
        const activeFilters = {
            'months': ['mar-2026', 'apr-2026'],
            'countries': ['US', 'CA', 'GB'] 
        };

        setMultipleFilters(activeFilters);
    };

    return (
        <div className="p-6">
            <div className="flex justify-end">
                <Button onClick={handleApplyFilters} className="bg-primary text-white">
                    Apply Filters
                </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <CountryFilter />
                <Monthfilter />
            </div>
        </div>
    )
}