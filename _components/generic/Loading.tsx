import { Loader2 } from "lucide-react";

export default function LoadingIcon() {
    return (
        <div className="flex flex-col items-center justify-center p-20 gap-4">
            <Loader2 className="animate-spin text-primary" size={40} />
            <p className="text-sm font-medium">Loading...</p>
        </div>
    )
}