'use client';

import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import Link from 'next/link';

interface Action {
    label: string;
    subLabel?: string;
    icon?: React.ReactNode;
    onClick?: () => void;
    href?: string;
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
                const BUTTON_HEIGHT = 56;
                const HEADER_AND_PADDING = title || description ? 90 : 20;
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
                    top = `${rect.top + window.scrollY - 0}px`;
                } else {
                    top = `${rect.bottom + window.scrollY + 0}px`;
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
    }, [isOpen, anchorRef, actions.length, title, description])
    
    if (!isOpen) return null;

    return (
        <Dialog
            open={isOpen}
            onOpenChange={(open) => !open && onClose()}
            modal={true}
        >
            <DialogContent
                style={style}
                className="fixed z-50 w-80 max-w-[320px] p-1.5 bg-base-100 rounded-xl border border-base-200 shadow-xl outline-none translate-x-0 translate-y-0 transition-all duration-200"
            >
                {(title || description) && (
                    <DialogHeader className="px-3 pt-3 pb-2 border-b border-base-200/60 mb-1">
                        {title && (
                            <DialogTitle className="text-xs font-semibold uppercase tracking-wider text-base-content/50">
                                {title}
                            </DialogTitle>
                        )}
                        {description && (
                            <DialogDescription className="text-sm text-base-content/80 mt-0.5 leading-relaxed">
                                {description}
                            </DialogDescription>
                        )}
                    </DialogHeader>
                )}
                <div className="grid grid-cols-1 p-2">
                    {actions.map((action, index) => {
                        const commonClassName = "group flex items-center gap-3 w-full p-2.5 rounded-lg hover:bg-base-200/70 transition-all text-left cursor-pointer active:scale-[0.99]";

                        const handleClick = () => {
                            if (action.onClick) action.onClick();
                            onClose();
                        };

                        const content = (
                            <>
                                {action.icon && (
                                    <div className="flex items-center justify-center w-8 h-8 rounded-md bg-base-200 text-base-content group-hover:bg-base-100 transition-colors shrink-0">
                                        {action.icon}
                                    </div>
                                )}
                                <div className="flex flex-col min-w-0">
                                    <p className="text-sm font-medium text-base-content truncate">
                                        {action.label}
                                    </p>
                                    {action.subLabel && (
                                        <p className="text-xs text-base-content/60 truncate mt-0.5">
                                            {action.subLabel}
                                        </p>
                                    )}
                                </div>
                            </>
                        );

                        if (action.href) {
                            return (
                                <Link 
                                    key={index} 
                                    href={action.href} 
                                    className={commonClassName}
                                    onClick={handleClick}
                                >
                                    {content}
                                </Link>
                            );
                        }
                        return (
                            <button
                                key={index}
                                onClick={handleClick}
                                className={commonClassName}
                                type="button"
                            >
                                {content}
                            </button>
                        );
                    })}
                </div>
            </DialogContent>
        </Dialog>
    )
}

export default ActionDialog;