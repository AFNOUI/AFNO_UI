import {
  SheetRight,
  SheetSides,
  SheetMobileNav,
  SheetCart,
  SheetFilter,
  SheetNotifications,
} from "@/components/lab/sheet";

export default function SheetPage() {
  return (
    <div className="space-y-6 sm:space-y-8 w-full min-w-0 max-w-full">
      <SheetRight />
      <SheetSides />
      <SheetMobileNav />
      <SheetCart />
      <SheetFilter />
      <SheetNotifications />
    </div>
  );
}
