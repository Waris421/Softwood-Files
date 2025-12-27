'use client';

import { useState } from "react";
import { useRouter, usePathname } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { Button } from "../ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';

const LogoutButton = () => {
    const router = useRouter();
    const pathName = usePathname();
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const handleLogout = async () => {
        setIsLoggingOut(true);

        try {
            const response = await fetch('/api/logout', {
                method: 'POST',
            });
            if (!response.ok) {
                console.error('Logout failed on the server.');
            }

            const nextParam = encodeURIComponent(pathName);
            router.push(`/login?next=${nextParam}`);
        } catch (error) {
            console.error('An error occurred during logout:', error);
        } finally {
            setIsLoggingOut(false);
        }
    }

  return (
    <TooltipProvider>
        <Tooltip delayDuration={300}>
            <TooltipTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="cursor-pointer text-white hover:bg-gray-800 dark:text-gray-200"
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                >
                    <LogOut
                        width={20}
                    height={20}
                    />
                </Button>
            </TooltipTrigger>
            <TooltipContent>
                <p>Logout</p>
            </TooltipContent>
        </Tooltip>
    </TooltipProvider>
    
  )
}

export default LogoutButton