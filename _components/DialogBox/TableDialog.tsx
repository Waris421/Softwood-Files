'use client';

import React, { useEffect, useState } from 'react';
import { X, Copy, CopyCheck } from 'lucide-react';

interface TableDialogProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    data: any[];
    anchorRef?: React.RefObject<HTMLElement>;
    maxWidth?: number;
}

const TableDialog: React.FC<TableDialogProps> = ({
    isOpen, onClose, title, data, anchorRef, maxWidth
}) => {
    const [style, setStyle] = useState<React.CSSProperties>({ visibility: 'hidden' });
    const [copied, setCopied] = useState(false);
    
    const headers = data.length > 0 ? Object.keys(data[0]) : [];

    useEffect(() => {
        if (isOpen && anchorRef?.current) {
            const rect = anchorRef.current.getBoundingClientRect();
            
            // Constants
            const ROW_HEIGHT = 33;
            const HEADER_AND_PADDING = 80;
            const DIALOG_WIDTH = maxWidth ? maxWidth : 320;
            const VIEWPORT_MARGIN = 16;

            //Estimate height based on provided data
            const rowCount = Object.keys(data).length;
            const estimatedHeight = (rowCount * ROW_HEIGHT) + HEADER_AND_PADDING;

            //Horizontal logic
            let left = rect.left + window.scrollX;
            if (left + DIALOG_WIDTH > window.innerWidth + window.scrollX) {
                left = window.innerWidth + window.scrollX - DIALOG_WIDTH - VIEWPORT_MARGIN;
            }
            left = Math.max(VIEWPORT_MARGIN, left);

            //Vertial logic
            const spaceBelow = window.innerHeight - rect.bottom;
            const shouldShowAbove = spaceBelow < estimatedHeight && rect.top > estimatedHeight;

            let top: string;
            if (shouldShowAbove) {
                top = `${rect.top + window.scrollY - 80}px`;
            } else {
                top = `${rect.bottom + window.scrollY - 100}px`;
            }

            setStyle({
                position: 'absolute',
                top: top,
                left: `${left}px`,
                visibility: 'visible',
                transform: shouldShowAbove ? 'translateY(-100%)' : 'none',
                zIndex: 100,
                width: `${DIALOG_WIDTH}px`,
            });
        }
    }, [isOpen, anchorRef, data, maxWidth])

    const handleCopy = async () => {
        //Convert the data to tsv format and copy to clipboard
        if (data.length === 0) return;

        const headerRow = headers.join('\t');
        const rows = data.map(row => 
            headers.map(header => row[header]?.toString() || '').join('\t')
        ).join('\n');

        const fullText = `${headerRow}\n${rows}`;

        // Modern API approach, used for secure modern browsers
        if (navigator.clipboard && window.isSecureContext) {
            try {
                await navigator.clipboard.writeText(fullText);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
                return;
            } catch (err) {
                console.error('Modern copy failed, falling back...', err);
                setCopied(false);
            }
        }

        // Fallback approach for non-secure contexts (e.g. testing via IP address)
        try {
            const textArea = document.createElement("textarea");
            textArea.value = fullText;

            textArea.style.position = "fixed";
            textArea.style.left = "-9999px";
            textArea.style.top = "0";
            document.body.appendChild(textArea);

            textArea.focus();
            textArea.select();

            const successful = document.execCommand('copy');
            document.body.removeChild(textArea);

            if (successful) {
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            }
        } catch (err) {
            console.error('Fallback copy failed: ', err);
            setCopied(false);
        }
    }

    if (!isOpen) return null;

    return (
        <div className="absolute inset-0 pointer-events-auto z-50 min-h-screen" onClick={onClose}>
            <div
                style={style}
                onClick={(e) => e.stopPropagation()}
                className={`relative card w-80 shadow-2xl border rounded-lg bg-white dark:bg-gray-800 animate-in fade-in duration-200 
                            ${style.transform?.includes('100%') ? 'origin-bottom' : 'origin-top'} 
                            zoom-in-95 ease-out`}
            >
                {/* Action Buttons Container */}
                <div className="absolute top-2 right-2 flex gap-1">
                    <button
                        onClick={handleCopy}
                        className="text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors p-1 cursor-pointer"
                        title="Copy to clipboard"
                    >
                        {copied ? <CopyCheck size={16} className="text-green-500" /> : <Copy size={16}/>}
                    </button>
                    
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 dark:hover:text-white transition-colors p-1 cursor-pointer"
                        aria-label="Close dialog"
                    >
                        <X size={16}/>
                    </button>
                </div>
                
                {/* Data div */}
                <div className="p-4">
                    <h3 className="text-sm font-bold mb-3 pr-6 text-gray-900 dark:text-gray-100">
                        {title || 'Details'}
                    </h3>

                    <div className="overflow-hidden border rounded-md border-gray-200 dark:border-gray-700">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-gray-100 dark:bg-gray-700">
                                <tr>
                                    {headers.map((key) => (
                                        <th key={key} className="px-3 py-2 font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700">
                                            {key}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {data.map((row, index) => (
                                    <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-900/40 transition-colors">
                                        {headers.map((key) => (
                                            <td key={`${index}-${key}`} className="px-3 py-2 text-gray-900 dark:text-gray-100 whitespace-nowrap">
                                                {row[key]?.toString()}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default TableDialog;