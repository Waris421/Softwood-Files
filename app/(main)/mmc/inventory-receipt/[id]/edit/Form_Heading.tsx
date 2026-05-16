'use client';

import { useCallback, useEffect, useState } from "react";
import { useFormRegistry } from "./FormContext";
import { FormField } from "@/_components/generic/FormItems";
import { THEME } from "@/_components/constants/ui";
import { usePathname, useRouter } from "next/navigation";
import { Calculator } from "lucide-react";

//Schema of the form
type FormSchema = {
    PONumber: number;
    id: number;
    ReceiptDate: string;
    Supplier: string;
    Invoice?: string;
    Vehicle?: string;
    Bilty?: string;
    Amount?: number;
}

//data type of validation schema
type ValidationSchemaType = {
    [K in keyof FormSchema]?: (val: any, data: FormSchema) => string | null;
}

const VALIDATION_SCHEMA: ValidationSchemaType= {
    Amount: (val) => (val<0 ? 'Cannot be negative': null),
}

const FORM_NAME_WITH_PARENT = 'Receipt';

export default function HeadingForm({ children}: { children?: React.ReactNode}) {
    const { setFormData, registerValidator, getCombinedData, setLoading, registerCustomAction} = useFormRegistry();
    const [errors, setErrors] = useState<Record<string, string>>({});

    const [formData, setLocalFormData] = useState({
        PONumber: 0, id: 0 , ReceiptDate: '', Supplier: '', Invoice: '', Vehicle: '', Bilty: '', Amount: 0,
    });

    const router = useRouter();
    const pathName = usePathname();

    const [summary, setSummary] = useState({
        totalValue: '', uniqueInventories: 0, totalLines: 0
    })

    //Pull default values at the start from parent
    useEffect(() => {
        const initialValues = getCombinedData()[FORM_NAME_WITH_PARENT];
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

    //Update the summary when the inventories change
    const handleInventoriesChange = useCallback((data: typeof summary) => {
        if (data) {
            setSummary({
                totalValue: data.totalValue,
                uniqueInventories: data.uniqueInventories,
                totalLines: data.totalLines
            });
        }
    }, []);
    
    //Register custom actions with the parent.
    useEffect(() => {
        registerCustomAction('updateSummary', handleInventoriesChange);
    }, [registerCustomAction, handleInventoriesChange]);

    const handleReceiptChange = async (receiptId: string, shouldRedirect: boolean = false) => {
        setLocalFormData(prev => ({ ...prev, id: Number(receiptId) }));
        if (shouldRedirect && receiptId) {
            setLoading('Receipt', true);
            
            const pathSegments = pathName.split('/');
            
            if (pathSegments.length >= 4) {
                pathSegments[3] = receiptId;

                const newPath = pathSegments.join('/');

                router.push(newPath);

                setLoading('Receipt', false);
            }
        }
    }
    
    return (
        <form className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 items-end">
            <FormField label="GRN" error={errors.ReceiptNumber} required>
                <input type="number" placeholder="GRN" className={THEME.TextInput} value={formData.id}
                        onChange={(e) => handleReceiptChange(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                handleReceiptChange(e.currentTarget.value, true);
                            }
                        }}
                        onBlur={(e) => handleReceiptChange(e.target.value, true)}
                        />
            </FormField>
            <FormField label="PO Number" error={errors.PONumber} required>
                <input type="number" placeholder="PO Number" className={THEME.TextInputReadOnly} value={formData.PONumber}
                        onChange={(e) => handleInputChange('PONumber', e.target.value)} readOnly/>
            </FormField>
            <FormField label="Date" error={errors.ReceiptDate} required>
                <input type="text" placeholder="Date" className={THEME.TextInputReadOnly} value={formData.ReceiptDate}
                        onChange={(e) => handleInputChange('ReceiptDate', e.target.value)} readOnly/>
            </FormField>
            <FormField label="Supplier" error={errors.Supplier} required>
                <input type="text" placeholder="Supplier" className={THEME.TextInputReadOnly} value={formData.Supplier}
                        onChange={(e) => handleInputChange('Supplier', e.target.value)} readOnly/>
            </FormField>
            <FormField label="Invoice" error={errors.Invoice}>
                <input type="text" placeholder="Invoice Number" className={THEME.TextInput} value={formData.Invoice}
                        onChange={(e) => handleInputChange('Invoice', e.target.value)}/>
            </FormField>
            <FormField label="Vehicle" error={errors.Vehicle}>
                <input type="text" placeholder="Vehicle Number" className={THEME.TextInput} value={formData.Vehicle}
                        onChange={(e) => handleInputChange('Vehicle', e.target.value)}/>
            </FormField>
            <FormField label="Bilty" error={errors.Bilty}>
                <input type="text" placeholder="Bilty Number" className={THEME.TextInput} value={formData.Bilty}
                        onChange={(e) => handleInputChange('Vehicle', e.target.value)}/>
            </FormField>
            <FormField label="Amount" error={errors.Amount}>
                <input type="number" placeholder="Bilty Value" className={THEME.TextInput} value={formData.Amount}
                        onChange={(e) => handleInputChange('Amount', e.target.value)}/>
            </FormField>

            <div className="col-span-2 flex items-center gap-2">
                <div className="flex-1">
                    {children}
                </div>
                <div className="w-px h-10" />
                <div className="flex-1 w-2/5">
                    <div className="flex items-center gap-1 text-[10px] uppercase opacity-60 font-bold leading-none mb-1">
                        <Calculator className="w-3 h-3" />
                        <span>Summary</span>
                    </div>
                    <div className="flex flex-col leading-tight">
                        <span className="text-[11px] whitespace-nowrap">
                            <b className="text-primary">{summary.uniqueInventories}</b> Items / 
                            <b className="text-primary"> {summary.totalLines}</b> Combos
                        </span>
                        <span className="text-sm font-bold text-success whitespace-nowrap">
                            <b className="text-primary"> {summary.totalValue}</b>
                        </span>
                    </div>
                </div>
            </div>
        </form>
    )
}