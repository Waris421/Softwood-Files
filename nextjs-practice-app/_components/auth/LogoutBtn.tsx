'use client';

import { useState } from "react";
import { useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';

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
    <button 
        className="btn btn-ghost"
        disabled={isLoggingOut}
        onClick={handleLogout}
    >
        <Image
            src="/Logout.svg"
            alt="Logout"
            width={20}
            height={20}
            style={{ filter: isLoggingOut ? 'grayscale(100%)' : '' }}
        />
    </button>
  )
}

export default LogoutButton