'use client';

import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';

interface Action {
    label: string;
    subLabel?: string;
    icon?: React.ReactNode;
    onClick: () => void;
}

interface ActionDialogProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    description?: string;
    actions: Action[];
    anchorRef?: React.RefObject<HTMLElement>;
}

const ActionDialog: React.FC<ActionDialogProps> = ({
    isOpen, onClose, title, description, actions, anchorRef
}) => {
    const [style, setStyle] = useState<React.CSSProperties>({ visibility: 'hidden' });

    useEffect(() => {
        if (isOpen && anchorRef?.current) {
            requestAnimationFrame(() => {
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

            })
        } else if (!isOpen) {
            setStyle({ opacity: 0, visibility: 'hidden' });
        }
    }, [isOpen, anchorRef, actions.length])
    
    if (!isOpen) return null;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent
                style={style}
                className="fixed z-50 w-80 gap-0 p-0 outline-none sm:max-w-[320px] translate-x-0 translate-y-0 duration-200"
            >
                <DialogHeader className="p-4 border-b">
                    <DialogTitle className="text-sm font-bold">
                        {title || 'Choose an action'}
                    </DialogTitle>
                    <DialogDescription className="text-xs">
                        {description || 'Please select one of the following options to proceed.'}
                    </DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-1 p-2">
                    {actions.map((action, index) => {
                        return (
                            <button 
                                key={index}
                                onClick={() => {
                                    action.onClick();
                                    onClose();
                                }}
                                className="flex items-center gap-3 w-full p-3 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors text-left"
                            >
                                {action.icon && (
                                    <div className="p-2 rounded bg-muted group-hover:bg-background transition-colors">
                                        {action.icon}
                                    </div>
                                )}
                                <div className="flex flex-col">
                                    <p className="text-sm font-medium leading-none">{action.label}</p>
                                    {action.subLabel && (
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {action.subLabel}
                                        </p>
                                    )}
                                </div>
                            </button>
                        );
                    })}
                </div>
            </DialogContent>
        </Dialog>
    )
}

export default ActionDialog;