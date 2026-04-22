"use client"

import * as React from "react"
import * as SliderPrimitive from "@radix-ui/react-slider"
import * as TooltipPrimitive from "@radix-ui/react-tooltip"
import { cn } from "@/_components/generic/utils"

function Slider({
  className,
  defaultValue,
  value,
  onValueChange,
  min = 0,
  max = 100,
  ...props
}: React.ComponentProps<typeof SliderPrimitive.Root>) {
  const initialValue = value || defaultValue || [min]
  // Manage internal state to keep tooltips "live" if the component is uncontrolled
  const [internalValue, setInternalValue] = React.useState(value || defaultValue || [min])
  const [pressedIndex, setPressedIndex] = React.useState<number | null>(null)
  const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null)
  
  const activeValues = value || internalValue

  const handleValueChange = (newValues: number[]) => {
    setInternalValue(newValues)
    if (onValueChange) onValueChange(newValues)
  }

  const _values = React.useMemo(
    () =>
      Array.isArray(value)
        ? value
        : Array.isArray(defaultValue)
          ? defaultValue
          : [min, max],
    [value, defaultValue, min, max]
  )

  return (
    <TooltipPrimitive.Provider delayDuration={0}>
      <SliderPrimitive.Root
        data-slot="slider"
        defaultValue={defaultValue}
        value={value}
        onValueChange={handleValueChange}
        min={min}
        max={max}
        className={cn(
          "relative flex w-full touch-none items-center select-none data-disabled:opacity-50 data-[orientation=vertical]:h-full data-[orientation=vertical]:min-h-44 data-[orientation=vertical]:w-auto data-[orientation=vertical]:flex-col",
          className
        )}
        {...props}
      >
        <SliderPrimitive.Track
          data-slot="slider-track"
          className={cn(
            "bg-muted relative grow overflow-hidden rounded-full data-[orientation=horizontal]:h-1.5 data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-1.5"
          )}
        >
          <SliderPrimitive.Range
            data-slot="slider-range"
            className={cn(
              "bg-primary absolute data-[orientation=horizontal]:h-full data-[orientation=vertical]:w-full"
            )}
          />
        </SliderPrimitive.Track>
        {activeValues.map((value, index) => {
          const isOpen = pressedIndex === index || hoveredIndex === index
          
          return (
            <TooltipPrimitive.Root
              key={index}
              open={isOpen}
              onOpenChange={(open) => {
                if (open) setHoveredIndex(index)
                else if (hoveredIndex === index) setHoveredIndex(null)
              }}
            >
              <TooltipPrimitive.Trigger asChild>
                <SliderPrimitive.Thumb
                  data-slot="slider-thumb"
                  className="border-primary ring-ring/50 block size-4 shrink-0 rounded-full border bg-background shadow-sm transition-shadow hover:ring-4 focus-visible:ring-4 focus-visible:outline-hidden disabled:pointer-events-none disabled:opacity-50"
                  onPointerDown={() => setPressedIndex(index)}
                  onPointerUp={() => setPressedIndex(null)}
                />
              </TooltipPrimitive.Trigger>
              <TooltipPrimitive.Portal>
                <TooltipPrimitive.Content 
                  side="top"
                  sideOffset={8}
                  className="bg-primary z-10 text-primary-foreground text-xs px-2 py-1 rounded shadow-md animate-in fade-in zoom-in-95 duration-100"
                >
                  {value}
                  <TooltipPrimitive.Arrow className="fill-primary" />
                </TooltipPrimitive.Content>
              </TooltipPrimitive.Portal>
            </TooltipPrimitive.Root>
          )})}
      </SliderPrimitive.Root>
    </TooltipPrimitive.Provider>
  )
}

export { Slider }
