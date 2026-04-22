'use client'

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import LiquidEther from "./LiquidEther";

export default function BackgroundController() {
    const { resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const [webglSupported, setWebglSupported] = useState(false);

    useEffect(() => {
        setMounted(true);

        try {
            const canvas = document.createElement('canvas');
            const gl = canvas.getContext('webgl2');

            if (gl) {
                setWebglSupported(true);
            } else {
                console.warn("WebGL not supported on this device/browser.");
                setWebglSupported(false);
            }
        } catch (e) {
            setWebglSupported(false);
        }
    }, []);

    if (!mounted) return null;

    if (!webglSupported) {
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