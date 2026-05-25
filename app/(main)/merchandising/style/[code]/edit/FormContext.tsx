'use client';

import MessageBox from '@/_components/generic/MessageBox';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { DropdownOption } from 'react-day-picker';
import { convertAPIDataToFormData } from './ApiConversion';

type ErrorConfig = {
    subject: string;
    message: string;
    action?: () => void;
} | null;

type FormOptions = {
    routes?: DropdownOption[];
    units?: {
        value: string,
        label: string,
        Group: string,
    }[];
}

const FormContext = createContext<{
  setFormData: (key: string, data: any) => void;
  getCombinedData: () => any;
  setFormMetaData: (key: string, data: any) => void;
  getCombinedMetaData: (key: string) => any;
  registerValidator: (key: string, fn: () => boolean) => void;
  validateAll: () => boolean;
  initialData: any;
  setLoading: (key: string, isLoading: boolean) => void;
  isAnyLoading: boolean;
  setError: (config: ErrorConfig) => void;
  error: ErrorConfig;
  options: FormOptions;
  code: string;

  registerCustomAction: (key: string, fn: (...args: any[]) => void) => void;
  customAction: (key: string, ...args: any[]) => void;
} | null>(null);

export const GET_API_URL = (code: string) => `/api/merchandising/style/${code}/update`;

export const REDIRECT_URL = '/merchandising/style';

export const FormProvider = ({ children, code }: { children: React.ReactNode, code: string }) => {    
    // ── STEP 1: SHARED STORAGE ────────────────────────────────────────────────
    // Stores each child form's current data by key (e.g. "style", "variant")
    const formsData = useRef<Record<string, any>>({});
    const setFormData = useCallback((key: string, data: any) => { 
        formsData.current[key] = data; 
    }, []);
    const getCombinedData = () => formsData.current;

    // Stores UI-only state (errors, display data) that doesn't get sent to backend
    const formMetadata = useRef<Record<string, any>>({});
    const setFormMetaData = useCallback((key: string, data: any) => {
        formMetadata.current[key] = { ...formMetadata.current[key], ...data };
    }, []);
    const getCombinedMetaData = useCallback((key: string) => formMetadata.current[key] || {}, []);


    // ── STEP 2: VALIDATION REGISTRY ───────────────────────────────────────────
    // Each child form registers its own validator here; Save button calls all of them
    const validators = useRef<Record<string, () => boolean>>({});
    const registerValidator = useCallback((key: string, fn: () => boolean) => {
        validators.current[key] = fn;
    }, []);
    const validateAll = () => {
        const results = Object.values(validators.current).map(fn => fn());
        return results.every(isValid => isValid === true);
    }

    // ── STEP 3: INITIAL DATA SIGNAL ───────────────────────────────────────────
    // Triggers child forms to re-populate; set after async data loads so useEffects re-run
    // Don't use this to populate children at first login, as it'll result in bugs
    const [initialData, setInitialData] = useState<any>(null);

    // Tracks loading state per key so the spinner shows while any fetch is in progress
    const [loadingMap, setLoadingMap] = useState<Record<string, boolean>>({})
    const setLoading = useCallback((key: string, isLoading: boolean) => {
        setLoadingMap(prev => {
            if (prev[key] === isLoading) return prev; // Prevent unnecessary state updates
            return { ...prev, [key]: isLoading };
        });
    }, []);
    const isAnyLoading = Object.values(loadingMap).some(status => status === true);

    const [error, setErrorState] = useState<ErrorConfig>(null);
    const setError = useCallback((config: ErrorConfig) => {
        setErrorState(config);
    }, []);

    // ── STEP 4: DATA FETCH ON MOUNT ───────────────────────────────────────────
    // Fetches existing style data → converts it → loads into storage → signals child forms
    const [options, setOptions] = useState<FormOptions>({});
    useEffect(() => {
        const fetchOptions = async() => {
            setLoading('globalOptions', true);

            try {
                if (!code) {
                    throw new Error('No style code provided');
                }

                const response = await fetch(GET_API_URL(code));
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData?.details?.message || errorData?.error || 'Request failed');
                }

                const data = await response.json();
                
                setOptions(prev => ({ ...prev, routes: data.routes, units: data.units }));

                const convertedData = convertAPIDataToFormData(data.formData)

                formsData.current = convertedData;

                setInitialData(convertedData);
            } catch (err: any) {
                setError({
                    subject: "Fetch Error",
                    message: `${err}` ,
                    action: () => window.location.reload(),
                });
            } finally {
                setLoading('globalOptions', false);
            }
        }

        fetchOptions();
    }, [code, setLoading, setError]);

    // ── STEP 5: CUSTOM ACTIONS ────────────────────────────────────────────────
    // Optional: child forms can register functions the parent can call (e.g. trigger a reset)
    const actions = useRef<Record<string, (...args: any[]) => void>>({});

    const registerCustomAction = useCallback((key: string, fn: (...args: any[]) => void) => {
        actions.current[key] = fn;
    }, []);

    const customAction = useCallback((key: string, ...args: any[]) => {
        const action = actions.current[key];
        if (action) {
            action(...args); // Pass the parameters here
        } else {
            console.warn(`Action "${key}" not found.`);
        }
    }, []);

    // ── STEP 6: EXPOSE TO CHILDREN ────────────────────────────────────────────
    // Everything above gets bundled and passed down to every child form via useFormRegistry()
    const contextValue = useMemo(() => ({
        setFormData, 
        getCombinedData,
        setFormMetaData,
        getCombinedMetaData,
        registerValidator, 
        validateAll,
        initialData,
        code,
        setLoading, 
        isAnyLoading,
        setError, 
        error,
        options,

        registerCustomAction,
        customAction,
    }), [initialData, isAnyLoading, error, options, code, setLoading, setError]);

    return (
        <FormContext.Provider
            value={contextValue}
        >
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
}

export const useFormRegistry = () => {
    const context = useContext(FormContext);

    if (!context) {
        throw new Error("useFormRegistry must be used within a FormProvider");
    }

    return context;
};