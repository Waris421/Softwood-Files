'use client';

import { useEffect } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/_components/ui/card";
import { AlertTriangle, CheckCircle2, Info, XCircle } from "lucide-react";
import { Button } from "../ui/button";
import { THEME } from "../constants/ui";
import { cn } from "./utils";

interface WarningBoxProps {
    subject: string;
    message: string;
    onConfirm: () => void;
    onReject: () => void;
    confirmText: string;
    rejectText: string;
}

const WarningBox = ({
    subject,
    message,
    onConfirm,
    onReject,
    confirmText,
    rejectText
}: WarningBoxProps) => {
    
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Enter') {
                onConfirm();
            } else if (event.key === 'Escape') {
                onReject();
            }
        };

        //Create an event listener that fires the corresponding function when user hit the key
        //Enter fires the onConfirm function.
        //Escape fires the onReject function
        window.addEventListener('keydown', handleKeyDown);

        // Clean up the listener when the component unmounts
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [onConfirm, onReject]);

    return (
        <Card className="w-full max-w-md shadow-lg border-l-4 border-l-primary">
            <CardHeader className="flex flex-row items-center gap-4">
                <div className="p-2 bg-yellow-100 rounded-full">
                    <AlertTriangle className="w-5 h-5 text-yellow-600" />
                </div>
                <CardTitle className="text-xl font-bold">{subject}</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">
                    {message}
                </p>
            </CardContent>
            <CardFooter className="flex justify-end gap-3 pt-2">
                <Button
                    onClick={onReject}
                    variant="ghost"
                    className={cn(THEME.ButtonBasic, "flex items-center gap-2")}
                >
                    <XCircle className="w-4 h-4" />
                    {rejectText}
                </Button>
                <Button
                    onClick={onConfirm}
                    className={cn(THEME.ButtonSecondary, "flex items-center gap-2 shadow-sm")}
                >
                    <CheckCircle2 className="w-4 h-4" />
                    {confirmText}
                </Button>
            </CardFooter>
        </Card>
    )
}

export default WarningBox;