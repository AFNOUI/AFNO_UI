import { AsyncFieldSelect } from "@/components/lab/async-field/AsyncFieldSelect";
import { AsyncFieldCombobox } from "@/components/lab/async-field/AsyncFieldCombobox";
import { AsyncFieldMultiSelect } from "@/components/lab/async-field/AsyncFieldMultiSelect";
import { AsyncFieldMultiCombobox } from "@/components/lab/async-field/AsyncFieldMultiCombobox";

export default function AsyncFieldPage() {
  return (
    <div className="space-y-6">
      <AsyncFieldSelect />
      <AsyncFieldCombobox />
      <AsyncFieldMultiSelect />
      <AsyncFieldMultiCombobox />
    </div>
  );
}
