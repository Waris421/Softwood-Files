'use client';

import { useEffect } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/_components/ui/card";
import { Info } from "lucide-react";
import { Button } from "../ui/button";
import { THEME } from "../constants/ui";

interface MessageBoxProps {
    subject: string;
    message: string;
    onConfirm: () => void;
    confirmText: string;
}

const MessageBox = ({
    subject,
    message,
    onConfirm,
    confirmText
}: MessageBoxProps) => {
    
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Enter') {
                onConfirm();
            }
        };

        //Create an event listener that fires the onconfirm function when user presses enter key
        window.addEventListener('keydown', handleKeyDown);

        // Clean up the listener when the component unmounts
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [onConfirm]);

    return (
        <Card className="w-full max-w-md shadow-lg border-l-4 border-l-primary">
            <CardHeader className="flex flex-row items-center gap-4">
                <div className="p-2 bg-primary/10 rounded-full">
                    <Info className="w-5 h-5 text-primary" />
                </div>
                <CardTitle className="text-xl font-bold">{subject}</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">
                    {message}
                </p>
            </CardContent>
            <CardFooter className="justify-end">
                <Button
                    onClick={onConfirm}
                    className={THEME.ButtonSecondary}
                >
                    {confirmText}
                </Button>
            </CardFooter>
        </Card>
    )
}

export default MessageBox;