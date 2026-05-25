import { useEffect, useRef, useState } from "react"
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover"
import { Button } from "../ui/button"
import { cn } from "../generic/utils"
import { THEME } from "../constants/ui"
import { Clock, X } from "lucide-react"
import { ScrollArea } from "../ui/scroll-area"

interface TimePickerProps {
    value: string | undefined // Format: "HH:mm"
    onChange?: (time: string) => void
    placeholder?: string
    required?: boolean
    inputName: string
    interval?: number
    startingHour?: number
}

export default function TimePicker({
    value,
    onChange,
    placeholder = "Pick a time",
    required = false,
    inputName,
    interval=5,
    startingHour=9
}: TimePickerProps) {
    const [isOpen, setIsOpen] = useState(false);

    const selectedHourRef = useRef<HTMLButtonElement>(null);
    const selectedMinuteRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        if (isOpen) {
            const timer = setTimeout(() => {
                selectedHourRef.current?.scrollIntoView({ block: 'center', behavior: 'smooth' });
                selectedMinuteRef.current?.scrollIntoView({ block: 'center', behavior: 'smooth' });
            }, 1);

            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    //Generate arrays for hours and minutes
    const hours = Array.from({ length: 24 }, (_, i) => {
            const hour = (i + startingHour) % 24;
            return hour.toString().padStart(2, "0");
        }).filter((hour) => {
            if (interval > 60) {
                const hourInterval = interval / 60;
                return parseInt(hour) % hourInterval === 0;
            }
            return true;
        });
    
    const minuteStep = interval > 60 ? 60 : interval;
    const minutes = Array.from(
            { length: Math.ceil(60 / minuteStep) }, 
            (_, i) => (i * minuteStep).toString().padStart(2, "0")
        ).filter(m => parseInt(m) < 60);

    const startingHourStr = startingHour.toString().padStart(2, "0");
    const [selectedHour, selectedMinute] = value?.includes(':') ? value.split(':') : [undefined, undefined];

    const hourToScrollTo = selectedHour || startingHourStr;
    const minuteToScrollTo = selectedMinute || "00";

    const handleClear = (e: React.MouseEvent) => {
        e.stopPropagation();
        onChange?.("");
    }

    const handleTimeSelect = (type: 'hour' | 'minute', val: string) => {
        const newHour = type === 'hour' ? val : (selectedHour || "00");
        const newMinute = type === 'minute' ? val : (selectedMinute || "00");

        const fullTime = `${newHour}:${newMinute}`;

        onChange?.(fullTime);

        if (type === 'minute') {
            setIsOpen(false);
        }
    }

    return (
        <>
            <Popover open={isOpen} onOpenChange={setIsOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant={"outline"}
                        className={cn(
                            THEME.DropDown,
                            !value && "text-muted-foreground",
                        )}
                    >
                        <div className="flex items-center gap-2 overflow-hidden">
                            <Clock className="h-4 w-4 opacity-50 shrink-0" />
                            <span className="truncate">
                                {value ? value : placeholder}
                            </span>
                        </div>
                        <div className="flex items-center gap-1 cursor-pointer">
                            {value && (
                                <div
                                    role="button"
                                    onClick={handleClear}
                                    className="rounded-full p-0.5 hover:bg-muted transition-colors"
                                >
                                    <X className="h-3 w-3 opacity-70" />
                                </div>
                            )}
                        </div>
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="p-0 w-auto">
                    <div className="flex h-64 divide-x">
                        <ScrollArea className="w-20">
                            <div className="flex flex-col p-2">
                                {hours.map((hour) => (
                                    <Button
                                        key={hour}
                                        ref={hourToScrollTo === hour ? selectedHourRef : null}
                                        variant={selectedHour === hour ? "default" : "ghost"}
                                        className="sm:w-full shrink-0 aspect-square"
                                        onClick={() => handleTimeSelect('hour', hour)}
                                    >
                                        {hour}
                                    </Button>
                                ))}
                            </div>
                        </ScrollArea>
                        <ScrollArea className="w-20">
                            <div className="flex flex-col p-2">
                                {minutes.map((minute) => (
                                    <Button
                                        key={minute}
                                        ref={minuteToScrollTo === minute ? selectedMinuteRef : null}
                                        variant={selectedMinute === minute ? "default" : "ghost"}
                                        className="sm:w-full shrink-0 aspect-square"
                                        onClick={() => handleTimeSelect('minute', minute)}
                                    >
                                        {minute}
                                    </Button>
                                ))}
                            </div>
                        </ScrollArea>
                    </div>
                </PopoverContent>
            </Popover>
            <input type="hidden" name={inputName} value={value || ""} required={required} />
        </>
    )
}