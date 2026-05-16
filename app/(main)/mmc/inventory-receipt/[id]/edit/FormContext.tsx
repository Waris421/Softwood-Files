'use client';

import MessageBox from '@/_components/generic/MessageBox';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { convertAPIDataToFormData } from './APIConversion';

type ErrorConfig = {
    subject: string;
    message: string;
    action?: () => void;
} | null;

type FormOptions = {}

const FormContext = createContext<{
    setFormData: (key: string, data: any) => void;
    getCombinedData: () => any;
    setFormMetaData: (key: string, data: any) => void;
    getCombinedMetaData: (key: string) => any;
    registerValidator: (key: string, fn: () => boolean) => void;
    validateAll: () => boolean;
    setLoading: (key: string, isLoading: boolean) => void;
    isAnyLoading: boolean;
    setError: (config: ErrorConfig) => void;
    error: ErrorConfig;
    options: FormOptions;
    id: number;

    isDirty: boolean;
    markAsClean: () => void;

    registerCustomAction: (key: string, fn: (...args: any[]) => void) => void;
    customAction: (key: string, ...args: any[]) => void;
} | null>(null);

const ESTIMATED_FORM_LOADING_TIME = 300;

export const GET_API_URL = (id: number) => `/api/mmc/inventory-receipt/${id}/update`;
export const REDIRECT_URL = '/merchandising/work-order';

export const FormProvider = ({ children, id }: { children: React.ReactNode, id: number }) => {
    //Unsaved data flag managemnt
    const [isDirty, setIsDirty] = useState(false);
    const isInitializing = useRef(true);

    //Form data management
    const formsData = useRef<Record<string, any>>({});
    const setFormData = useCallback((key: string, data: any) => { 
        formsData.current[key] = data;

        if (!isInitializing.current) {
            setIsDirty(true);
        }
    }, []);
    const getCombinedData = () => formsData.current;

    //Data that don't need to be sent to backend from forms
    const formMetadata = useRef<Record<string, any>>({});
    const setFormMetaData = useCallback((key: string, data: any) => {
        formMetadata.current[key] = { ...formMetadata.current[key], ...data };
    }, []);
    const getCombinedMetaData = useCallback((key: string) => formMetadata.current[key] || {}, []);

    //Form validations
    const validators = useRef<Record<string, () => boolean>>({});
    const registerValidator = useCallback((key: string, fn: () => boolean) => {
        validators.current[key] = fn;
    }, []);
    const validateAll = () => {
        const results = Object.values(validators.current).map(fn => fn());
        return results.every(isValid => isValid === true);
    }

    //Loading state management
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

    //Get all the options for all the forms in one place
    const [options, setOptions] = useState<FormOptions>({});
    
    //Load the data+static options from backend
    useEffect(() => {
        const fetchOptions = async() => {
            setLoading('globalOptions', true);
            isInitializing.current = true;
            try {
                if (!id) {
                    throw new Error('No Receipt Number provided');
                }
                const response = await fetch(GET_API_URL(id));
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(`${errorData.details.message}`);
                }

                const data = await response.json();
                
                //setOptions(prev => ({ ...prev, currencies: data.currencies }));
                
                const convertedData = convertAPIDataToFormData(data.FormData);

                formsData.current = convertedData;

                //Wait 0.3s for the data to load before tracking unsaved data
                setTimeout(() => {
                    isInitializing.current = false;
                    setIsDirty(false);
                }, ESTIMATED_FORM_LOADING_TIME);
            } catch (err) {
                setError({
                    subject: "Fetch Error",
                    message: `Failed to load form options. ${err}`,
                    action: () => window.location.reload(),
                });
            } finally {
                setLoading('globalOptions', false);
            }
        }

        fetchOptions();
    }, [setLoading, setError]);
    
    //Custom actions
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

    //Warn user if they close the page while there is unsaved data
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (isDirty) {
                e.preventDefault();

                return (e.returnValue = '');
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [isDirty]);

    //Call this function to tell browser they can reload the page without warning
    const markAsClean = useCallback(() => setIsDirty(false), []);

    const contextValue = useMemo(() => ({
        setFormData, 
        getCombinedData,
        setFormMetaData,
        getCombinedMetaData,
        registerValidator, 
        validateAll,
        setLoading, 
        isAnyLoading,
        setError, 
        error,
        options,
        id,

        isDirty,
        markAsClean,

        registerCustomAction,
        customAction,
    }), [isAnyLoading, error, options, id, setLoading, setError, isDirty, markAsClean]);

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