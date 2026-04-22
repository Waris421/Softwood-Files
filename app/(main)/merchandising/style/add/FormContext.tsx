'use client';

import MessageBox from '@/_components/generic/MessageBox';
import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';

type ErrorConfig = {
    subject: string;
    message: string;
    action?: () => void;
} | null;

const FormContext = createContext<{
  setFormData: (key: string, data: any) => void;
  getCombinedData: () => any;
  registerValidator: (key: string, fn: () => boolean) => void;
  validateAll: () => boolean;
  setLoading: (key: string, isLoading: boolean) => void;
  isAnyLoading: boolean;
  setError: (config: ErrorConfig) => void;
  error: ErrorConfig;
} | null>(null);

export const FormProvider = ({ children }: { children: React.ReactNode }) => {    
    //Form data management
    const formsData = useRef<Record<string, any>>({});
    const setFormData = useCallback((key: string, data: any) => { 
        formsData.current[key] = data; 
    }, []);
    const getCombinedData = () => formsData.current;

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

    const contextValue = useMemo(() => ({
        setFormData, 
        getCombinedData,
        registerValidator, 
        validateAll,
        setLoading, 
        isAnyLoading,
        setError, 
        error
    }), [isAnyLoading, error, setLoading, setError]);

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