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

    registerCustomAction: (key: string, fn: (...args: any[]) => void) => void;
    customAction: (key: string, ...args: any[]) => void;

    selectedPO: number | null;
    setSelectedPO: (id: number | null) => void;
} | null>(null);

export const API_URL = '/api/mmc/inventory-receipt/add';
const REDIRECT_URL = '/mmc/inventory-receipt';

export const GET_PO_DETAILS_URL = (id: number) => `${API_URL}?po=${id}`;
export const GET_REDIRECT_URL = (id: number) => `${REDIRECT_URL}/${id}/edit`;

export const FormProvider = ({ children }: { children: React.ReactNode }) => {    
    //Form data management
    const formsData = useRef<Record<string, any>>({});
    const setFormData = useCallback((key: string, data: any) => { 
        formsData.current[key] = data;
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
    /* useEffect(() => {
        const fetchOptions = async() => {
            setLoading('globalOptions', true);
            try {
                const response = await fetch(API_URL);
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(`${errorData.details.message}`);
                }

                const data = await response.json();
                
                const currencyOptions = data.currencies;
                setOptions(prev => ({
                    ...prev,
                    currencies: currencyOptions
                }));
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
    }, [setLoading, setError]); */

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

    const [selectedPO, setSelectedPO] = useState<number | null>(null);

    //Fetch the details of the PO when it changes
    const fetchPODetails = useCallback(async (poId: number) => {
        setLoading('inventoryFetch', true);

        try {
            const response = await fetch(GET_PO_DETAILS_URL(poId));

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`${errorData.details.message}`);
            }

            const rawData = await response.json();

            const formattedData = convertAPIDataToFormData(rawData);

            const inventoryData = formattedData.Inventory?.items || [];

            customAction('REFRESH_INVENTORY_TABLE', inventoryData);
        } catch (err: any) {
            setError({ subject: "Fetch Error", message: err.message });
        } finally {
            setLoading('inventoryFetch', false);
        }
    }, [customAction, setLoading, setError]);

    //Fire up the fetchPODetails function when the po number changes
    useEffect(() => {
        if (selectedPO) {
            fetchPODetails(selectedPO);
        }
    }, [selectedPO, fetchPODetails])

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

        registerCustomAction,
        customAction,

        selectedPO,
        setSelectedPO,
    }), [isAnyLoading, error, options, setLoading, setError, selectedPO]);

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