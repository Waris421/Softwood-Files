'use client';

import MessageBox from '@/_components/generic/MessageBox';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { convertAPIDataToFormData } from './ApiConversion';

type ErrorConfig = {
    subject: string;
    message: string;
    action?: () => void;
} | null;

type FormOptions = {
    suppliers?: { value: string; label: string }[];
    currencies?: { value: string; label: string }[];
    workorders?: { value: number; label: string }[];
}

const FormContext = createContext<{
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
    id: string;
} | null>(null);

export const GET_API_URL = (id: string) => `/api/mmc/purchase-order/${id}/edit`;
export const POST_API_URL = (id: string) => `/api/mmc/purchase-order/${id}/edit`;
export const ADD_API_URL = `/api/mmc/purchase-order/add`;

export const FormProvider = ({ children, id }: { children: React.ReactNode; id: string }) => {

    // ── STEP 1: SHARED STORAGE ────────────────────────────────────────────────
    // useRef stores data without triggering re-renders — child forms write here on every keystroke
    const formsData = useRef<Record<string, any>>({});
    const setFormData = useCallback((key: string, data: any) => {
        formsData.current[key] = data;
    }, []);
    const getCombinedData = () => formsData.current;

    // ── STEP 2: VALIDATION REGISTRY ───────────────────────────────────────────
    // Child forms register validators here; Save button calls validateAll()
    const validators = useRef<Record<string, () => boolean>>({});
    const registerValidator = useCallback((key: string, fn: () => boolean) => {
        validators.current[key] = fn;
    }, []);
    // Runs every registered validator — returns false if any fail, so all errors show at once
    const validateAll = () => {
        const results = Object.values(validators.current).map(fn => fn());
        return results.every(isValid => isValid === true);
    };

    // ── STEP 3: INITIAL DATA SIGNAL ───────────────────────────────────────────
    // Set after the fetch completes; child form useEffects watch this to know when to populate
    const [initialData, setInitialData] = useState<any>(null);

    // ── STEP 4: LOADING & ERROR STATE ─────────────────────────────────────────
    const [loadingMap, setLoadingMap] = useState<Record<string, boolean>>({});
    const setLoading = useCallback((key: string, isLoading: boolean) => {
        setLoadingMap(prev => {
            if (prev[key] === isLoading) return prev;
            return { ...prev, [key]: isLoading };
        });
    }, []);
    const isAnyLoading = Object.values(loadingMap).some(status => status === true);

    const [error, setErrorState] = useState<ErrorConfig>(null);
    const setError = useCallback((config: ErrorConfig) => setErrorState(config), []);

    // ── STEP 5: OPTIONS (dropdown data) ───────────────────────────────────────
    const [options, setOptions] = useState<FormOptions>({});

    // ── STEP 6: DATA FETCH ON MOUNT ───────────────────────────────────────────
    // Fetches existing PO data → converts it → loads into storage → signals child forms
    useEffect(() => {
        const fetchData = async () => {
            setLoading('global', true);
            try {
                // All three fetches run at the same time — faster than waiting for each one to finish
                const [poRes, suppliersRes, currenciesRes] = await Promise.all([
                    fetch(GET_API_URL(id)),
                    fetch('/api/options/suppliers'),
                    fetch('/api/options/currencies'),
                ]);

                if (!poRes.ok) {
                    const err = await poRes.json();
                    throw new Error(err?.error || 'Failed to load PO');
                }

                const poData = await poRes.json();
                const suppliers = await suppliersRes.json().catch(() => []);
                const currencies = await currenciesRes.json().catch(() => []);

                const workorders = (poData.workorders || []).map((w: any) => ({ value: w.value, label: w.text }));
                setOptions({ suppliers, currencies, workorders });

                const convertedData = convertAPIDataToFormData(poData);
                formsData.current = convertedData;
                // This is the signal — child forms watch initialData and populate themselves when it changes
                setInitialData(convertedData);
            } catch (err: any) {
                setError({
                    subject: 'Fetch Error',
                    message: `${err}`,
                    action: () => window.location.reload(),
                });
            } finally {
                setLoading('global', false);
            }
        };

        fetchData();
    }, [id, setLoading, setError]);

    // ── STEP 7: EXPOSE TO CHILDREN ────────────────────────────────────────────
    const contextValue = useMemo(() => ({
        setFormData,
        getCombinedData,
        registerValidator,
        validateAll,
        initialData,
        id,
        setLoading,
        isAnyLoading,
        setError,
        error,
        options,
    }), [initialData, isAnyLoading, error, options, id, setLoading, setError]);

    return (
        <FormContext.Provider value={contextValue}>
            {children}
            {error && (
                <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <MessageBox
                        subject={error.subject}
                        message={error.message}
                        confirmText="Close"
                        onConfirm={() => {
                            if (error.action) error.action();
                            setError(null);
                        }}
                    />
                </div>
            )}
        </FormContext.Provider>
    );
};

export const useFormRegistry = () => {
    const context = useContext(FormContext);
    if (!context) throw new Error('useFormRegistry must be used within a FormProvider');
    return context;
};
