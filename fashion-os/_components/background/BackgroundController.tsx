'use client'

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import Aurora from "../Aurora/Aurora";
import MetaBalls from "../MetalBalls/MetaBalls";

export default function BackgroundController() {
    const { resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return (
        <>
            {resolvedTheme === 'dark' ? (<Aurora/>): (<MetaBalls/>)}
        </>
    )
}