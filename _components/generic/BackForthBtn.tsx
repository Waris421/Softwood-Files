'use client';

import { CornerUpLeft, CornerUpRight } from 'lucide-react';
import { Button } from '../ui/button';
import { useShortcuts } from '../shortcuts/ShortcutContext';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const BackForthButton = () => {
    const [canGoBack, setCanGoBack] = useState(false);
    const { registerAction } = useShortcuts();
    const router = useRouter();

    const handleBackClick = () => {
        router.back();
    }

    const handleForwardClick = () => {
        router.forward();
    }

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setCanGoBack(window.history.length > 1);
        }

        registerAction('arrowleft', handleBackClick);
        registerAction('arrowright', handleForwardClick);
        
    }, [registerAction]);
    
    return (
        <div>
            <TooltipProvider>
                <Tooltip delayDuration={300}>
                    <TooltipTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="cursor-pointer text-gray-800 hover:bg-gray-800 dark:text-gray-200"
                            aria-label="Go Back"
                            disabled={!canGoBack}
                            onClick={handleBackClick}
                        >
                            <CornerUpLeft 
                                className={`w-5 h-5`}
                            />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Go Back (ctrl/cmd + Left Arrow)</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
                <Tooltip delayDuration={300}>
                    <TooltipTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="cursor-pointer text-gray-800 hover:bg-gray-800 dark:text-gray-200"
                            aria-label="Go Forward"
                            onClick={handleForwardClick}
                        >
                            <CornerUpRight
                                className={`w-5 h-5`}
                            />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Go Forward (ctrl/cmd + Right Arrow)</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        </div>
    )
}

export default BackForthButton;