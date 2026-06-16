'use client';

import { THEME } from "@/_components/constants/ui";
import LoadingIcon from "@/_components/generic/Loading";
import { cn } from "@/_components/generic/utils";
import { Button } from "@/_components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/_components/ui/popover";
import { format, isBefore, subMonths } from "date-fns";
import { CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { useDataFilters } from "./Filters";

type Month = {
    Year: number,
    Month: string,
    Quantity: number,
    Price: number,
}

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

// Helper function to format numbers into k, m, b format
const formatQuantity = (num: number): string => {
    if (num >= 1e9) return (num / 1e9).toFixed(1).replace(/\.0$/, '') + 'b';
    if (num >= 1e6) return (num / 1e6).toFixed(1).replace(/\.0$/, '') + 'm';
    if (num >= 1e3) return (num / 1e3).toFixed(1).replace(/\.0$/, '') + 'k';
    return num.toString();
};

export function Monthfilter() {
    const [data, setData] = useState<Month[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isOpen, setIsOpen] = useState(false);
    const { getFilterArray, setFilterArray, allParams } = useDataFilters();
    const [hoveredMonth, setHoveredMonth] = useState<Date | null>(null);

    const currentYear = new Date().getFullYear();
    const [leftYear, setLeftYear] = useState(currentYear - 1);
    const [rightYear, setRightYear] = useState(currentYear);
    const [range, setRange] = useState<{ from: Date | null; to: Date | null }>(() => {
        const today = new Date();
        const oneYearAgo = subMonths(today, 12);
        return {
            from: new Date(oneYearAgo.getFullYear(), oneYearAgo.getMonth(), 1),
            to: new Date(today.getFullYear(), today.getMonth(), 0)
        };
    });

    const urlCountries = getFilterArray('countries');
    const activeCountries = urlCountries.length > 0 ? urlCountries : [];

    useEffect(() => {
        const fetchMonths = async () => {
            try {
                setLoading(true);

                const params = new URLSearchParams();

                activeCountries.forEach(c => params.append('countries', c));
                
                const response = await fetch(`/api/marketing/export-data/months?${params.toString()}`);
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.details?.message || "Failed to fetch requests");
                }
                const resData: Month[] = await response.json();
                setData(resData);
            } catch (err: any) {
                setError(err.message || 'Something went wrong');
            } finally {
                setLoading(false);
            }
        };

        fetchMonths();
    }, [allParams]);

    //Helper function to return a month's data if is is available.
    const getMonthData = (monthName: string, year: number) => {
        return data.find(
            (item) => item.Month.toLowerCase().startsWith(monthName.toLowerCase()) && item.Year === year
        );
    }
    
    const isInRange = (monthIndex: number, year: number) => {
        if (!range.from) return false;
        const date = new Date(year, monthIndex, 1);
        
        if (range.to) {
            return (date >= range.from && date <= range.to);
        }
        
        if (hoveredMonth) {
            return (date >= range.from && date <= hoveredMonth);
        }

        return date.getTime() === range.from.getTime();
    };

    const handleMonthClick = (monthIndex: number, year: number) => {
        const clickedDate = new Date(year, monthIndex, 1);
        let newRange;

        if (!range.from || (range.from && range.to)) {
            newRange = { from: clickedDate, to: null };
            setRange(newRange);
        } else if (clickedDate < range.from) {
            newRange = { from: clickedDate, to: null };
            setRange(newRange);
        } else {
            newRange = { ...range, to: clickedDate };
            setRange(newRange);
            setIsOpen(false);
            
            const formattedMonths = [
                `${format(newRange.from, 'MMM-yyyy').toLowerCase()}`,
                `${format(clickedDate, 'MMM-yyyy').toLowerCase()}`
            ];
            setFilterArray('months', formattedMonths);
        }
    };

    return (
        <div className={"grid gap-2 w-full max-w-xs"}>
            <Popover open={isOpen} onOpenChange={setIsOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        className={cn(
                            THEME.DropDown,
                            !range.from && "text-base-content/50",
                            error && THEME.Text.RedText,
                        )}
                    >
                        <CalendarIcon className="h-4 w-4 mr-2 shrink-0 text-muted-foreground" />
                        <span className="truncate text-left w-full">
                            {range.from ? (
                                range.to ? (
                                    `${format(range.from, "MMM yyyy")} - ${format(range.to, "MMM yyyy")}`
                                ) : (
                                    `${format(range.from, "MMM yyyy")} - Select End`
                                )
                            ) : (
                                <span>Pick a month range</span>
                            )}
                        </span>
                    </Button>
                </PopoverTrigger>
                <PopoverContent className={cn("w-auto sm:max-w-xl p-4 select-none", THEME.Background.Base)} align="start">
                    {loading && <LoadingIcon />}
                    
                    {error && (
                        <div className={cn("text-xs p-2 text-center max-w-xs", THEME.Text.RedText)}>
                            {error}
                        </div>
                    )}
                    
                    {!loading && !error && (
                        <div className="flex flex-col sm:flex-row gap-6 justify-center">
                        
                            {/* Left side container */}
                            <div className="flex flex-col gap-3 w-44 sm:w-48">
                                <div className="flex items-center justify-between px-1">
                                    <button 
                                        className={cn(THEME.ButtonOutLine)} 
                                        onClick={() => { setLeftYear(leftYear - 1); setRightYear(rightYear - 1); }}
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                    </button>
                                    <span className="text-sm font-medium">{leftYear}</span>
                                    <span className="w-6"></span>
                                </div>
                                <div className="grid grid-cols-1 gap-1.5 max-h-80 overflow-y-auto pr-1">
                                    {MONTHS.map((month, idx) => {
                                        const inRange = isInRange(idx, leftYear);
                                        const monthData = getMonthData(month, leftYear);

                                        return (
                                            <button
                                                key={month}
                                                onClick={() => handleMonthClick(idx, leftYear)}
                                                onMouseEnter={() => range.from && !range.to && setHoveredMonth(new Date(leftYear, idx, 1))}
                                                className={cn(
                                                    THEME.ButtonOutLine,
                                                    inRange ? cn(THEME.Background.Highlighted200,"text-primary-content border-transparent hover:bg-primary/30") : ""
                                                )}
                                            >
                                                <span className="font-semibold text-sm leading-tight">{month}</span>
                                                {monthData ? (
                                                    <div className="text-[10px] opacity-80 mt-0.5 fallback-text leading-none">
                                                        {formatQuantity(monthData.Quantity)} @ {monthData.Price.toFixed(2)}
                                                    </div>
                                                ) : (
                                                    <div className="text-[10px] opacity-0 mt-0.5 leading-none">-</div>
                                                )}
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>
                            
                            {/* Right side container */}
                            <div className="flex flex-col gap-3 w-44 sm:w-48">
                                <div className="flex items-center justify-between px-1">
                                    <span className="w-6"></span>
                                    <span className="text-sm font-semibold">{rightYear}</span>
                                    <button 
                                        className={THEME.ButtonOutLine}
                                        onClick={() => { setLeftYear(leftYear + 1); setRightYear(rightYear + 1); }}
                                    >
                                        <ChevronRight className="h-4 w-4" />
                                    </button>
                                </div>
                                <div className="grid grid-cols-1 gap-1.5 max-h-80 overflow-y-auto pr-1">
                                    {MONTHS.map((month, idx) => {
                                        const inRange = isInRange(idx, rightYear);
                                        const monthData = getMonthData(month, rightYear);

                                        return(
                                            <button
                                                key={month}
                                                onClick={() => handleMonthClick(idx, rightYear)}
                                                onMouseEnter={() => range.from && !range.to && setHoveredMonth(new Date(rightYear, idx, 1))}
                                                className={cn(
                                                    THEME.ButtonOutLine,
                                                    inRange ? cn(THEME.Background.Highlighted200,"text-primary-content border-transparent hover:bg-primary/30") : ""
                                                )}
                                            >
                                                <span className="font-semibold text-sm leading-tight">{month}</span>
                                                {monthData ? (
                                                    <div className="text-[10px] opacity-80 mt-0.5 fallback-text leading-none">
                                                        {formatQuantity(monthData.Quantity)} @ {monthData.Price.toFixed(2)}
                                                    </div>
                                                ) : (
                                                    <div className="text-[10px] opacity-0 mt-0.5 leading-none">-</div>
                                                )}
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>
                        </div>
                    )}
                </PopoverContent>
            </Popover>
        </div>
    )
}