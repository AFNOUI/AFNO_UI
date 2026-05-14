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
    onValueChange,
    open: controlledOpen,
    onOpenChange: setControlledOpen
}: {
    value: string,
    open?: boolean,
    children: React.ReactNode,
    onOpenChange?: (open: boolean) => void
    onValueChange: (value: string) => void
}) => {
    const [internalOpen, setInternalOpen] = React.useState(false);

    const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
    const setOpen = setControlledOpen !== undefined ? setControlledOpen : setInternalOpen;

    return (
        <ComboboxContext.Provider value={{ open, setOpen, value, setValue: onValueChange }}>
            <Popover open={open} onOpenChange={setOpen}>
                {children}
            </Popover>
        </ComboboxContext.Provider>
    )
}

const ComboboxTrigger = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<"div">>(
    ({ className, children, ...props }, ref) => {
        const context = React.useContext(ComboboxContext)
        if (!context) throw new Error("ComboboxTrigger must be used within a Combobox")

        return (
            <PopoverTrigger asChild>
                <div
                    ref={ref}
                    role="combobox"
                    aria-haspopup="listbox"
                    aria-expanded={context.open}
                    aria-controls="combobox-list"
                    className={cn(
                        "flex min-h-10 w-[200px] items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                        className
                    )}
                    {...props}
                >
                    {children}
                    <ChevronsUpDown className="ms-2 h-4 w-4 shrink-0 opacity-50" />
                </div>
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
    React.ComponentPropsWithoutRef<typeof CommandItem> & { shouldCloseOnSelect?: boolean }
>(({ className, children, value: itemValue, onSelect, shouldCloseOnSelect = true, ...props }, ref) => {
    const context = React.useContext(ComboboxContext)

    if (!context) throw new Error("ComboboxItem must be used within a Combobox")

    return (
        <CommandItem
            ref={ref}
            value={itemValue}
            className={cn(className)}
            onSelect={(currentValue) => {
                context?.setValue(currentValue === context.value ? "" : currentValue)
                if (shouldCloseOnSelect) {
                    context.setOpen(false)
                }
                onSelect?.(currentValue)
            }}
            {...props}
        >
            <Check
                className={cn(
                    "me-2 h-4 w-4",
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

/*
 * ============================================
 * TAILWIND CSS VARIABLES DOCUMENTATION
 * ============================================
 * This component uses Tailwind CSS variables defined in app/globals.css
 *
 * Variables Used (via Command and Popover primitives):
 * --------------
 * Colors:
 *   - hsl(var(--background))      Line: 75 - ComboboxTrigger class "bg-background"
 *                                  Trigger background
 *   - hsl(var(--input))           Line: 75 - ComboboxTrigger class "border-input"
 *                                  Trigger border color
 *   - hsl(var(--muted-foreground)) Line: 75 - ComboboxTrigger class "placeholder:text-muted-foreground"
 *                                  Placeholder text color
 *   - hsl(var(--ring))            Line: 75 - ComboboxTrigger class "focus:ring-ring"
 *                                  Focus ring color
 *
 * Note: ComboboxContent uses PopoverContent (bg-popover, text-popover-foreground).
 * ComboboxItem uses CommandItem (accent, accent-foreground). See command.tsx and popover.tsx.
 */
