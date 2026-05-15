'use client'

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import LiquidEther from "./LiquidEther";

export default function BackgroundController() {
    const { resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const [isHighPerformance, setIsHighPerformance] = useState(false);

    useEffect(() => {
        setMounted(true);

        const checkPerformance = () => {
            try {
                const canvas = document.createElement('canvas');

                const gl = canvas.getContext('webgl2', { 
                    failIfMajorPerformanceCaveat: true 
                });

                if (!gl) {
                    console.warn("WebGL2 not supported or performance is too low.");
                    return false;
                }

                if (navigator.hardwareConcurrency && navigator.hardwareConcurrency < 8) {
                    return false;
                }

                return true;
            } catch (e) {
                return false;
            }
        }

        setIsHighPerformance(checkPerformance());
    }, []);

    if (!mounted) return null;

    if (!isHighPerformance) {
        return (
            <div className={`fixed inset-0 -z-10 ${resolvedTheme === 'dark' ? 'bg-neutral-950' : 'bg-neutral-50'}`} />
        );
    }

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