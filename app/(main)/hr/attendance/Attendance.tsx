'use client';

import { DateRangePicker } from "@/_components/Datepicker/Datepicker";
import LocationPreview from "@/_components/DialogBox/LocationPreview";
import { SingleDropdownAsync } from "@/_components/Dropdown/Dropdown";
import { DropdownOption } from "@/_components/Dropdown/types";
import { DataTable } from "@/_components/table/Table";
import { Badge } from "@/_components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/_components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/_components/ui/tooltip";
import { Cell, ColumnDef } from "@tanstack/react-table";
import { AlertCircle, Check, Clock, MapPin, PlaneIcon, RefreshCcwDot, TimerIcon, UserMinus, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState, useMemo } from "react";
import { CorrectionDialog } from "./StatusClickDialog";
import { EditAdjustmentModal } from "./EditAdjustment";
import { THEME } from "@/_components/constants/ui";
import { cn } from "@/_components/generic/utils";
import { EditLeaveModal } from "./EditLeave";

type Attendance = {
    //Main attendance flags
    Date: Date,
    InDetails: string | null,
    InLatitude: number | null,
    InLocation: string | null,
    InLocationFlag: boolean | null,
    InLongitude: number | null,
    InTime: string | null,
    InTimeDiff: number | null,
    InTimeFlag: boolean | null,
    OutDetails: string | null,
    OutLatitude: number | null,
    OutLocation: string | null,
    OutLocationFlag: boolean | null,
    OutLongitude: number | null,
    OutTime: string | null,
    OutTimeDiff: number | null,
    OutTimeFlag: boolean | null,
    WeekendFlag: boolean | null,
    HolidayFlag: boolean | null,
    AbsentFlag: boolean | null,
    FullLeaveFlag: boolean,
    OverTime: number | null,

    //In Time Adjustment
    InTimeAdjustmentId: number | null,
    InTimeAdjustmentApproval: boolean | null,
    InTImeAdjustmentReason: string | null,
    InTimeAdjustmentComments: string | null,

    //In Location Adjustments
    InLocationAdjustmentId: number | null,
    InLocationAdjustmentApproval: boolean | null,
    InLocationAdjustmentReason: string | null,
    InLocationAdjustmentComments: string | null,

    //Out Time Adjustmnet
    OutTimeAdjustmentId: number | null,
    OutTimeAdjustmentApproval: boolean | null,
    OutTImeAdjustmentReason: string | null,
    OutTimeAdjustmentComments: string | null,

    //Out Location Adjustments
    OutLocationAdjustmentId: number | null,
    OutLocationAdjustmentApproval: boolean | null,
    OutLocationAdjustmentReason: string | null,
    OutLocationAdjustmentComments: string | null,

    FullLeaveAdjustmentId: number|null,
    FullLeaveType: string|null, 
    FullLeaveAdjustmentApproval: boolean | null
    FullLeaveAdjustmentManagerComments: string | null,
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
                FullLeaveFlag,
            } = row.original;

            const isComplete = WeekendFlag || HolidayFlag || FullLeaveFlag || (InLocationFlag && InTimeFlag && OutLocationFlag && OutTimeFlag);
            const isSpecialDay = WeekendFlag || HolidayFlag;
            
            return (
                <div className="flex justify-center">
                    {AbsentFlag ? (
                        // Distinct styling for Absent status
                        <span className={THEME.Text.AmberText}>
                            <UserMinus className="w-5 h-5" strokeWidth={3} />
                        </span>
                    ) : isComplete ? (
                        <span className="text-success text-xl">
                            <Check 
                                className={`${isSpecialDay ? THEME.Text.BlueText : THEME.Text.GreenText} w-5 h-5`}
                                strokeWidth={3} 
                            />
                        </span>
                    ) : (
                        <span className="text-error text-xl">
                            <X 
                                className={cn("w-5 h-5", THEME.Text.RedText)}
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
        cell: ({ row, getValue }) => {
            const dateValue = getValue<string>();
            const { FullLeaveAdjustmentId, FullLeaveAdjustmentApproval, FullLeaveAdjustmentManagerComments } = row.original;

            if (!dateValue) return '---';

            //dd-mmm format
            const date = new Date(dateValue);
            const formattedDate = new Intl.DateTimeFormat('en-GB', {
                day: '2-digit',
                month: 'short',
            }).format(date).replace(' ', '-');

            return (
                <div className="flex items-center gap-1.5">
                    <span>{formattedDate}</span>
                    {FullLeaveAdjustmentId && (
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <span className="cursor-help flex items-center">
                                        {FullLeaveAdjustmentApproval === null && (
                                            <span className={THEME.Text.AmberText}>
                                                <AlertCircle className="w-4 h-4" />
                                            </span>
                                        )}
                                        {FullLeaveAdjustmentApproval === true && (
                                            <span className={THEME.Text.GreenText}>
                                                <Check className="w-4 h-4" strokeWidth={3} />
                                            </span>
                                        )}
                                        {FullLeaveAdjustmentApproval === false && (
                                            <span className={THEME.Text.RedText}>
                                                <X className="w-4 h-4" strokeWidth={3} />
                                            </span>
                                        )}
                                    </span>
                                </TooltipTrigger>
                                <TooltipContent>
                                    {FullLeaveAdjustmentApproval === null && "Leave approval pending"}
                                    {FullLeaveAdjustmentApproval === true && "Leave approved"}
                                    {FullLeaveAdjustmentApproval === false && `Leave rejected. Reason: ${FullLeaveAdjustmentManagerComments}`}
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    )}
                </div>
            )

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
        cell: ({ row }) => {
            const { InTime, InTimeAdjustmentId, InTimeAdjustmentApproval, InTimeAdjustmentComments } = row.original;

            if (!InTime && !InTimeAdjustmentId) return '-';

            return (
                <div className="flex items-center gap-1.5">
                    <span>{InTime || '---'}</span>
                    {InTimeAdjustmentId && (
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <span className="cursor-help flex items-center">
                                        {InTimeAdjustmentApproval === null && (
                                            <span className={THEME.Text.AmberText}>
                                                <AlertCircle className="w-4 h-4" />
                                            </span>
                                        )}
                                        {InTimeAdjustmentApproval === true && (
                                            <span className={THEME.Text.GreenText}>
                                                <Check className="w-4 h-4" strokeWidth={3} />
                                            </span>
                                        )}
                                        {InTimeAdjustmentApproval === false && (
                                            <span className={THEME.Text.RedText}>
                                                <X className="w-4 h-4" strokeWidth={3} />
                                            </span>
                                        )}
                                    </span>
                                </TooltipTrigger>
                                <TooltipContent>
                                    {InTimeAdjustmentApproval === null && "Adjustment approval pending"}
                                    {InTimeAdjustmentApproval === true && `Adjustment approved.`}
                                    {InTimeAdjustmentApproval === false && `Adjustment rejected. Reason: ${InTimeAdjustmentComments}`}
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    )}
                </div>
            )
        },
    },

    {
        accessorKey:'InLocation',
        header: 'In Location',
        cell: ({ row }) => {
            const { InLocation, InLocationAdjustmentId, InLocationAdjustmentApproval, InLocationAdjustmentComments } = row.original;
            if (!InLocation && !InLocationAdjustmentId) return '-';

            return (
                <div className="flex items-center gap-1.5">
                    <span>{InLocation || '---'}</span>
                    {InLocationAdjustmentId && (
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <span className="cursor-help flex items-center">
                                        {InLocationAdjustmentApproval === null && (
                                            <span className={THEME.Text.AmberText}>
                                                <AlertCircle className="w-4 h-4" />
                                            </span>
                                        )}
                                        {InLocationAdjustmentApproval === true && (
                                            <span className={THEME.Text.GreenText}>
                                                <Check className="w-4 h-4" strokeWidth={3} />
                                            </span>
                                        )}
                                        {InLocationAdjustmentApproval === false && (
                                            <span className={THEME.Text.RedText}>
                                                <X className="w-4 h-4" strokeWidth={3} />
                                            </span>
                                        )}
                                    </span>
                                </TooltipTrigger>
                                <TooltipContent>
                                    {InLocationAdjustmentApproval === null && "Adjustment approval pending"}
                                    {InLocationAdjustmentApproval === true && "Adjustment approved"}
                                    {InLocationAdjustmentApproval === false && `Adjustment rejected. Reason: ${InLocationAdjustmentComments}`}
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    )}
                </div>
            )
        }
    },

    {
        accessorKey:'OutTime',
        header: 'Out Time',
        cell: ({ row}) => {
            const { OutTime, OutTimeAdjustmentId, OutTimeAdjustmentApproval, OutTimeAdjustmentComments } = row.original;

            if (!OutTime && !OutTimeAdjustmentId) return '-';

            return (
                <div className="flex items-center gap-1.5">
                    <span>{OutTime || '---'}</span>
                    {OutTimeAdjustmentId && (
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <span className="cursor-help flex items-center">
                                        {OutTimeAdjustmentApproval === null && (
                                            <span className={THEME.Text.AmberText}>
                                                <AlertCircle className="w-4 h-4" />
                                            </span>
                                        )}
                                        {OutTimeAdjustmentApproval === true && (
                                            <span className={THEME.Text.GreenText}>
                                                <Check className="w-4 h-4" strokeWidth={3} />
                                            </span>
                                        )}
                                        {OutTimeAdjustmentApproval === false && (
                                            <span className={THEME.Text.RedText}>
                                                <X className="w-4 h-4" strokeWidth={3} />
                                            </span>
                                        )}
                                    </span>
                                </TooltipTrigger>
                                <TooltipContent>
                                    {OutTimeAdjustmentApproval === null && "Adjustment approval pending"}
                                    {OutTimeAdjustmentApproval === true && "Adjustment approved"}
                                    {OutTimeAdjustmentApproval === false && `Adjustment rejected. Reason: ${OutTimeAdjustmentComments}`}
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    )}
                </div>
            )
        }
    },

    {
        accessorKey:'OutLocation',
        header: 'Out Location',
        cell: ({ row }) => {
            const { OutLocation, OutLocationAdjustmentId, OutLocationAdjustmentApproval, OutLocationAdjustmentComments } = row.original;
            if (!OutLocation && !OutLocationAdjustmentId) return '-';

            return (
                <div className="flex items-center gap-1.5">
                    <span>{OutLocation || '---'}</span>
                    {OutLocationAdjustmentId && (
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <span className="cursor-help flex items-center">
                                        {OutLocationAdjustmentApproval === null && (
                                            <span className={THEME.Text.AmberText}>
                                                <AlertCircle className="w-4 h-4" />
                                            </span>
                                        )}
                                        {OutLocationAdjustmentApproval === true && (
                                            <span className={THEME.Text.GreenText}>
                                                <Check className="w-4 h-4" strokeWidth={3} />
                                            </span>
                                        )}
                                        {OutLocationAdjustmentApproval === false && (
                                            <span className={THEME.Text.RedText}>
                                                <X className="w-4 h-4" strokeWidth={3} />
                                            </span>
                                        )}
                                    </span>
                                </TooltipTrigger>
                                <TooltipContent>
                                    {OutLocationAdjustmentApproval === null && "Adjustment approval pending"}
                                    {OutLocationAdjustmentApproval === true && "Adjustment approved"}
                                    {OutLocationAdjustmentApproval === false && `Adjustment rejected. Reason: ${OutLocationAdjustmentComments}`}
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    )}
                </div>
            );
        }
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
                WeekendFlag, HolidayFlag, AbsentFlag, FullLeaveFlag, FullLeaveType,
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

                        {FullLeaveFlag && (
                            <Badge className="bg-purple-50 text-purple-700 border-purple-200">
                                {FullLeaveType || 'Leave'}
                            </Badge>
                        )}

                        {!AbsentFlag && !HolidayFlag && !FullLeaveFlag && !WeekendFlag && (
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
    const [error, setError] = useState(null);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [previewLocation, setPreviewLocation] = useState<Location | null>(null);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const [correctionRow, setCorrectionRow] = useState<Attendance | null>(null);
    const [adjustmentId, setAdjustmentId] = useState<number | null>(null);
    const [leaveAdjId, setLeaveAdjId] = useState<number | null>(null);

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
                const errorData = await response.json();
                throw new Error(errorData.details?.message || "Failed to fetch attendance data");
            }

            const result: {data: Attendance[]} = await response.json();
            setData(result.data);
        } catch (err: any) {
            setError(err.message || "An error occurred");
        } finally {
            setLoading(false);
        }
    }, [formData.Employee, formData.DateRange, refreshTrigger]);

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
                if (!curr.InTimeFlag) acc.totalTime += (curr.InTimeDiff || 0);
                if (!curr.OutTimeFlag) acc.totalTime += (curr.OutTimeDiff || 0);
            }

            //Count the leaves and their types

            return acc;
        }, { totalAbsents: 0, totalTime: 0});
    }, [data]);

    const onStatusClick = (cell: Cell<any, any>) => {
        setCorrectionRow(cell.row.original);
    }

    const onDateClick = (cell: Cell<any, any>) => {
        const { FullLeaveAdjustmentApproval, FullLeaveAdjustmentId } = cell.row.original;

        if (FullLeaveAdjustmentId === null || FullLeaveAdjustmentApproval !== null) return;
        
        setLeaveAdjId(FullLeaveAdjustmentId);
    }

    const onInTimeClick = (cell: Cell<any, any>) => {
        const { InTimeAdjustmentId, InTimeAdjustmentApproval } = cell.row.original;
        
        if (InTimeAdjustmentId === null || InTimeAdjustmentApproval !== null) return;

        setAdjustmentId(InTimeAdjustmentId);
    }

    const onOutTimeClick = (cell: Cell<any, any>) => {
        const { OutTimeAdjustmentId, OutTimeAdjustmentApproval } = cell.row.original;

        if (OutTimeAdjustmentId === null || OutTimeAdjustmentApproval !== null) return;
        
        setAdjustmentId(OutTimeAdjustmentId);
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
        const { InLocationAdjustmentId, InLocationAdjustmentApproval } = cell.row.original;

        if (InLocationAdjustmentId !== null && InLocationAdjustmentApproval === null) {
            setAdjustmentId(InLocationAdjustmentId);
            return ;
        }

        onLocationClick(cell, 'In')
    }

    const onOutLocationClick = (cell: Cell<any, any>) => {
        const { OutLocationAdjustmentId, OutLocationAdjustmentApproval } = cell.row.original;

        if (OutLocationAdjustmentId !== null && OutLocationAdjustmentApproval === null) {
            setAdjustmentId(OutLocationAdjustmentId);
            return ;
        }

        onLocationClick(cell, 'Out');
    }

    return (
        <>
            <div className="container mx-auto relative">
                {/* Header Section */}
                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-8">
                    {/* Title and Subtext */}
                    <div className="flex-1">
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-extrabold tracking-tight">Attendance</h1>
                            <button
                                onClick={() => setRefreshTrigger(prev => prev+1)}
                                disabled={loading}
                                className={THEME.ButtonOutLine}
                                title="Refresh Attendance"
                            >
                                <RefreshCcwDot className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                            </button>
                        </div>
                        <p className="text-sm text-base-content/70">
                        View your or your subordinates' attendance
                        </p>
                    </div>

                    {/* Attendance Summary */}
                    {!loading && data.length > 0 && (
                        <div className="stats stats-vertical sm:stats-horizontal bg-base-100 border border-base-200 rounded-lg shadow-sm">
                            <div className="stat py-2 px-4">
                                <div className="stat-title text-xs uppercase font-bold">Absent</div>
                                <div className={cn("stat-value text-lg", THEME.Text.GrayText)}>{summary.totalAbsents} days</div>
                            </div>

                            <div className="stat py-2 px-4">
                                <div className="stat-title text-xs uppercase font-bold text-error">Late</div>
                                <div className={cn("stat-value text-lg", THEME.Text.RedText)}>{summary.totalTime} mins</div>
                            </div>
                        </div>
                    )}

                    {/* Filter Controls Group */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3">
                        <div className="form-control w-full sm:w-72">
                            <label className="label py-1">
                                <span className="label-text-alt font-medium">Employee</span>
                            </label>
                            <SingleDropdownAsync
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
                        Date: onDateClick,
                        InTime: onInTimeClick,
                        OutTime: onOutTimeClick,
                        InLocation: onInLocationClick,
                        OutLocation: onOutLocationClick,
                    }}
                />
            </div>

            {/* The detailed status of an attendance */}
            <CorrectionDialog 
                correctionRow={correctionRow}
                onClose={() => setCorrectionRow(null)}
                employeeCode={formData.Employee}
            />

            <EditAdjustmentModal
                adjustmentId = {adjustmentId}
                onClose={() => setAdjustmentId(null)}
                onSuccess={() => setRefreshTrigger(prev => prev + 1)}
            />

            <EditLeaveModal
                adjustmentId = {leaveAdjId}
                onClose={() => setLeaveAdjId(null)}
                onSuccess={() => setRefreshTrigger(prev => prev + 1)}
            />

            {/* The location previous dialog */}
            <LocationPreview
                location={previewLocation}
                onClose={() => setPreviewLocation(null)}
            />
        </>
    )
}