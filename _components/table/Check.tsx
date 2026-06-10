import { AlertCircle, CheckCircle2 } from "lucide-react"

type Props = {
    check: boolean,
    helpText?: string,
}

export default function CheckDisplay({check, helpText}: Props) {
    const content = (
        <>
            {check ? (
                <div className="flex items-center gap-2 py-1.5 px-4 rounded-full 
                    bg-amber-500/10 border border-amber-500/30 
                    text-amber-400 backdrop-blur-md shadow-lg shadow-amber-500/10
                    font-semibold text-sm transition-all"
                >
                    <AlertCircle size={14} className="stroke-[2.5px]" />
                    <span>Pending</span>
                </div>
            ) : (
                <div className="flex items-center gap-2 py-1.5 px-4 rounded-full 
                    bg-emerald-500/10 border border-emerald-500/30 
                    text-emerald-400 backdrop-blur-md shadow-lg shadow-emerald-500/10
                    font-semibold text-sm transition-all"
                >
                    <CheckCircle2 size={14} className="stroke-[2.5px]" />
                    <span>Received</span>
                </div>
            )}
        </>
    )

    if (helpText) {
        return (
            <div className="flex justify-center">
                <div 
                    className="tooltip tooltip-bottom cursor-help" 
                    data-tip={helpText}
                >
                    {content}
                </div>
            </div>
        )
    }

    return <div className="flex justify-center">{content}</div>
}