import * as React from "react";
import { DayPicker } from "react-day-picker";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";

import { buttonVariants } from "@/components/ui/button";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function MonthWithCaptionRow(
  props: React.ComponentProps<"div">
) {
  const { children, className, ...rest } = props;
  const childArray = React.Children.toArray(children);
  const gridChildren = childArray.slice(-1);
  const captionChildren = childArray.slice(0, -1);

  return (
    <div className={cn("space-y-4", className)} {...rest}>
      <div className="flex flex-row flex-nowrap items-center justify-between gap-2 w-full">
        {captionChildren}
      </div>
      {gridChildren}
    </div>
  );
}

function Calendar({ className, classNames, showOutsideDays = true, components, ...props }: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      navLayout="around"
      className={cn("p-3", className)}
      components={{
        Month: MonthWithCaptionRow,
        Chevron: ({ orientation }) => {
          const Icon = orientation === "left" ? ChevronLeft : ChevronRight;
          return <Icon className="h-4 w-4" />;
        },
        ...components,
      }}
      classNames={{
        // ─── Layout (v9/v10 element names) ──────────────────────────────
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        month_caption:
          "flex flex-row flex-nowrap items-center justify-between gap-2 pt-1 relative w-full",
        caption_label: "text-sm font-medium flex-1 text-center min-w-0",
        month_grid: "w-full border-collapse space-y-1",
        // ─── Navigation ─────────────────────────────────────────────────
        nav: "flex flex-row items-center gap-1 shrink-0",
        button_previous: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 min-w-7 p-0 rounded-md border border-border bg-transparent text-foreground opacity-70 cursor-pointer hover:opacity-100 hover:bg-muted",
        ),
        button_next: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 min-w-7 p-0 rounded-md border border-border bg-transparent text-foreground opacity-70 cursor-pointer hover:opacity-100 hover:bg-muted",
        ),
        // ─── Weekdays / week rows ───────────────────────────────────────
        weekdays: "grid grid-cols-7 gap-0 w-full",
        weekday:
          "text-muted-foreground rounded-md font-normal text-[0.8rem] text-center py-1 min-w-0",
        week: "flex w-full mt-2",
        // ─── Day cell + button ──────────────────────────────────────────
        day: "h-9 w-9 text-center text-sm p-0 relative rounded-md focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-primary first:[&:has([aria-selected])]:rounded-s-md last:[&:has([aria-selected])]:rounded-e-md",
        day_button: cn(
          buttonVariants({ variant: "ghost" }),
          "h-9 w-9 p-0 font-normal aria-selected:opacity-100",
        ),
        // ─── Day flags + selection state (v10 unprefixed names) ─────────
        selected:
          "bg-primary [&>button]:text-primary-foreground [&>button]:bg-primary rounded-md ring-2 ring-primary ring-offset-2 ring-offset-background",
        today: "bg-accent [&>button]:text-accent-foreground [&>button]:bg-accent",
        outside:
          "text-muted-foreground opacity-50 [&>button]:text-muted-foreground [&>button]:opacity-50",
        disabled: "text-muted-foreground opacity-50 [&>button]:opacity-50",
        range_middle:
          "aria-selected:bg-accent aria-selected:text-accent-foreground",
        range_end: "day-range-end",
        hidden: "invisible",
        ...classNames,
      }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };

/*
 * ============================================
 * TAILWIND CSS VARIABLES DOCUMENTATION
 * ============================================
 * This component uses Tailwind CSS variables defined in app/globals.css
 * 
 * Variables Used:
 * --------------
 * Colors:
 *   - hsl(var(--primary))               Line: 79 - Calendar class "[&_.recharts-rectangle.recharts-tooltip-cursor]:fill-muted"
 *                             Line: 72 - Calendar day selected class "bg-primary"
 *                             Selected day background
 *   - hsl(var(--primary-foreground))    Line: 79 - Calendar class "[&_.recharts-polar-grid_[stroke='#ccc']]:stroke-border/50"
 *                             Line: 76 - Calendar day selected class "text-primary-foreground"
 *                             Selected day text color
 *   - hsl(var(--accent))                Line: 77 - Calendar day hover class "bg-accent/50"
 *                             Line: 80 - Calendar today class "bg-accent"
 *                             Hover and today highlight background
 *   - hsl(var(--accent-foreground))     Line: 77 - Calendar day hover class "[&:has([aria-selected].day-outside)]:text-accent/50"
 *                             Line: 77 - Calendar day class "[&:has([aria-selected])]:bg-accent"
 *                             Line: 78 - Calendar day class "hover:bg-accent hover:text-accent-foreground"
 *                             Hover and today text color
 *   - hsl(var(--muted-foreground))      Line: 66 - Calendar weekday class "text-muted-foreground"
 *                             Line: 74 - Calendar day outside month class "text-muted-foreground"
 *                             Weekday labels and outside month text
 *   - hsl(var(--border))                Line: 52 - Calendar nav button class "border-border"
 *                             Navigation button border
 *   - hsl(var(--popover))               Line: 49 - Calendar root class "flex aspect-video justify-center text-xs"
 *                             Inherited from dialog/popover background
 *   - hsl(var(--popover-foreground))    Line: 49 - Calendar root class "[&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground"
 *                             Inherited from popover text color
 *
 * Note: This component incorporates button variants for navigation controls.
 * See button.tsx documentation for additional button-specific variables.
 */
