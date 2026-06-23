'use client';

import * as SwitchPrimitives from "@radix-ui/react-switch";
import { cn } from "../generic/utils";
import { THEME } from "../constants/ui";

interface SwitchLabels {
  on: string;
  off: string;
}

interface SwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  labels?: SwitchLabels;
  inputName?: string;
  value?: string;
  showLabels?: boolean;
  className?: string;
}

export const Switch = ({
    checked,
    onCheckedChange,
    disabled,
    labels = { on: 'Yes', off: 'No' },
    inputName,
    value = "on",
    showLabels = true,
    className,
}: SwitchProps) => {
    return (
        <div className={cn(
            "flex h-12 w-full items-center px-3 rounded-lg bg-base", 
            className
        )}>
            <SwitchPrimitives.Root
                checked={checked}
                onCheckedChange={onCheckedChange}
                disabled={disabled}
                name={inputName}
                value={value}
                className={cn(
                        "peer inline-flex h-7 w-20 shrink-0 cursor-pointer items-center rounded-lg border  border-transparent transition-colors",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                        "disabled:cursor-not-allowed disabled:opacity-50",
                        checked ? "bg-primary" : "bg-success-content"
                    )}
            >
                <SwitchPrimitives.Thumb
                    className={cn(
                        "pointer-events-none block h-5 w-10 rounded-md shadow-lg ring-0 transition-transform",
                        "bg-base-100",
                        "border border-secondary",
                        checked ? "translate-x-8" : "translate-x-1"
                        )}
                > 
                </SwitchPrimitives.Thumb>
            </SwitchPrimitives.Root>
            {showLabels && (
                <span className="ml-3 text-sm font-medium opacity-70">
                    {checked ? labels.on : labels.off}
                </span>
            )}
        </div>
    )
}