'use client';

import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';

interface Action {
    label: string;
    icon?: React.ReactNode;
    onClick: () => void;
}

interface ActionDialogProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    actions: Action[];
    anchorRef?: React.RefObject<HTMLElement>;
}

const ActionDialog: React.FC<ActionDialogProps> = ({
    isOpen, onClose, title, actions, anchorRef
}) => {
    const [style, setStyle] = useState<React.CSSProperties>({ visibility: 'hidden' });

    useEffect(() => {
        if (isOpen && anchorRef?.current) {
            const rect = anchorRef.current.getBoundingClientRect();

            // Constants
            const BUTTON_HEIGHT = 33;
            const HEADER_AND_PADDING = 80;
            const DIALOG_WIDTH = 320;
            const VIEWPORT_MARGIN = 16;

            //Estimate height based on provided buttons
            const buttonCount = actions.length;
            const estimatedHeight = (buttonCount * BUTTON_HEIGHT) + HEADER_AND_PADDING;

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
                zIndex: 100
            });
        }
    }, [isOpen, anchorRef])
    
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
                <button
                    onClick={onClose}
                    className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 dark:hover:text-white transition-colors p-1"
                    aria-label="Close dialog"
                >
                    <X size={16}/>
                </button>
                <div className="card-body p-4">
                    <h3 className="card-title text-sm font-bold">{title ? title : 'Choose an action'}</h3>
                    <div className="card-actions justify-center mt-2">
                        {actions.map((action, index) => (
                            <button
                                key={index}
                                onClick={() => {
                                    action.onClick();
                                    onClose();
                                }}
                                className="btn btn-sm btn-ghost border rounded-lg flex items-center justify-start gap-2 w-full"
                            >
                                {action.icon}
                                {action.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ActionDialog;