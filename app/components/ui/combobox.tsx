"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"

import {
    Command,
    CommandItem,
    CommandList,
    CommandEmpty,
    CommandGroup,
    CommandInput,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button"

const ComboboxList = CommandList
const ComboboxEmpty = CommandEmpty
const ComboboxInput = CommandInput
const ComboboxGroup = CommandGroup

const ComboboxContext = React.createContext<{
    open: boolean
    value: string
    setOpen: (open: boolean) => void
    setValue: (value: string) => void
} | null>(null)

const Combobox = ({
    value,
    children,
    onValueChange
}: {
    value: string,
    children: React.ReactNode,
    onValueChange: (value: string) => void
}) => {
    const [open, setOpen] = React.useState(false)

    return (
        <ComboboxContext.Provider value={{ open, setOpen, value, setValue: onValueChange }}>
            <Popover open={open} onOpenChange={setOpen}>
                {children}
            </Popover>
        </ComboboxContext.Provider>
    )
}

const ComboboxTrigger = React.forwardRef<HTMLButtonElement, React.ComponentPropsWithoutRef<typeof Button>>(
    ({ className, children, ...props }, ref) => {
        const context = React.useContext(ComboboxContext)

        if (!context) throw new Error("ComboboxTrigger must be used within a Combobox")

        return (
            <PopoverTrigger asChild>
                <Button
                    ref={ref}
                    variant="outline"
                    role="combobox"
                    aria-expanded={context.open}
                    className={cn("w-[200px] justify-between", className)}
                    {...props}
                >
                    {children}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
        )
    }
)
ComboboxTrigger.displayName = "ComboboxTrigger"

const ComboboxContent = ({ children, className }: { children: React.ReactNode, className?: string }) => (
    <PopoverContent className={cn("w-[200px] p-0", className)}>
        <Command>{children}</Command>
    </PopoverContent>
)

const ComboboxItem = React.forwardRef<
    React.ElementRef<typeof CommandItem>,
    React.ComponentPropsWithoutRef<typeof CommandItem>
>(({ className, children, value: itemValue, onSelect, ...props }, ref) => {
    const context = React.useContext(ComboboxContext)

    if (!context) throw new Error("ComboboxItem must be used within a Combobox")

    return (
        <CommandItem
            ref={ref}
            value={itemValue}
            className={cn(className)}
            onSelect={(currentValue) => {
                context?.setValue(currentValue === context.value ? "" : currentValue)
                context?.setOpen(false)
                onSelect?.(currentValue)
            }}
            {...props}
        >
            <Check
                className={cn(
                    "mr-2 h-4 w-4",
                    context?.value === itemValue ? "opacity-100" : "opacity-0"
                )}
            />
            {children}
        </CommandItem>
    )
})
ComboboxItem.displayName = "ComboboxItem"

export {
    Combobox,
    ComboboxList,
    ComboboxItem,
    ComboboxInput,
    ComboboxEmpty,
    ComboboxGroup,
    ComboboxTrigger,
    ComboboxContent,
}
