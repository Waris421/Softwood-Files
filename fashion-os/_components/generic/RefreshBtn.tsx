'use client'

import { RefreshCw } from 'lucide-react';
import { Button } from '../ui/button';
import { useTransition } from 'react';
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useShortcuts } from '../shortcuts/ShortcutContext';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';

const RefreshBtn = () => {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const { registerAction } = useShortcuts();

  const handleRefresh = () => {
    startTransition(() => {
      router.refresh();
    });
  }

  useEffect(() => {
    registerAction("r", handleRefresh);

    return () => registerAction("r", () => {});
  }, [registerAction, router]);
  
  return (
    <TooltipProvider>
      <Tooltip delayDuration={300}>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            disabled={isPending}
            className="cursor-pointer text-white hover:bg-gray-800 dark:text-gray-200"
            onClick={handleRefresh}
            aria-label="Refresh page"
          >
            <RefreshCw
              className={`w-5 h-5 ${isPending ? 'animate-spin' : ''}`}
            />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Refresh (ctrl/cmd + r)</p>
        </TooltipContent>
      </Tooltip>      
    </TooltipProvider>
  )
}

export default RefreshBtn