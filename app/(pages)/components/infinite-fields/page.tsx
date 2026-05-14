import { InfiniteFieldSelect } from "@/components/lab/infinite-field/InfiniteFieldSelect";
import { InfiniteFieldCombobox } from "@/components/lab/infinite-field/InfiniteFieldCombobox";
import { InfiniteFieldMultiSelect } from "@/components/lab/infinite-field/InfiniteFieldMultiSelect";
import { InfiniteFieldMultiCombobox } from "@/components/lab/infinite-field/InfiniteFieldMultiCombobox";

import { InfiniteFieldAutoSelect } from "@/components/lab/infinite-field/InfiniteFieldAutoSelect";
import { InfiniteFieldAutoCombobox } from "@/components/lab/infinite-field/InfiniteFieldAutoCombobox";
import { InfiniteFieldAutoMultiSelect } from "@/components/lab/infinite-field/InfiniteFieldAutoMultiSelect";
import { InfiniteFieldAutoMultiCombobox } from "@/components/lab/infinite-field/InfiniteFieldAutoMultiCombobox";

export default function InfiniteFieldsPage() {
  return (
    <div className="space-y-6">
    <InfiniteFieldSelect />
      <InfiniteFieldCombobox />
      <InfiniteFieldMultiSelect />
      <InfiniteFieldMultiCombobox />

      <InfiniteFieldAutoSelect />
      <InfiniteFieldAutoCombobox />
      <InfiniteFieldAutoMultiSelect />
      <InfiniteFieldAutoMultiCombobox />
    </div>
  );
}
