import { Loader } from "lucide-react";
import { cn } from "./utils";

interface LoadingIconProps {
    size?: number;
    className?: string;
}

export default function LoadingIcon({
    size = 40,
    className,
}: LoadingIconProps) {
    return (
        <div className="flex flex-col items-center justify-center p-4 gap-2">
            <Loader
                className={cn("animate-spin text-primary", className)}
                size={size}
            />
            <p className="text-sm font-medium">Loading...</p>
        </div>
    )
}