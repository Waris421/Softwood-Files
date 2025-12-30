'use client'

import { useTheme } from "next-themes";
import React from "react";
import { Button } from "../ui/button";
import { Moon, Sun } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';

export function ThemeToggle() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) return <div className="w-9 h-9" />

    return (
        <TooltipProvider>
            <Tooltip delayDuration={300}>
                <TooltipTrigger asChild>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setTheme(theme === "light" ? "dark" : "light")}
                        className="cursor-pointer text-gray-800 hover:bg-gray-800 dark:text-gray-200"
                    >
                        {theme != 'light' ? (
                            <Sun className="h-[1.2rem] w-[1.2rem] transition-all" />
                        ): (
                            <Moon className="h-[1.2rem] w-[1.2rem] transition-all" />
                        )}
                    </Button>
                </TooltipTrigger>
                <TooltipContent>
                    <p>Toggle Theme</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
        
    );
}