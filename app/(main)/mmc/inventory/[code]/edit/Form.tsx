'use client'

import { THEME } from "@/_components/constants/ui";
import { SingleDropdown } from "@/_components/Dropdown/Dropdown";
import { DropdownOption } from "@/_components/Dropdown/types";
import { FormField } from "@/_components/generic/FormItems";
import LoadingIcon from "@/_components/generic/Loading";
import MessageBox from "@/_components/generic/MessageBox";
import { Switch } from "@/_components/Switch/Switch";
import { Loader2, PenSquare, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

interface FormProps {
    code: string;
    baseApiUrl?: string;
    redirectUrl?: string;
}

//Schema of the form
type FormSchema = {
    Code: string;
    Name: string;
    Group: string;
    UnitType: string;
    Unit: string;
    AuditReq: boolean;
    Life: number;
    LeadTime: number;
    MinStockLvl: number;
    StandardPrice: number;
    Currency: string;
    InUse: boolean
}

//data type of validation schema
type ValidationSchemaType = {
    [K in keyof FormSchema]?: (val: any, data: FormSchema) => string | null;
}

const VALIDATION_SCHEMA: ValidationSchemaType= {
    Code: (val) => (!val.trim() ? 'Code is required' : null),
    Name: (val) => (!val.trim() ? 'Name is required' : null),
    Group: (val) => (!val.trim() ? 'Group is required' : null),
    Unit: (val) => (!val.trim() ? 'Unit is required' : null),
}

const INVENTORY_GROUPS = [
    { label: 'Trims', value: 'Trim' },
    { label: 'Fabric', value: 'Fabric' },
    { label: 'Washing', value: 'Washing' },
    { label: 'Electrical', value: 'Electrical' },
    { label: 'Electronics', value: 'Electronics' },
    { label: 'Mechanical', value: 'Mechanical' },
    { label: 'Medicine', value: 'Medicine' },
    { label: 'Stationery', value: 'Stationery' },
    { label: 'Housekeeping', value: 'Housekeeping' },
    { label: 'Fixed Assets', value: 'Fixed Assets' },
    { label: 'Others', value: 'Others' },
]

export default function InventoryUpdateForm({
    code,
    baseApiUrl = '/api/mmc/inventory',
}: FormProps) {
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [messageConfig, setMessageConfig] = useState<{ show: boolean; subject: string; message: string; action?: () => void; } | null>(null);
    const [options, setOptions] = useState({ groups: INVENTORY_GROUPS, unitTypes: [], units: [], currencies: [] });

    const nameInputRef = useRef<HTMLInputElement>(null);

    const [formData, setFormData] = useState({
        Code: '', Name: '',Group: '', UnitType: '', Unit: '',
        AuditReq: true, Life: 0, LeadTime: 0, MinStockLvl: 0,
        StandardPrice: 0, Currency: 'PKR', InUse: true
    });

    useEffect(() => {
        const loadData = async() => {
            try {
                setIsLoading(true);
                const apiURL = `${baseApiUrl}/${code}/update`;
                const response = await fetch(apiURL);
                if (!response.ok) {
                    const errorData = await response.json();

                    throw new Error(`${errorData.details.message}`);
                }

                const data = await response.json();

                setOptions(prev => ({
                    ...prev,
                    unitTypes: data.unitGroups.map((m: any) => ({ label: String(m.label), value: String(m.value) })),
                    currencies: data.currencies.map((m: any) => ({ label: String(m.label), value: String(m.value) })),
                }));

                const presetFormData = data.inventory;

                setFormData(presetFormData);

                handleUnitTypeChange({value: presetFormData.UnitType, label: presetFormData.UnitType})

                nameInputRef.current?.focus();
            } catch (err: any) {
                setMessageConfig({
                    show: true,
                    subject: "Fetch Error",
                    message: err.message,
                    action: () => {
                        window.location.reload();
                    }
                });
            } finally {
                setIsLoading(false);
            }
        }

        loadData();
    }, [baseApiUrl]);

    //Helper function to update the units based on selected group
    const handleUnitTypeChange = async (selectedType: DropdownOption|null) => {
        if (!selectedType) {
            handleInputChange('UnitType', null);
            setOptions(prev => ({
                ...prev,
                units: []
            }));
            return ;
        }
        const unitType = selectedType.value;

        handleInputChange('UnitType', unitType);

        const response = await fetch(`/api/mmc/inventory/units?group=${unitType}`);
        const result = await response.json();
        const unitArray = Array.isArray(result) ? result : result.units;
        setOptions(prev => ({
            ...prev,
            units: unitArray,
        }));
    }

    //Helper function that triggers when user types something
    const handleInputChange = (field: keyof FormSchema, value: any) => {
        //Update the data in the form object
        setFormData(prev => {
            const newData = { ...prev, [field]: value };

            return newData;
        });

        //Clear the error on the field if there was one previously
        if (errors[field]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    }

    //Check the form for errors. Return true if there is an error
    const validateForm = () => {
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
    };

    //Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        //Errors in the form
        if (!validateForm()) return ;

        //Form is valid now
        const apiURL = `${baseApiUrl}/${code}/update`;
        try {
            setIsSubmitting(true);
            const response = await fetch(apiURL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || error);
            }

            setMessageConfig({
                show: true,
                subject: 'Success',
                message: 'Saved Successfully',
            });
        } catch (err: any) {
            setMessageConfig({
                show: true,
                subject: "Error",
                message: `Saving Failed: ${err}`
            });
        } finally {
            setIsSubmitting(false);
        }
    }
    
    if (isLoading) return (
        <LoadingIcon />
    );

    return (
        <div className="max-w-6xl mx-auto p-6 bg-base-100 rounded-xl shadow-xl border border-base-200">
            <div className="flex items-center gap-3 mb-8 border-b pb-4">
                <PenSquare className="text-primary w-6 h-6" />
                <h2 className="text-2xl font-bold">Inventory Card Update {formData.Name}</h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <form onSubmit={handleSubmit} className="lg:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField label="Code" error={errors.Code} required>
                        <input type="text" placeholder="Code" className={THEME.TextInputReadOnly} value={formData.Code} readOnly/>
                    </FormField>

                    <FormField label="Name" error={errors.Name} required>
                        <input type="text" placeholder="Enter Name" className={THEME.TextInput} value={formData.Name} 
                            onChange={(e) => handleInputChange('Name', e.target.value)} ref={nameInputRef}/>
                    </FormField>

                    <FormField label="Group" error={errors.Group} required>
                        <SingleDropdown 
                            inputName='Group' placeholder="Select Group" isStatic staticOptions={options.groups} 
                            widthClass="w-full" onSelect={(val: any) => handleInputChange('Group', val?.value)} 
                            defaultValue={formData.Group}
                        />
                    </FormField>

                    <FormField label="Unit Type" error={errors.UnitType}>
                        <SingleDropdown 
                            inputName='UnitType' placeholder="Select type" isStatic staticOptions={options.unitTypes} 
                            widthClass="w-full" onSelect={handleUnitTypeChange}
                            defaultValue={formData.UnitType}
                        />
                    </FormField>

                    <FormField label="Unit" error={errors.Unit} required>
                        <SingleDropdown 
                            inputName="Unit" placeholder="Select Unit" isStatic staticOptions={options.units}
                            widthClass="w-full" onSelect={(val: any) => handleInputChange('Unit', val?.value)} 
                            defaultValue={formData.Unit}
                        />
                    </FormField>

                    <FormField label="Audit Required" error={errors.AuditReq} required>
                        <Switch 
                            checked={formData.AuditReq}
                            onCheckedChange={(bool) => handleInputChange('AuditReq', bool)}
                        />
                    </FormField>

                    <FormField label="Life (years)" error={errors.Life}>
                        <input type="number" placeholder="Enter Value" className={THEME.TextInput} value={formData.Life} 
                            onChange={(e) => handleInputChange('Life', e.target.value)} />
                    </FormField>

                    <FormField label="Lead Time (days)" error={errors.LeadTime}>
                        <input type="number" placeholder="Enter Value" className={THEME.TextInput} value={formData.LeadTime} 
                            onChange={(e) => handleInputChange('LeadTime', e.target.value)} />
                    </FormField>

                    <FormField label="Min Stock Qty" error={errors.MinStockLvl}>
                        <input type="number" placeholder="Enter Value" className={THEME.TextInput} value={formData.MinStockLvl} 
                            onChange={(e) => handleInputChange('MinStockLvl', e.target.value)} />
                    </FormField>

                    <FormField label="Standard Price" error={errors.StandardPrice}>
                        <input type="number" placeholder="Enter Value" className={THEME.TextInput} value={formData.StandardPrice} 
                            onChange={(e) => handleInputChange('StandardPrice', e.target.value)} />
                    </FormField>

                    <FormField label="Currency" error={errors.Currency}>
                        <SingleDropdown 
                            inputName="Currency" placeholder="Select Currency" isStatic staticOptions={options.currencies}
                            widthClass="w-full" onSelect={(val: any) => handleInputChange('Currency', val?.value)} 
                            defaultValue={formData.Currency}
                        />
                    </FormField>

                    <FormField label="In Use" error={errors.InUse}>
                        <Switch 
                            checked={formData.InUse}
                            onCheckedChange={(bool) => handleInputChange('InUse', bool)}
                        />
                    </FormField>

                    <div className="md:col-span-3 mt-4">
                        <button type="submit" className={`${THEME.ButtonBasic} w-full ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`} disabled={isSubmitting}>
                            {isSubmitting ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Save className="w-4 h-4" />
                            )}
                            {isSubmitting ? 'Saving...' : 'Save Data'}
                        </button>
                    </div>
                </form>
            </div>

            {messageConfig?.show && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <MessageBox 
                        subject={messageConfig.subject}
                        message={messageConfig.message}
                        confirmText="Close"
                        onConfirm={() => {
                            if (messageConfig.action) messageConfig.action();
                            setMessageConfig(null);
                        }}  
                    />
                </div>
            )}
        </div>
    )
}