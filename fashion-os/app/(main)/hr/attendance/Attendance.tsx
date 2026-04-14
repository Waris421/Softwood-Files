'use client';

import { DateRangePicker } from "@/_components/Datepicker/Datepicker";
import LocationPreview from "@/_components/DialogBox/LocationPreview";
import { SingleDropdown } from "@/_components/Dropdown/Dropdown";
import { DropdownOption } from "@/_components/Dropdown/types";
import { DataTable } from "@/_components/table/Table";
import { Badge } from "@/_components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/_components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/_components/ui/tooltip";
import { Cell, ColumnDef } from "@tanstack/react-table";
import { Check, Clock, MapPin, PlaneIcon, TimerIcon, UserMinus, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState, useMemo } from "react";

type Attendance = {
    Date: Date,
    InDetails: string,
    InLatitude: number,
    InLocation: string,
    InLocationFlag: boolean,
    InLongitude: number,
    InTime: string,
    InTimeDiff: number,
    InTimeFlag: boolean,
    OutDetails: string,
    OutLatitude: number,
    OutLocation: string,
    OutLocationFlag: boolean,
    OutLongitude: number,
    OutTime: string,
    OutTimeDiff: number,
    OutTimeFlag: boolean,
    WeekendFlag: boolean,
    HolidayFlag: boolean,
    AbsentFlag: boolean,
    OverTime: number
}

const listColumns: ColumnDef<Attendance>[] = [
    {
        id: 'status',
        header: 'Status',
        cell: ({row}) => {
            const { 
                InLocationFlag, 
                InTimeFlag, 
                OutLocationFlag, 
                OutTimeFlag,
                WeekendFlag,
                HolidayFlag,
                AbsentFlag,
            } = row.original;

            const isComplete = WeekendFlag || HolidayFlag || (InLocationFlag && InTimeFlag && OutLocationFlag && OutTimeFlag);
            const isSpecialDay = WeekendFlag || HolidayFlag;
            
            return (
                <div className="flex justify-center">
                    {AbsentFlag ? (
                        // Distinct styling for Absent status
                        <span className="text-gray-400">
                            <UserMinus className="w-5 h-5" strokeWidth={3} />
                        </span>
                    ) : isComplete ? (
                        <span className="text-success text-xl">
                            <Check 
                                className={`${isSpecialDay ? "text-blue-500" : "text-green-500"} w-5 h-5`}
                                strokeWidth={3} 
                            />
                        </span>
                    ) : (
                        <span className="text-error text-xl">
                            <X 
                                className="text-red-500 w-5 h-5" 
                                strokeWidth={3} 
                            />
                        </span>
                    )}
                </div>
            );
        }
    },

    {
        accessorKey:'Date',
        header: 'Date',
        cell: ({ getValue }) => {
            const dateValue = getValue<string>();

            if (!dateValue) return '---';

            const date = new Date(dateValue);

            //dd-mmm format
            return new Intl.DateTimeFormat('en-GB', {
                day: '2-digit',
                month: 'short',
            }).format(date).replace(' ', '-');
        }
    },

    {
        accessorKey:'InTime',
        header: 'In Time',
    },

    {
        accessorKey:'InLocation',
        header: 'In Location',
    },

    {
        accessorKey:'OutTime',
        header: 'Out Time',
    },

    {
        accessorKey:'OutLocation',
        header: 'Out Location',
    },

    {
        accessorKey: 'OverTime',
        header: 'Over Time',
    },

    {
        id: 'timeDiff',
        header: 'Time Diff',
        cell: ({row}) => {
            const { InTimeDiff, OutTimeDiff, AbsentFlag, WeekendFlag, HolidayFlag, InTimeFlag, OutTimeFlag } = row.original;

            if (AbsentFlag || WeekendFlag || HolidayFlag) {
                return <span className="text-gray-400 text-xs">-</span>;
            }

            const inMinutes = !InTimeFlag ? (InTimeDiff || 0) : 0;
            const outMinutes = !OutTimeFlag ? (OutTimeDiff || 0) : 0;

            const totalMinutes = inMinutes + outMinutes;
            const isZero = totalMinutes === 0;

            const minutesFormatted = isZero ? `-`: `${totalMinutes}m`

            return (
                <div className="flex justify-center">
                    <div className={`badge badge-outline badge-sm font-medium ${
                        isZero 
                            ? "badge-ghost text-gray-500" 
                            : "badge-error text-red-700"
                    }`}>
                        {minutesFormatted}
                    </div>
                </div>
            );
        }
    },

    {
        id: 'details',
        header: 'Details',
        cell: ({row}) => {
            const { 
                InTimeFlag, InLocationFlag, OutTimeFlag, OutLocationFlag, 
                WeekendFlag, HolidayFlag, AbsentFlag,
                InDetails, OutDetails, InLocation, OutLocation,
            } = row.original;

            return (
                <div className="flex items-center gap-2">
                    <div className="flex flex-wrap gap-1 min-w-25">
                        {HolidayFlag && <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200">Holiday</Badge>}
                        {WeekendFlag && <Badge className="bg-indigo-50 text-indigo-700 border-indigo-200">Weekend</Badge>}

                        {AbsentFlag && (
                            <Badge variant="secondary" className="bg-gray-100 text-gray-700 border-gray-300">
                                Absent
                            </Badge>
                        )}

                        {!AbsentFlag && !HolidayFlag && !WeekendFlag && (
                            <>
                                {!InTimeFlag && (
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger>
                                                <Badge variant="destructive" className="h-5 px-1.5"><Clock className="w-3 h-3"/></Badge>
                                            </TooltipTrigger>
                                            <TooltipContent>Late Login-in {InDetails}</TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                )}

                                {!OutTimeFlag && (
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger>
                                                <Badge variant="destructive" className="h-5 px-1.5"><Clock className="w-3 h-3"/></Badge>
                                            </TooltipTrigger>
                                            <TooltipContent>Early Login-out {OutDetails}</TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                )}

                                {InLocationFlag === false && (
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger>
                                                <Badge variant="outline" className="h-5 px-1.5 border-orange-500 text-orange-600">
                                                    <MapPin className="w-3 h-3"/>
                                                </Badge>
                                            </TooltipTrigger>
                                            <TooltipContent>Login Location: {InLocation}</TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                )}

                                {OutLocationFlag === false && (
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger>
                                                <Badge variant="outline" className="h-5 px-1.5 border-orange-500 text-orange-600">
                                                    <MapPin className="w-3 h-3"/>
                                                </Badge>
                                            </TooltipTrigger>
                                            <TooltipContent>Logout Location: {OutLocation}</TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                )}
                            </>
                        )}
                    </div>
                </div>
            )

        }
    }
]

type FormSchema = {
    Employee: string;
    DateRange: { from: string, to: string};
}

type Location = {
    Name: string;
    Latitude: number;
    Longitude: number
}

// Helper to get YYYY-MM-DD format of any date
const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
};

//Get the date range of current month
const getCurrentMonthRange = () => {
    const now = new Date();

    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    return {
        from: formatDate(firstDay),
        to: formatDate(lastDay)
    };
}

export default function Attendance() {
    const [formData, setFormData] = useState<FormSchema>({
        Employee: '', 
        DateRange: getCurrentMonthRange(),
    });

    const [data, setData] = useState<Attendance[]>([]);
    const [loading, setLoading] = useState(false);
    const [redirecting, setRedirecting] = useState(false);
    const [error, setError] = useState(null);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [previewLocation, setPreviewLocation] = useState<Location | null>(null);
    const [correctionRow, setCorrectionRow] = useState<Attendance | null>(null);

    const router = useRouter();

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const { Employee, DateRange } = formData;

            const params = new URLSearchParams();
            if (Employee) params.append('employeeCode', Employee);
            if (DateRange.from) params.append('from', DateRange.from);
            if (DateRange.to) params.append('to', DateRange.to);

            const baseUrl = "/api/hr/attendance";

            const url = params.toString() ? `${baseUrl}?${params.toString()}` : baseUrl;
            
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error('Failed to fetch attendance data');
            }

            const result = await response.json();

            setData(result.data);
        } catch (err: any) {
            setError(err.message || "An error occurred");
        } finally {
            setLoading(false);
        }
    }, [formData.Employee, formData.DateRange]);

    //Helper function that triggers when user types something
    const handleInputChange = (field: keyof FormSchema, value: any) => {
        //Update the data in the form object
        setFormData(prev => ({ ...prev, [field]: value }));

        //Clear the error on the field if there was one previously
        if (errors[field]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    }

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const summary = useMemo(() => {
        return data.reduce((acc, curr) => {
            // Count Absents
            if (curr.AbsentFlag) {
                acc.totalAbsents += 1;
            }

            // Count Late Logins/early logout (Only if not a holiday/weekend/absent)
            if (!curr.AbsentFlag && !curr.HolidayFlag && !curr.WeekendFlag) {
                if (!curr.InTimeFlag) acc.totalTime += curr.InTimeDiff;
                if (!curr.OutTimeFlag) acc.totalTime += curr.OutTimeDiff;
            }

            //Count the leaves and their types

            return acc;
        }, { totalAbsents: 0, totalTime: 0});
    }, [data]);

    const correctionTypes = [
        { label: "Adjustment", value: "adjustment", icon: Clock },
        { label: "Leave", value: "leave", icon: UserMinus },
        { label: "Travel", value: "travel", icon: PlaneIcon},
        { label: "Over Time", value: 'over-time', icon: TimerIcon},
    ]

    const onStatusClick = (cell: Cell<any, any>) => {
        setCorrectionRow(cell.row.original);
    }

    const onLocationClick = (cell: Cell<any, any>, type: 'In' | 'Out') => {
        const latKey = `${type}Latitude`;
        const lngKey = `${type}Longitude`;
        const nameKey = `${type}Location`;

        const lat = cell.row.original[latKey];
        const lng = cell.row.original[lngKey];
        const name = cell.row.original[nameKey];

        const location = (lat && lng) 
        ? { Latitude: lat, Longitude: lng, Name: name } as Location 
        : null;
        setPreviewLocation(location);
    }

    const onInLocationClick = (cell: Cell<any, any>) => {
        onLocationClick(cell, 'In')
    }

    const onOutLocationClick = (cell: Cell<any, any>) => {
        onLocationClick(cell, 'Out');
    }

    return (
        <>
            <div className="container mx-auto relative">
                {/* Header Section */}
                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-8">
                    {/* Title and Subtext */}
                    <div className="flex-1">
                        <h1 className="text-3xl font-extrabold tracking-tight">Attendance</h1>
                        <p className="text-sm text-base-content/70">
                        View your or your subordinates' attendance
                        </p>
                    </div>

                    {/* Attendance Summary */}
                    {!loading && data.length > 0 && (
                        <div className="stats stats-vertical sm:stats-horizontal bg-base-100 border border-base-200 shadow-sm">
                            <div className="stat py-2 px-4">
                                <div className="stat-title text-xs uppercase font-bold">Absent</div>
                                <div className="stat-value text-lg text-gray-500">{summary.totalAbsents} days</div>
                            </div>

                            <div className="stat py-2 px-4">
                                <div className="stat-title text-xs uppercase font-bold text-error">Late</div>
                                <div className="stat-value text-lg text-red-500">{summary.totalTime} mins</div>
                            </div>
                        </div>
                    )}

                    {/* Filter Controls Group */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3">
                        <div className="form-control w-full sm:w-72">
                            <label className="label py-1">
                                <span className="label-text-alt font-medium">Employee</span>
                            </label>
                            <SingleDropdown
                                apiUrl="/api/options/workers"
                                inputName="employeeId"
                                placeholder="Select Employee"
                                isStatic={false}
                                showValue
                                widthClass="w-full"
                                onSelect={(selectedOption: DropdownOption | null) => {
                                    handleInputChange("Employee", selectedOption?.value || "");
                                }}
                            />
                        </div>
                        <div className="form-control w-full sm:w-auto">
                            <label className="label py-1">
                                <span className="label-text-alt font-medium">Date Range</span>
                            </label>
                            <DateRangePicker
                                value={formData.DateRange}
                                onChange={(val) => {
                                handleInputChange("DateRange", val || { from: "", to: "" });
                                }}
                            />
                        </div>
                    </div>
                </div>

                {/* Attendance table */}
                <DataTable
                    columns={listColumns}
                    data={data}
                    pageSize={31}
                    isLoading={loading}
                    error={error}
                    showPrint={false}
                    showDownload={false}
                    columnClickHandlers={{
                        status: onStatusClick,
                        InLocation: onInLocationClick,
                        OutLocation: onOutLocationClick,
                    }}
                />
            </div>

            {/* The detailed status of an attendance */}
            <Dialog open={!!correctionRow} onOpenChange={() => setCorrectionRow(null)}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Apply for Correction</DialogTitle>
                        <DialogDescription>
                            Select the type of correction for {correctionRow?.Date ? new Date(correctionRow.Date).toLocaleDateString('en-PK', { day: '2-digit', month: 'short' }) : ''}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid grid-cols-1 gap-3 py-4">
                        {correctionTypes.map((type) => {
                            const Icon = type.icon;
                            const employeeCode = formData.Employee;
                            const date = correctionRow?.Date;
                            const dateStr = date ? new Date(date).toISOString().split('T')[0] : null;
                            const correctionType = type.value;

                            return (
                                <button
                                    key={type.value}
                                    className="flex items-center gap-4 p-4 rounded-xl border border-base-300 hover:border-primary hover:bg-primary/5 transition-all group text-left cursor-pointer"
                                    onClick={() => {
                                        router.push(`/hr/attendance/correction/add?date=${dateStr}&type=${correctionType}&employee=${employeeCode}`);
                                        setCorrectionRow(null);
                                    }}
                                >
                                    <div className="p-2 rounded-lg bg-base-200 group-hover:bg-primary group-hover:text-primary-foreground">
                                        <Icon className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-sm">{type.label}</p>
                                        <p className="text-xs text-base-content/60">Request correction for this record</p>
                                    </div>
                                </button>
                            )
                        })}
                    </div>
                </DialogContent>
            </Dialog>

            {/* The location previous dialog */}
            <LocationPreview
                location={previewLocation}
                onClose={() => setPreviewLocation(null)}
            />
        </>
    )
}