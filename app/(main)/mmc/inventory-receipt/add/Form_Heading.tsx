'use client';

import { useCallback, useEffect, useState } from "react";
import { useFormRegistry } from "./FormContext";
import { FormField } from "@/_components/generic/FormItems";
import { SingleDropdownAsync } from "@/_components/Dropdown/Dropdown";
import { THEME } from "@/_components/constants/ui";
import { DropdownOption } from "@/_components/Dropdown/types";
import { Calculator } from "lucide-react";

//Schema of the form
type FormSchema = {
    PONumber: string | number;
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
    PONumber: (val) => (!val ? 'This is required' : null),
    Amount: (val) => (val<0 ? 'Cannot be negative': null),
}

const PO_OPTIONS_URL = '/api/options/purchase-orders/pending';

const FORM_NAME_WITH_PARENT = 'heading';


export default function HeadingForm({ children }: { children?: React.ReactNode }) {
    const { setFormData, registerValidator, setSelectedPO, registerCustomAction} = useFormRegistry();
    const [errors, setErrors] = useState<Record<string, string>>({});

    const [formData, setLocalFormData] = useState({
        PONumber: '', Invoice: '', Vehicle: '', Bilty: '', Amount: 0,
    });

    const [summary, setSummary] = useState({
        totalValue: '', uniqueInventories: 0, totalLines: 0
    })

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

    //Updates the po number in the contet when it changes.
    const handlePOChange = async (selectedOption: DropdownOption|null) => {
        if (!selectedOption) {
            handleInputChange('PONumber', '');
            return ;
        }

        const selectedPO = selectedOption.value;

        handleInputChange('PONumber', selectedPO);

        setSelectedPO(Number(selectedPO));

    }
    
    return (
        <form className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-2 items-end">
            <FormField label="PONumber" error={errors.PONumber} required>
                <SingleDropdownAsync 
                    inputName="PONumber" placeholder="Only Pending POs" apiUrl={PO_OPTIONS_URL}
                    widthClass="w-full" onSelect={handlePOChange}
                />
            </FormField>

            <FormField label="Invoice" error={errors.Invoice}>
                <input type="text" placeholder="Invoice Number" className={THEME.TextInput} value={formData.Invoice}
                    onChange={(e) => handleInputChange('Invoice', e.target.value)}/>
            </FormField>

            <FormField label="Vehicle" error={errors.Vehicle}>
                <input type="text" placeholder="Vehicle Number" className={THEME.TextInput} value={formData.Vehicle}
                    onChange={(e) => handleInputChange('Vehicle', e.target.value)}/>
            </FormField>

            <FormField label="Bilty#" error={errors.Bilty}>
                <input type="text" placeholder="Bilty Number" className={THEME.TextInput} value={formData.Bilty}
                    onChange={(e) => handleInputChange('Bilty', e.target.value)}/>
            </FormField>

            <FormField label="Amount" error={errors.Amount}>
                <input type="number" placeholder="Bilty Amount" className={THEME.TextInput} value={formData.Amount}
                    onChange={(e) => handleInputChange('Amount', e.target.value)} min={0} />
            </FormField>

            <div className="col-span-2 flex items-center gap-2">
                <div className="flex-1">
                    {children}
                </div>
                <div className="w-px h-10 bg-base-300" />
                <div className="flex flex-col min-w-35">
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