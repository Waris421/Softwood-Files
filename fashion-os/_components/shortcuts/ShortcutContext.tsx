'use client';

import { createContext, useContext, useEffect, useRef } from "react";

type ShortcutContextType = {
  registerAction: (key: string, fn: () => void) => void;
};

const ShortcutContext = createContext<ShortcutContextType | null>(null);

export const ShortcutProvider = ({children} : { children: React.ReactNode }) => {
    const actionsRef = useRef<Record<string, () => void>>({});

    const registerAction = (key: string, fn: () => void) => {
        actionsRef.current[key.toLowerCase()] = fn;
    };

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            const key = event.key.toLowerCase();
            const isMod = event.ctrlKey || event.metaKey;

            //Actions that don't need to be suppressed
            const isAllowedAction = ['z', 'x', 'c', 'v', 'l'].includes(key);

            if (isMod && actionsRef.current[key]) {
                actionsRef.current[key]();
            }

            if (!isAllowedAction && isMod) {
                event.preventDefault();
            }
        }
        window.addEventListener("keydown", handleKeyDown);

        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    return (
        <ShortcutContext.Provider value={{ registerAction }}>
            {children}
        </ShortcutContext.Provider>
    );
};

export const useShortcuts = () => {
    const ctx = useContext(ShortcutContext);

    if (!ctx) throw new Error("useShortcuts must be used within ShortcutProvider");

    return ctx;
};