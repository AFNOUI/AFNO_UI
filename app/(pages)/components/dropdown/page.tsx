import {
  DropdownBasic,
  DropdownIconOnly,
  DropdownKeyboardShortcuts,
  DropdownCheckboxItems,
  DropdownRadioItems,
  DropdownRadioItemsPriority,
  DropdownNested,
  DropdownUserAccount,
  DropdownContextActions,
} from "@/components/lab/dropdown";

export default function DropdownPage() {
  return (
    <div className="space-y-8">
      <DropdownBasic />
      <DropdownIconOnly />
      <DropdownKeyboardShortcuts />
      <DropdownCheckboxItems />
      <DropdownRadioItems />
      <DropdownRadioItemsPriority />
      <DropdownNested />
      <DropdownUserAccount />
      <DropdownContextActions />
    </div>
  );
}
