'use client';

import { useCallback, useEffect, useState } from "react";
import { useFormRegistry } from "./FormContext";
import { FormField } from "@/_components/generic/FormItems";
import { THEME } from "@/_components/constants/ui";
import { SingleDropdown, SingleDropdownAsync } from "@/_components/Dropdown/Dropdown";
import { DatePicker } from "@/_components/Datepicker/Datepicker";
import { Info, RefreshCw } from "lucide-react";
import { DropdownOption } from "@/_components/Dropdown/types";

//Schema of the form
type FormSchema = {
    OrderNumber: number;
    Style: string;
    Customer: string;
    DeliveryDate: string;
    Type: string;
    Currency: string;
    Price: number;
    Agency: string;
    Commission: number;
    ExcessCut: number
}

//data type of validation schema
type ValidationSchemaType = {
    [K in keyof FormSchema]?: (val: any, data: FormSchema) => string | null;
}

const VALIDATION_SCHEMA: ValidationSchemaType= {
    OrderNumber: (val) => (!val ? 'This is required' : null),
    Style: (val) => (!val.trim() ? 'This is required' : null),
    Customer: (val) => (!val.trim() ? 'This is required' : null),
    DeliveryDate: (val) => (!val.trim() ? 'This is required' : null),
    Type: (val) => (!val.trim() ? 'This is required' : null),
    Currency: (val) => (!val.trim() ? 'This is required' : null),
    Price: (val) => (!val ? 'This is required' : null),
    ExcessCut: (val) => (!val ? 'This is required' : null),
}

const CUSTOMER_OPTIONS_URL = '/api/options/customers';
const STYLE_OPTIONS_URL = '/api/options/styles';

const FORM_NAME_WITH_PARENT = 'order';

const TYPE_OPTIONS = [
    {'value': 'Export', 'label': 'Export'},
    {'value': 'CMT', 'label': 'CMT'},
    {'value': 'Local', 'label': 'Local'},
    {'value': 'SMS', 'label': 'SMS'},
]

export default function OrderForm({ children }: { children?: React.ReactNode }) {
    const { setFormData, options, registerValidator, registerCustomAction, customAction} = useFormRegistry();
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [poQuantity, setPOQuantity] = useState<number>(0);
    const [isCalculatingVariants, setIsCalculatingVariants] = useState(false);

    const [formData, setLocalFormData] = useState({
        OrderNumber: 0, Style: '', Customer: '', DeliveryDate: '', Type: '',
        Currency: '', Price: 0, Agency:'', Commission: 2, ExcessCut: 3,
    });

    const currencyOptions = options.currencies || [];

    //Sync local state to Parent Registry whenever formData changes
    useEffect(() => {
        setFormData(FORM_NAME_WITH_PARENT, formData);
    }, [formData, setFormData]);

    //Helper function that triggers when user types something
    const handleInputChange = (field: keyof FormSchema, value: any) => {
        setLocalFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    }

    //Check the form for errors. Return true if there is an error.
    const validateForm = useCallback(() => {
        const newErrors: Record<string, string> = {};

        (Object.keys(VALIDATION_SCHEMA) as (keyof FormSchema)[]).forEach((field) => {
            const errorGetter = VALIDATION_SCHEMA[field];
            if (errorGetter) {
                const errorMessage = errorGetter(formData[field], formData);
                if (errorMessage) newErrors[field] = errorMessage;
            }
        });

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [formData]);

    //Register validation function with the parent.
    useEffect(() => {
        registerValidator(FORM_NAME_WITH_PARENT, validateForm);
    }, [validateForm, registerValidator]);

    //Register any custom actions with the parent on mount
    useEffect(() => {
        registerCustomAction('updateQuantity', handleQtyChange);
    }, [registerCustomAction]);

    const handleStyleChange = async (selectedOption: DropdownOption|null) => {
        if (!selectedOption) {
            handleInputChange('Customer', '');
            handleInputChange('Style', '');
            return ;
        }

        const selectedStyle = selectedOption.value;
        handleInputChange('Style', selectedStyle);

        setIsCalculatingVariants(true);
        const url = `${STYLE_OPTIONS_URL}?search=${selectedStyle}&showCustomer=yes`;
        const response = await fetch(url);
        const data = await response.json();

        const matchedEntry = data.find((item: any) => item.value === selectedStyle);

        if (matchedEntry && matchedEntry.Customer) {
            handleInputChange('Customer', matchedEntry.Customer);
        } else {
            handleInputChange('Customer', '');
        }

        await customAction('reCalculateVariants', selectedStyle);
        setIsCalculatingVariants(false);
    }

    const handleQtyChange = (quantity: number) => {
        setPOQuantity(quantity);
    }

    const handleReCalculateVariants = async () => {
        if (!formData.Style) return;

        setIsCalculatingVariants(true);

        try {
            await customAction('reCalculateVariants', formData.Style);
        } catch (error) {
            console.error("Failed to recalculate:", error);
        } finally {
            setIsCalculatingVariants(false);
        }
    }

    const cutQuantity = Math.ceil(
        poQuantity + (poQuantity * (Number(formData.ExcessCut) / 100))
    );

    return (
        <form className="lg:col-span-2 grid grid-cols-1 md:grid-cols-6 gap-2">
            <FormField label="Order Number" error={errors.OrderNumber} required>
                <input type="number" placeholder="Order Number" className={THEME.TextInput} value={formData.OrderNumber}
                onChange={(e) => handleInputChange('OrderNumber', e.target.value)}/>
            </FormField>
            <FormField label="Style" error={errors.Style} required>
                <SingleDropdownAsync
                    inputName='Style' placeholder="Select Style" apiUrl={STYLE_OPTIONS_URL} 
                    widthClass="w-full" onSelect={handleStyleChange} 
                />
            </FormField>
            <FormField label="Customer" error={errors.Customer} required>
                <SingleDropdownAsync
                    inputName='Customer' placeholder="Select Customer" apiUrl={CUSTOMER_OPTIONS_URL} 
                    widthClass="w-full" onSelect={(val: any) => handleInputChange('Customer', val?.value)} 
                    defaultValue={formData.Customer}
                />
            </FormField>
            <FormField label="Delivery Date" error={errors.DeliveryDate} required>
                <DatePicker inputName='EndDate' value={formData.DeliveryDate} required={true}
                    placeholder="Pick a date"
                    showClear
                    onChange={(val) => handleInputChange('DeliveryDate', val)}
                />
            </FormField>
            <FormField label="Order Type" error={errors.Type} required>
                <SingleDropdown
                    inputName='Type' placeholder="Select an option" staticOptions={TYPE_OPTIONS} 
                    widthClass="w-full" onSelect={(val: any) => handleInputChange('Type', val?.value)} 
                />
            </FormField>
            <FormField label="Currency" error={errors.Currency}>
                <SingleDropdown 
                    inputName="Currency" staticOptions={currencyOptions}
                    widthClass="w-full" onSelect={(val: any) => handleInputChange('Currency', val?.value)}
                />
            </FormField>
            <FormField label="Price" error={errors.Price} required>
                <input type="number" placeholder="Price" className={THEME.TextInput} value={formData.Price}
                onChange={(e) => handleInputChange('Price', e.target.value)}/>
            </FormField>
            <FormField label="Agency" error={errors.Agency}>
                <input type="text" placeholder="If applicable" className={THEME.TextInput} value={formData.Agency}
                onChange={(e) => handleInputChange('Agency', e.target.value)}/>
            </FormField>
            <FormField label="Commision (%)" error={errors.Commision}>
                <input type="number" placeholder="Percentage" className={THEME.TextInput} value={formData.Commission}
                onChange={(e) => handleInputChange('Commission', e.target.value)}/>
            </FormField>
            <FormField label="Wastage (%)" error={errors.ExcessCut}>
                <div className="relative flex items-center">
                    <input type="number" placeholder="Percentage" className={THEME.TextInput} value={formData.ExcessCut}
                    onChange={(e) => handleInputChange('ExcessCut', e.target.value)}/>

                    <div
                        className="tooltip tooltip-top absolute right-3 cursor-help"
                        data-tip={`PO Qty: ${poQuantity} | Will Cut: ${cutQuantity.toFixed(0)}`}
                    >
                        <Info className="h-4 w-4 text-gray-400 hover:text-primary transition-colors" />
                    </div>
                </div>
            </FormField>
            <div className="pb-1">
                <button
                    type="button"
                    onClick={handleReCalculateVariants}
                    disabled={isCalculatingVariants}
                    className={`${THEME.ButtonSecondary} w-full h-15 mt-2 flex items-center justify-center gap-2 ${isCalculatingVariants ? 'opacity-70 cursor-not-allowed' : ''}`}
                >   
                    <RefreshCw className={`h-4 w-4 ${isCalculatingVariants ? 'animate-spin' : ''}`} />
                    {isCalculatingVariants ? 'Resetting...' : 'Reset Qty'}
                </button>
            </div>
            <div className="pb-1">
                {children}
            </div>
        </form>
    )
}