'use client'

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

//Schema of the form
type FormSchema = {
    Departments: string;
    StartDate: string;
    EndDate: string;
    Description: string;
}

//data type of validation schema
type ValidationSchemaType = {
    [K in keyof FormSchema]?: (val: any, data: FormSchema) => string | null;
}

//Validation schema for the different fields of the form
const VALIDATION_SCHEMA: ValidationSchemaType = {
    Departments: (val: string[]) => {
        if (!val || val.length === 0) {
            return 'At least one department must be selected';
        }
        return null;
    },
    StartDate: (val) => (!val ? 'Start date is required' : null),
    Description: (val) => (!val ? 'Description is required' : null),
}

export default function HolidayForm() {
    const [formData, setFormData] = useState({
        StartDate: '', EndDate: '', Departments: [], Description: '',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isLoading, setIsLoading] = useState(true);
    const [messageConfig, setMessageConfig] = useState<{ show: boolean; subject: string; message: string; action?: () => void; } | null>(null);
    const [options, setOptions] = useState({ departments: []});
    const router = useRouter();

    useEffect(() => {
        const loadData = async () => {
            try {
                console.log('I am called');
            } catch (err: any) {

            } finally {
                setIsLoading(false);
            }
        }

        loadData();
    }, []);
        
    return (
        <div></div>
    )
}