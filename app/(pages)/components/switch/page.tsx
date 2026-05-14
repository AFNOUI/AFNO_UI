import {
  SwitchBasic,
  SwitchInline,
  SwitchWithState,
  SwitchDisabled,
  SwitchSizes,
} from "@/components/lab/switch";

export default function SwitchPage() {
  return (
    <div className="space-y-6 sm:space-y-8 w-full min-w-0 max-w-full">
      <SwitchBasic />
      <SwitchInline />
      <SwitchWithState />
      <SwitchDisabled />
      <SwitchSizes />
    </div>
  );
}
