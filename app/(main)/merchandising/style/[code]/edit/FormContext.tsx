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
} | null>(null);

export const GET_API_URL = (code: string) => `/api/merchandising/style/${code}/update`;

export const REDIRECT_URL = '/merchandising/style';

export const FormProvider = ({ children, code }: { children: React.ReactNode, code: string }) => {    
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

    //This is only if we need to implement reset forms functionality.
    // Don't use this to populate children at first login,as it'll result in bugs
    const [initialData, setInitialData] = useState<any>(null);

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

    //Get all the options and pre-set values for all the forms in one place
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
                    throw new Error(`${errorData.details.message}`);
                }

                const data = await response.json();
                
                setOptions(prev => ({ ...prev, routes: data.routes, units: data.units }));

                const convertedData = convertAPIDataToFormData(data.formData)

                formsData.current = convertedData;

                //setInitialData(data.formData);
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