'use client';

import { THEME } from "@/_components/constants/ui";
import LoadingIcon from "@/_components/generic/Loading";
import { cn } from "@/_components/generic/utils";
import { Button } from "@/_components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/_components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";

type Month = {
    Month: string
    Quantity: string
    Checked: boolean
}

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

export default function MonthRangePicker({ from, to, onChange }: {
    from: string | null
    to: string | null
    onChange: (from: string | null, to: string | null) => void
}) {
    const [data, setData] = useState<Month[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isOpen, setIsOpen] = useState(false);
    const [hoveredMonth, setHoveredMonth] = useState<Date | null>(null);

    const currentYear = new Date().getFullYear();
    const [leftYear, setLeftYear] = useState(currentYear - 1);
    const [rightYear, setRightYear] = useState(currentYear);
    const [range, setRange] = useState<{ from: Date | null; to: Date | null }>(() => {
        const parse = (s: string | null): Date | null => {
            if (!s) return null
            const idx = MONTHS.indexOf(s.split('-')[0])
            const year = Number(s.split('-')[1])
            if (idx === -1 || isNaN(year)) return null
            return new Date(year, idx, 1)
        }
        return { from: parse(from), to: parse(to) }
    })

    useEffect(() => {
        const fetchMonths = async () => {
            try {
                setLoading(true);

                const response = await fetch('/api/marketing/export-data/months');

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
    }, []);

    //Helper function to return a month's data if is is available.
    const getMonthData = (monthName: string, year: number) => {
        return data.find(item => item.Month === `${monthName}-${year}`)
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
            
            const fromStr = format(newRange.from!, 'MMM-yyyy')
            const toStr   = format(clickedDate,   'MMM-yyyy')
            onChange(fromStr, toStr)
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
                <PopoverContent className="w-auto sm:max-w-xl p-4 select-none bg-neutral-900 text-white" align="start">
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
                                                    inRange ? "bg-primary/20 text-primary-content border-transparent hover:bg-primary/30" : ""
                                                )}
                                            >
                                                <span className="font-semibold text-sm leading-tight">{month}</span>
                                                {monthData ? (
                                                    <div className="text-[10px] opacity-80 mt-0.5 fallback-text leading-none">
                                                        {monthData.Quantity}
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
                                                    inRange ? "bg-primary/20 text-primary-content border-transparent hover:bg-primary/30" : ""
                                                )}
                                            >
                                                <span className="font-semibold text-sm leading-tight">{month}</span>
                                                {monthData ? (
                                                    <div className="text-[10px] opacity-80 mt-0.5 fallback-text leading-none">
                                                        {monthData.Quantity}
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