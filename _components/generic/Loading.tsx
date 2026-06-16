import { Loader } from "lucide-react";

export default function LoadingIcon() {
    return (
        <div className="flex flex-col items-center justify-center p-20 gap-4">
            <Loader className="animate-spin animation-duration-[2.5s] text-primary" size={40} />
            <p className="text-sm font-medium">Loading...</p>
        </div>
    )
}