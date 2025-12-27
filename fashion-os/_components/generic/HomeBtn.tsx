'use client'

import { Home } from 'lucide-react';
import { Button } from '../ui/button';
import { useRouter } from "next/navigation";
import { useShortcuts } from '../shortcuts/ShortcutContext';
import { useEffect, useTransition } from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';

const HomeButton = () => {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const { registerAction } = useShortcuts();
  
  const handleClick = () => {
    startTransition(() => {
      router.push('/');
    });
  }

  useEffect(() => {
    registerAction("h", handleClick);

    return () => registerAction("h", () => {});
  }, [registerAction, router]);

  return (
    <TooltipProvider>
      <Tooltip delayDuration={300}>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="cursor-pointer text-white hover:bg-gray-800 dark:text-gray-200"
            onClick={handleClick}
            disabled={isPending}
            aria-label="Go to Home"
          >
            <Home
              className={`w-5 h-5`}
            />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Home (ctrl/cmd + h)</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
    
  )
}

export default HomeButton