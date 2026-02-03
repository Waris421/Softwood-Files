import { AlertCircle } from "lucide-react";
import { THEME } from "../constants/ui";


//Helper function to generate an error element on an input
const ErrorLabel = ({ message }: { message?: string }) => {
    if (!message) return null;
    return (
        <label className="label py-1">
            <span className={THEME.ErrorText}>
                <AlertCircle size={14} /> {message}
            </span>
        </label>
    )
}

//Helper function to generate a form field
export const FormField = ({ label, error, required, children }: any) => (
    <div className="form-control w-full">
        <label className="label font-semibold text-sm">
            {label}{required && <span className="text-error ml-1">*</span>}
        </label>
        {children}
        <ErrorLabel message={error} />
    </div>
);