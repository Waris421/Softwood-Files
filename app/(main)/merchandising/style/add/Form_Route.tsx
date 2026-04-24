'use client';

import { useFormRegistry } from "./FormContext";
import { useCallback, useEffect, useState } from 'react';
import { Route, ClipboardList, Info } from 'lucide-react';
import { FormField } from "@/_components/generic/FormItems";
import { SingleDropdown } from "@/_components/Dropdown/Dropdown";
import { DropdownOption } from "@/_components/Dropdown/types";
import { DataTable } from "@/_components/table/Table";
import { ColumnDef } from "@tanstack/react-table";

//Schema of the form
type FormSchema = {
    RouteId: number|null;
}

//data type of validation schema
type ValidationSchemaType = {
    [K in keyof FormSchema]?: (val: any, data: FormSchema) => string | null;
}

const VALIDATION_SCHEMA: ValidationSchemaType= {
    RouteId: (val) => (!val || String(val).trim() === '' ? 'Route is required' : null),
}

type Route = {
    Stage: string,
    PreReqs: string[],
}

const routeTableColumns: ColumnDef<Route>[] = [
    {
        accessorKey: 'Stage',
        header: 'Stage',
    },
    {
        accessorKey: 'PreReqs',
        header: 'Pre-Requisites',
    },
]

const FORM_Name_WITH_PARENT = 'route';

export default function RouteForm() {
    const { setFormData, getCombinedData, setFormMetaData, getCombinedMetaData, registerValidator, options} = useFormRegistry();
    const [isFetching, setIsFetching] = useState(false);
    const [fetchError, setFetchError] = useState(null);
    const [formData, setLocalFormData] = useState(() => {
        const existingData = getCombinedData();
        return existingData[FORM_Name_WITH_PARENT] || { RouteId: '' };
    });
    const [routeData, setRouteData] = useState<Route[]>(() => 
        getCombinedMetaData(FORM_Name_WITH_PARENT).routeData || []
    );
    const [errors, setErrors] = useState<Record<string, string>>(() => 
        getCombinedMetaData(FORM_Name_WITH_PARENT).errors || {}
    );

    const routeOptions = options.routes || [];

    //Sync local state to Parent Registry whenever formData changes
    useEffect(() => {
        setFormData(FORM_Name_WITH_PARENT, formData);
    }, [formData, setFormData]);

    useEffect(() => {
        setFormMetaData(FORM_Name_WITH_PARENT, { routeData, errors });
    }, [routeData, errors, setFormMetaData]);

    //Helper function that triggers when user types something
    const handleInputChange = (field: keyof FormSchema, value: any) => {
        setLocalFormData((prev: any) => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    }

    const handleRouteChange = async (selectedRoute: DropdownOption|null) => {
        if (!selectedRoute) {
            handleInputChange('RouteId', '');
            setRouteData([]);
            return ;
        }
        const selectedRouteId =  selectedRoute.value;
        handleInputChange('RouteId', selectedRouteId);

        try {
            setIsFetching(true);
            const response = await fetch(`/api/merchandising/style/route-preset?routeId=${selectedRouteId}`);
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.details?.message || "Failed to fetch requests");
            }
            const stages = await response.json();

            setRouteData(stages);
        } catch(err: any) {
            setFetchError(err.message);
        } finally {
            setIsFetching(false);
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
        registerValidator(FORM_Name_WITH_PARENT, validateForm);
        return () => registerValidator(FORM_Name_WITH_PARENT, () => true);
    }, [validateForm, registerValidator]);

    return (
        <div className="max-w-2xl mx-auto p-4 space-y-4">
            <form autoComplete="off">
                <div className="border rounded-lg border-base-content/20 dark:border-neutral-content/20 p-1">
                    <div className="grid grid-cols-1 border rounded bg-base-200 dark:bg-base-900 p-2">
                        <div className="flex items-center gap-3">
                            <Route className="w-5 h-5 opacity-70" />
                            <FormField label="Route Name" error={errors.RouteId}>
                                <SingleDropdown 
                                    inputName="RouteId" placeholder="Select a route" staticOptions={routeOptions}
                                    widthClass="w-full" onSelect={handleRouteChange} defaultValue={formData.RouteId || ''}
                                />
                            </FormField>
                        </div>
                    </div>
                </div>
            </form>

            <div className="border rounded-lg border-base-content/20 dark:border-neutral-content/20 p-1">
                <div className="grid grid-cols-1 bg-base-200 dark:bg-base-900 rounded overflow-hidden">
                    <DataTable
                        columns={routeTableColumns}
                        data={routeData}
                        showDownload={false}
                        showPrint={false}
                        showPagination={false}
                        isLoading={isFetching}
                        error={fetchError}
                    />
                </div>
            </div>
        </div>
    )
}