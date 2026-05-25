"use client";

import React, { useState } from "react";
import { FileUp, FileText, X } from "lucide-react";

interface FileUploadProps {
    file: File | null;
    onFileChange: (file: File | null) => void;
    accept?: string;
    maxSizeMB?: number;
    subText?: string;   //For the file type line
    helperText?: string;
}

interface FileUploadCompactProps {
    file: File | null;
    onFileChange: (file: File | null) => void;
    accept?: string;
    disabled?: boolean;
}

export const FileUpload = ({
    file,
    onFileChange,
    accept = ".csv, .xlsx",
    maxSizeMB = 10,
    subText = "CSV or XLSX",
    helperText,
}: FileUploadProps) => {
    const [isDragging, setIsDragging] = useState(false);

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") setIsDragging(true);
        else if (e.type === "dragleave") setIsDragging(false);
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();

        setIsDragging(false);

        const droppedFile = e.dataTransfer.files?.[0];
        if (droppedFile) onFileChange(droppedFile);
    }

    // When a file is already selected
    if (file) {
        return (
            <div className="flex items-center justify-between p-4 bg-base-200 rounded-lg border border-primary/20 animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center gap-4">
                    <div className="p-2 bg-primary/10 rounded-md">
                        <FileText className="text-primary" />
                    </div>
                    <div>
                        <p className="text-sm font-bold truncate max-w-50">{file.name}</p>
                        <p className="text-xs opacity-60">{(file.size / 1024).toFixed(2)} KB</p>
                    </div>
                </div>
                <button
                    type="button"
                    onClick={() => onFileChange(null)}
                    className="btn btn-ghost btn-sm btn-circle text-error"
                >
                    <X size={20} />
                </button>
            </div>
        )
    }

    //When there is no selected file
    return (
        <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className="w-full"
        >
            <label
                className={`flex flex-col items-center justify-center w-full h-44 border-2 border-dashed rounded-lg cursor-pointer transition-all 
                    ${isDragging 
                        ? "border-primary bg-primary/5 scale-[1.01]" 
                        : "border-base-300 bg-base-200/50 hover:bg-base-200 group"
                    }`}
            >
                <div className="flex flex-col items-center justify-center pt-5 pb-6 px-4 text-center">
                    <FileUp className={`w-10 h-10 mb-3 transition-colors ${isDragging ? "text-primary" : "text-base-content/30 group-hover:text-primary"}`} />
                    <p className="text-sm"><span className="font-bold">Click to upload</span> or drag and drop</p>
                    <p className="text-xs opacity-60 mt-1">{subText} (Max {maxSizeMB}MB)</p>
                    {helperText && (
                        <div className="mt-2">
                            <p className="text-[10px] opacity-40 leading-tight max-w-sm uppercase font-semibold">Required Columns:</p>
                            <p className="text-[10px] opacity-50 leading-tight max-w-sm">{helperText}</p>
                        </div>
                    )}
                </div>
                <input
                    type="file"
                    className="hidden"
                    accept={accept}
                    onChange={(e) => onFileChange(e.target.files?.[0] || null)}
                />
            </label>
        </div>
    )
}

export const FileUploadCompact = ({
    file,
    onFileChange,
    accept,
    disabled = false,
}: FileUploadCompactProps) => {

    if (file) {
        return (
            <div className="flex items-center gap-2 text-xs">
                <FileText className="w-4 h-4 text-primary shrink-0" />
                <span className="truncate max-w-[120px] opacity-70">{file.name}</span>
                {!disabled && (
                    <button type="button" onClick={() => onFileChange(null)} className="text-error hover:opacity-70 shrink-0">
                        <X size={14} />
                    </button>
                )}
            </div>
        );
    }

    return (
        <label className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded border border-dashed border-base-300 cursor-pointer hover:border-primary hover:text-primary transition-colors ${disabled ? 'opacity-40 pointer-events-none' : ''}`}>
            <FileUp className="w-3 h-3" />
            <span>Choose file</span>
            <input type="file" className="hidden" accept={accept} disabled={disabled} onChange={(e) => onFileChange(e.target.files?.[0] || null)} />
        </label>
    );
}
