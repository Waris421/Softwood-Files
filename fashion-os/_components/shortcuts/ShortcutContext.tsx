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
            const target = event.target as HTMLElement;
            const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;

            const key = event.key.toLowerCase();
            const isMod = event.ctrlKey || event.metaKey;

            //Actions that don't need to be suppressed
            const isAllowedAction = ['z', 'x', 'c', 'v', 'l', 'r', 'a'].includes(key);

            if (isMod && actionsRef.current[key]) {
                if (isInput) return;

                actionsRef.current[key]();
                return ;
            }

            if (!isAllowedAction && isMod&& !isInput) {
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