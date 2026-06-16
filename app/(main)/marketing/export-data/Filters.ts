import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

export function useDataFilters() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const getFilterArray = useCallback((key: string): string[] => {
        return searchParams.getAll(key);
    }, [searchParams]);

    const setFilterArray = useCallback((key: string, values: string[]) => {
        const params = new URLSearchParams(searchParams.toString());
        
        params.delete(key);
        
        values.forEach(value => {
            if (value) params.append(key, value);
        });

        router.push(`${pathname}?${params.toString()}`, { scroll: false });
    }, [searchParams, pathname, router]);

    const setAllFilters = useCallback((filters: Record<string, string[]>) => {
        const params = new URLSearchParams();
        
        Object.entries(filters).forEach(([key, values]) => {
            values.forEach(val => {
                if (val) params.append(key, val);
            });
        });

        router.push(`${pathname}?${params.toString()}`, { scroll: false });
    }, [pathname, router]);

    return { 
        getFilterArray, 
        setFilterArray,
        setAllFilters,
        allParams: searchParams.toString() 
    };
}