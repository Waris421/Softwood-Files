'use client';

import { useCallback, useEffect, useState } from "react";
import { useFormRegistry } from "./FormContext";
import { FormField } from "@/_components/generic/FormItems";
import { THEME } from "@/_components/constants/ui";
import { SingleDropdown, SingleDropdownAsync } from "@/_components/Dropdown/Dropdown";
import { DatePicker } from "@/_components/Datepicker/Datepicker";
import { ExternalLink, Info, Loader2 } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/_components/generic/utils";

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
    const { setFormData, options, registerValidator, getCombinedData, registerCustomAction, setLoading} = useFormRegistry();
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [poQuantity, setPOQuantity] = useState<number>(0);

    const [formData, setLocalFormData] = useState({
        OrderNumber: 0, Style: '', Customer: '', DeliveryDate: '', Type: '',
        Currency: '', Price: 0, ExcessCut: 3
    });

    const currencyOptions = options.currencies || [];

    const router = useRouter();
    const pathname = usePathname();

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

    //Helper function to fetch the date for new order when order number is changed.
    const handleOrderNumberChange = async (orderNumber: string, shouldRedirect: boolean = false) => {
        setLocalFormData(prev => ({ ...prev, OrderNumber: Number(orderNumber) }));
        
        if (shouldRedirect && orderNumber) {
            setLoading('Order', true);

            const pathSegments = pathname.split('/');

            if (pathSegments.length >= 4) {
                pathSegments[3] = orderNumber;
                const newPath = pathSegments.join('/');

                router.push(newPath);
            } 
        }     
    }

    const handleQtyChange = (quantity: number) => {
        setPOQuantity(quantity);
    }

    const cutQuantity = Math.ceil(
        poQuantity + (poQuantity * (Number(formData.ExcessCut) / 100))
    );
    
    return (
        <form className="lg:col-span-2 grid grid-cols-1 md:grid-cols-5 gap-2">
            <FormField label="Order Number" error={errors.OrderNumber} required>
                <input placeholder="Order Number" type="number"
                    className={THEME.TextInput} value={formData.OrderNumber}
                    onChange={(e) => handleOrderNumberChange(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            e.preventDefault();
                            handleOrderNumberChange(e.currentTarget.value, true);
                        }
                    }}
                    onBlur={(e) => handleOrderNumberChange(e.target.value, true)}
                />
            </FormField>   

            <div className="grid col-span-2">
                <FormField label="Style" error={errors.Style} required>
                    <div className="flex items-center w-full">
                        <div className="flex-1 min-w-0">
                            <SingleDropdownAsync
                                inputName='Style' placeholder="Select Style" apiUrl={STYLE_OPTIONS_URL} 
                                widthClass="w-full" onSelect={(val: any) => handleInputChange('Style', val?.value)}  
                                defaultValue={formData.Style}
                            />
                    
                        </div>
                        <button
                            type="button"
                            className={cn(
                                "btn btn-ghost rounded-md w-fit px-3 flex-none h-12",
                            )}
                            disabled={!formData.Style}
                            onClick={() => {
                                if (formData.Style) {
                                    window.open(`/merchandising/style/${formData.Style}/edit`, '_blank');
                                }
                            }}
                            title="View Style"
                        >
                            <ExternalLink size={18} />
                        </button>
                    </div>
                </FormField>  
            </div>   

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
                <div className="flex items-center w-full">
                    <input type="number" placeholder="Price" 
                        className={cn(THEME.TextInput, "w-1/3 flex-none")}
                        value={formData.Price}
                        onChange={(e) => handleInputChange('Price', e.target.value)}
                    />

                    <div className="flex-1">
                        <SingleDropdown 
                            inputName="Currency" staticOptions={currencyOptions}
                            widthClass="w-full" onSelect={(val: any) => handleInputChange('Currency', val?.value)}
                            defaultValue={formData.Currency}
                        />
                    </div>
                </div>
            </FormField>

            <FormField label="Wastage (%)" error={errors.ExcessCut} required>
                <div className="flex items-center gap-1.5">
                    {/* Wastage Input */}
                    <input 
                        type="number" 
                        placeholder="%" 
                        className={cn(THEME.TextInput, "w-24 flex-none")}
                        value={formData.ExcessCut}
                        onChange={(e) => handleInputChange('ExcessCut', e.target.value)}
                    />

                    {/* Quantities display */}
                    <div className={cn(THEME.TextInputReadOnly, "flex-1 flex justify-center")}>
                        <div className="text-center">
                            <span className="text-[9px] opacity-60 block leading-tight uppercase font-semibold">PO</span>
                            <span className="font-bold text-xs leading-none">{poQuantity.toLocaleString()}</span>
                        </div>
                        <div className="h-6 border-l border-base-content/20 mx-1" />
                        <div className="text-center">
                            <span className="text-[9px] opacity-60 block leading-tight uppercase font-semibold">Cut</span>
                            <span className="font-bold text-xs leading-none">{cutQuantity.toLocaleString()}</span>
                        </div>
                    </div>
                </div>
            </FormField>

            <div className="md:col-span-5 lg:col-span-1 flex items-end gap-2 pb-1">
                {children}
            </div>
        </form>
    )
}