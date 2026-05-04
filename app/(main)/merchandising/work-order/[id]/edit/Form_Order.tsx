'use client';

import { useCallback, useEffect, useState } from "react";
import { useFormRegistry } from "./FormContext";
import { FormField } from "@/_components/generic/FormItems";
import { THEME } from "@/_components/constants/ui";
import { SingleDropdown, SingleDropdownAsync } from "@/_components/Dropdown/Dropdown";
import { DatePicker } from "@/_components/Datepicker/Datepicker";
import { Info, Loader2 } from "lucide-react";

//Schema of the form
type FormSchema = {
    OrderNumber: number;
    Style: string;
    Customer: string;
    DeliveryDate: string;
    Type: string;
    Currency: string;
    Price: number;
    ExcessCut: number;
    Quantity: number;
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

const FORM_NAME_WITH_PARENT = 'Order';

const TYPE_OPTIONS = [
    {'value': 'Export', 'label': 'Export'},
    {'value': 'CMT', 'label': 'CMT'},
    {'value': 'Local', 'label': 'Local'},
    {'value': 'SMS', 'label': 'SMS'},
]

export default function OrderForm({ children }: { children?: React.ReactNode }) {
    const { setFormData, options, registerValidator, getCombinedData, registerCustomAction, customAction} = useFormRegistry();
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [poQuantity, setPOQuantity] = useState<number>(0);

    const [formData, setLocalFormData] = useState({
        OrderNumber: 0, Style: '', Customer: '', DeliveryDate: '', Type: '',
        Currency: '', Price: 0, ExcessCut: 3, Quantity: 0,
    });

    const currencyOptions = options.currencies || [];

    //Pull default values at the start from parent
    useEffect(() => {
        const initialValues = getCombinedData()[FORM_NAME_WITH_PARENT];
        //console.log(initialValues);
        if (initialValues) {
            setLocalFormData(prev => ({
                ...prev,
                ...initialValues
            }));
        }
    }, [getCombinedData]);

    //Sync local state to Parent Registry whenever formData changes
    useEffect(() => {
        setFormData(FORM_NAME_WITH_PARENT, formData);
    }, [formData, setFormData]);

    //Register any custom actions with the parent on mount
    useEffect(() => {
        registerCustomAction('updateQuantity', handleQtyChange);
    }, [registerCustomAction]);

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

    const handleQtyChange = (quantity: number) => {
        setPOQuantity(quantity);
    }

    const cutQuantity = Math.ceil(
        poQuantity + (poQuantity * (Number(formData.ExcessCut) / 100))
    );
    
    return (
        <form className="lg:col-span-2 grid grid-cols-1 md:grid-cols-5 gap-2">
            <FormField label="Order Number" error={errors.OrderNumber} required>
                <input readOnly placeholder="Order Number" className={THEME.TextInputReadOnly} value={formData.OrderNumber}/>
            </FormField>   

            <FormField label="Style" error={errors.Style} required>
                <SingleDropdownAsync
                    inputName='Style' placeholder="Select Style" apiUrl={STYLE_OPTIONS_URL} 
                    widthClass="w-full" onSelect={(val: any) => handleInputChange('Style', val?.value)}  
                    defaultValue={formData.Style}
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
                    defaultValue={formData.Type}
                />
            </FormField>

            <FormField label="Price" error={errors.Price || errors.Currency} required>
                <div className="join w-full">
                    <input type="number" placeholder="Price" className={`${THEME.TextInput} join-item w-1/3`}
                    value={formData.Price}
                    onChange={(e) => handleInputChange('Price', e.target.value)}/>

                    <div className="join-item w-2/3">
                        <SingleDropdown 
                            inputName="Currency" staticOptions={currencyOptions}
                            widthClass="w-full" onSelect={(val: any) => handleInputChange('Currency', val?.value)}
                            defaultValue={formData.Currency}
                        />
                    </div>
                </div>
            </FormField>

            <FormField label="Wastage (%)" error={errors.ExcessCut}>
                <input type="number" placeholder="Percentage" className={THEME.TextInput} value={formData.ExcessCut}
                onChange={(e) => handleInputChange('ExcessCut', e.target.value)}/>
            </FormField>

            <FormField label="Quantity" error={errors.Quantity}>
                <div className="relative flex items-center">
                    <input readOnly placeholder="Quantity" className={THEME.TextInputReadOnly} value={poQuantity}
                    onChange={(e) => handleInputChange('Price', e.target.value)}/>

                    <div
                        className="tooltip tooltip-top absolute right-3 cursor-help"
                        data-tip={`PO Qty: ${poQuantity} | Will Cut: ${cutQuantity.toFixed(0)}`}
                    >
                        <Info className="h-4 w-4 text-gray-400 hover:text-primary transition-colors" />
                    </div>
                </div>
            </FormField>

            <div className="md:col-span-5 lg:col-span-1 flex items-end gap-2 pb-1">
                {children}
            </div>
        </form>
    )
}