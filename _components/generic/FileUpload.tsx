"use client";

import React, { useState } from "react";
import { FileUp, FileText, X, Upload } from "lucide-react";
import { cn } from "./utils";

interface FileUploadProps {
    file: File | null;
    onFileChange: (file: File | null) => void;
    accept?: string;
    maxSizeMB?: number;
    subText?: string;   //For the file type line
    helperText?: string;
    className?: string;
    disabled?: boolean;
}

export const FileUpload = ({
    file,
    onFileChange,
    accept = ".csv, .xlsx",
    maxSizeMB = 10,
    subText = "CSV or XLSX",
    helperText,
    className,
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
                className={cn(
                    "flex flex-col items-center justify-center w-full h-44 border-2 border-dashed rounded-lg cursor-pointer transition-all",
                    isDragging 
                        ? "border-primary bg-primary/5 scale-[1.01]" 
                        : "border-base-300 bg-base-200/50 hover:bg-base-200 group",
                    className
                )}
            >
                <div className="flex flex-col items-center justify-center pt-5 pb-6 px-4 text-center">
                    <FileUp className={cn(
                        "w-10 h-10 mb-3 transition-colors",
                        isDragging ? "text-primary" : "text-base-content/30 group-hover:text-primary"
                    )} />
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
  accept = ".csv, .xlsx",
  className,
  disabled = false,
}: FileUploadProps) => {
    const [isDragging, setIsDragging] = useState(false);

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (disabled) return;

        if (e.type === "dragenter" || e.type === "dragover") setIsDragging(true);
        else if (e.type === "dragleave") setIsDragging(false);
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (disabled) return;

        const droppedFile = e.dataTransfer.files?.[0];
        if (droppedFile) onFileChange(droppedFile);
    }

    if (file) {
        return (
            <div className={cn(
                "flex items-center justify-between gap-2 p-1.5 pl-3 bg-base-200 border border-primary/20 rounded-md animate-in fade-in slide-in-from-top-1 duration-200",
                disabled && "opacity-60 grayscale-[0.5]",
                className
            )}
            >
                <div className="flex items-center gap-2 min-w-0">
                    <FileText size={14} className={cn("shrink-0", disabled ? "text-base-content/40" : "text-primary")} />
                    <span className="text-xs font-medium truncate max-w-60">
                        {file.name}
                    </span>
                    {!disabled && (
                        <button
                            type="button"
                            onClick={() => onFileChange(null)}
                            className="btn btn-ghost btn-xs btn-circle text-error"
                        >
                            <X size={14} />
                        </button>
                    )}
                </div>
            </div>
        )
    }

    return (
        <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={cn("w-full", className)}
        >
            <label
                className={cn(
                    "group flex items-center justify-center gap-2 h-9 px-3 border border-secondary-content rounded-md transition-all",
                    disabled 
                        ? "cursor-not-allowed border-base-300 bg-base-200 opacity-60" 
                        : "cursor-pointer hover:brightness-80",
                    !disabled && isDragging && "border-primary bg-primary/5"
                )}
            >
                <Upload 
                    size={14}
                    className={cn(
                        "transition-colors", 
                        !disabled && isDragging ? "text-primary" : "text-base-content/40",
                        !disabled && "group-hover:text-primary"
                    )}
                />
                <span className="text-xs font-medium text-base-content/60 group-hover:text-base-content">
                    {!disabled && <span className="font-bold">Click to upload</span>}
                    {disabled ? "Upload disabled" : " or drag and drop"}
                </span>
                <input
                    type="file"
                    className="hidden"
                    accept={accept}
                    disabled={disabled}
                    onChange={(e) => onFileChange(e.target.files?.[0] || null)}
                />
            </label>
        </div>
    )
}