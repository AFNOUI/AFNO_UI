import {
  ToggleBasic,
  ToggleVariants,
  ToggleSizes,
  ToggleWithText,
  ToggleControlled,
  ToggleTextAlignmentGroup,
  ToggleMultipleSelection,
  ToggleViewSwitcher,
  ToggleThemeSwitcher,
  ToggleListType,
  ToggleMediaControls,
  ToggleGroupSizes,
} from "@/components/lab/toggle";

export default function TogglePage() {
  return (
    <div className="space-y-6 sm:space-y-8 w-full min-w-0 max-w-full">
      <ToggleBasic />
      <ToggleVariants />
      <ToggleSizes />
      <ToggleWithText />
      <ToggleControlled />
      <ToggleTextAlignmentGroup />
      <ToggleMultipleSelection />
      <ToggleViewSwitcher />
      <ToggleThemeSwitcher />
      <ToggleListType />
      <ToggleMediaControls />
      <ToggleGroupSizes />
    </div>
  );
}
