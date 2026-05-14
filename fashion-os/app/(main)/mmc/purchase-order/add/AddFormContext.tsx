'use client';

import MessageBox from '@/_components/generic/MessageBox';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

type ErrorConfig = { subject: string; message: string; action?: () => void; } | null;
type FormOptions = {
    suppliers?: { value: string; label: string }[];
    currencies?: { value: string; label: string }[];
}

// The Next.js API route this form POSTs to — it forwards the request to Django
export const ADD_API_URL = `/api/mmc/purchase-order/add`;

const AddFormContext = createContext<{
    setFormData: (key: string, data: any) => void;
    getCombinedData: () => any;
    registerValidator: (key: string, fn: () => boolean) => void;
    validateAll: () => boolean;
    initialData: any;
    setLoading: (key: string, isLoading: boolean) => void;
    isAnyLoading: boolean;
    setError: (config: ErrorConfig) => void;
    error: ErrorConfig;
    options: FormOptions;
} | null>(null);

export const AddFormProvider = ({ children }: { children: React.ReactNode }) => {

    // ── SHARED STORAGE ────────────────────────────────────────────────────────
    // useRef stores data without triggering re-renders — child forms write here on every keystroke
    const formsData = useRef<Record<string, any>>({});
    const setFormData = useCallback((key: string, data: any) => { formsData.current[key] = data; }, []);
    // Always reads the latest ref value — gives a full snapshot of all child forms at save time
    const getCombinedData = () => formsData.current;

    // ── VALIDATION REGISTRY ───────────────────────────────────────────────────
    const validators = useRef<Record<string, () => boolean>>({});
    const registerValidator = useCallback((key: string, fn: () => boolean) => { validators.current[key] = fn; }, []);
    // Runs every registered validator — returns false if any fail, so all errors show at once
    const validateAll = () => Object.values(validators.current).map(fn => fn()).every(v => v === true);

    // Set to {} immediately (not null) — child forms see this on mount and initialize to blank defaults
    const [initialData] = useState<any>({});

    // ── LOADING & ERROR STATE ─────────────────────────────────────────────────
    const [loadingMap, setLoadingMap] = useState<Record<string, boolean>>({});
    const setLoading = useCallback((key: string, isLoading: boolean) => {
        setLoadingMap(prev => prev[key] === isLoading ? prev : { ...prev, [key]: isLoading });
    }, []);
    const isAnyLoading = Object.values(loadingMap).some(s => s === true);

    const [error, setErrorState] = useState<ErrorConfig>(null);
    const setError = useCallback((config: ErrorConfig) => setErrorState(config), []);

    // ── OPTIONS (dropdown data) ───────────────────────────────────────────────
    const [options, setOptions] = useState<FormOptions>({});

    // Fetch supplier and currency lists in parallel on mount — populates the dropdown options
    useEffect(() => {
        const fetchOptions = async () => {
            setLoading('options', true);
            try {
                const [suppliersRes, currenciesRes] = await Promise.all([
                    fetch('/api/options/suppliers'),
                    fetch('/api/options/currencies'),
                ]);
                const suppliers = await suppliersRes.json().catch(() => []);
                const currencies = await currenciesRes.json().catch(() => []);
                setOptions({ suppliers, currencies });
            } finally {
                setLoading('options', false);
            }
        };
        fetchOptions();
    }, [setLoading]);

    const contextValue = useMemo(() => ({
        setFormData, getCombinedData, registerValidator, validateAll,
        initialData, setLoading, isAnyLoading, setError, error, options,
    }), [initialData, isAnyLoading, error, options, setLoading, setError]);

    return (
        <AddFormContext.Provider value={contextValue}>
            {children}
            {error && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <MessageBox
                        subject={error.subject}
                        message={error.message}
                        confirmText="Close"
                        onConfirm={() => { if (error.action) error.action(); setError(null); }}
                    />
                </div>
            )}
        </AddFormContext.Provider>
    );
};

export const useFormRegistry = () => {
    const context = useContext(AddFormContext);
    if (!context) throw new Error('useFormRegistry must be used within AddFormProvider');
    return context;
};
