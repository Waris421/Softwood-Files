'use client';

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/_components/ui/dialog";
import { Clock, PlaneIcon, TimerIcon, UserMinus } from "lucide-react";
import { useRouter } from "next/navigation";

interface CorrectionDialogProps {
    correctionRow: any;
    onClose: () => void;
    employeeCode: string;
}

const correctionTypes = [
    { label: "Adjustment", value: "adjustment", icon: Clock },
    { label: "Leave", value: "leave", icon: UserMinus },
    { label: "Travel", value: "travel", icon: PlaneIcon},
    { label: "Over Time", value: 'over-time', icon: TimerIcon},
]

export const CorrectionDialog = ({
    correctionRow,
    onClose,
    employeeCode,
}: CorrectionDialogProps) => {
    const router = useRouter();

    return (
        <Dialog open={!!correctionRow} onOpenChange={onClose}>
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
                        const date = correctionRow?.Date;
                        const dateStr = date ? new Date(date).toLocaleDateString('en-PK') : null;
                        const correctionType = type.value;

                        return (
                            <button
                                key={type.value}
                                className="flex items-center gap-4 p-4 rounded-xl border border-base-300 hover:border-primary hover:bg-primary/5 transition-all group text-left cursor-pointer"
                                onClick={() => {
                                    router.push(`/hr/attendance/correction/add?date=${dateStr}&type=${correctionType}&employee=${employeeCode}`);
                                    onClose();
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
                        );
                    })}
                </div>
            </DialogContent>
        </Dialog>
    );
}