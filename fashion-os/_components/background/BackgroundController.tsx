'use client'

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import LiquidEther from "./LiquidEther";

export default function BackgroundController() {
    const { resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return (
        <>
            {resolvedTheme === 'dark' ? (
                <LiquidEther
                    isViscous={true}
                />
            ): (
                <LiquidEther/>
            )}
        </>
    )
}