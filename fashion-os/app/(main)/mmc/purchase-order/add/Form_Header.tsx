'use client';

import { useFormRegistry } from "./AddFormContext";
import { useCallback, useEffect, useState } from "react";
import { SingleDropdown } from "@/_components/Dropdown/Dropdown";
import { THEME } from "@/_components/constants/ui";

type FormSchema = {
    id:           number | null;
    Supplier:     string;
    OrderDate:    string;
    DeliveryDate: string;
    Tax:          number;
}

// This key identifies this form's slot in shared storage — FormContext uses it to store/retrieve header data
const FORM_KEY = 'header';

export default function HeaderForm({ children }: { children?: React.ReactNode }) {
    const { setFormData, getCombinedData, registerValidator, options, initialData } = useFormRegistry();

    const [formData, setLocalFormData] = useState<FormSchema>({
        id: null, Supplier: '', OrderDate: new Date().toISOString().split('T')[0], DeliveryDate: '', Tax: 0,
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    const supplierOptions = options.suppliers || [];

    // ── STEP 1: Populate form when data arrives from FormContext ───────────────
    // In add mode: getCombinedData()['header'] is undefined so existing is falsy — fields stay blank
    useEffect(() => {
        const existing = getCombinedData()[FORM_KEY];
        if (existing) setLocalFormData(existing);
    }, [initialData, getCombinedData]);

    // ── STEP 2: Push changes up to FormContext on every edit ───────────────────
    // Fires on every formData change — keeps shared storage always in sync with what the user has typed
    useEffect(() => {
        setFormData(FORM_KEY, formData);
    }, [formData, setFormData]);

    // ── STEP 3: Handle input changes ──────────────────────────────────────────
    const handleChange = (field: keyof FormSchema, value: any) => {
        setLocalFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) setErrors(prev => { const e = { ...prev }; delete e[field]; return e; });
    };

    // ── STEP 4: Validate and register with parent ──────────────────────────────
    // Registers this form's validator with FormContext — called when Save button triggers validateAll()
    const validateForm = useCallback(() => {
        const newErrors: Record<string, string> = {};
        if (!formData.Supplier)     newErrors.Supplier     = 'Supplier is required';
        if (!formData.DeliveryDate) newErrors.DeliveryDate = 'Delivery date is required';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [formData]);

    useEffect(() => {
        registerValidator(FORM_KEY, validateForm);
        return () => registerValidator(FORM_KEY, () => true);
    }, [validateForm, registerValidator]);

    return (
        <div className="flex flex-wrap items-start gap-4 p-4">
            {/* Supplier */}
            <div className="flex flex-col gap-1">
                <label className="text-xs text-muted-foreground">Supplier</label>
                <SingleDropdown
                    inputName="Supplier"
                    placeholder="Select supplier..."
                    widthClass="w-48"
                    staticOptions={supplierOptions}
                    defaultValue={formData.Supplier}
                    onSelect={(opt) => handleChange('Supplier', opt?.value || '')}
                />
                {errors.Supplier && <p className="text-[10px] text-red-500">{errors.Supplier}</p>}
            </div>

            {/* Order Date */}
            <div className="flex flex-col gap-1">
                <label className="text-xs text-muted-foreground">Order Date</label>
                <input
                    type="date"
                    className={`${THEME.TextInput} opacity-60 cursor-not-allowed`}
                    value={formData.OrderDate}
                    readOnly
                />
            </div>

            {/* Delivery Date */}
            <div className="flex flex-col gap-1">
                <label className="text-xs text-muted-foreground">Delivery Date</label>
                <input
                    type="date"
                    className={THEME.TextInput}
                    value={formData.DeliveryDate}
                    onChange={(e) => handleChange('DeliveryDate', e.target.value)}
                />
                {errors.DeliveryDate && <p className="text-[10px] text-red-500">{errors.DeliveryDate}</p>}
            </div>

            {/* Tax */}
            <div className="flex flex-col gap-1">
                <label className="text-xs text-muted-foreground">Tax (%)</label>
                <input
                    type="number"
                    step="any"
                    className={THEME.TextInput}
                    value={formData.Tax}
                    onChange={(e) => handleChange('Tax', parseFloat(e.target.value) || 0)}
                />
            </div>

            {/* Save button slot — Parent passes it in as a child */}
            {children}
        </div>
    );
}
