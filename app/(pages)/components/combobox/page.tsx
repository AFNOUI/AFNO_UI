import { ComboboxUser } from "@/components/lab/combobox/ComboboxUser";
import { ComboboxBasic } from "@/components/lab/combobox/ComboboxBasic";
import { ComboboxCountry } from "@/components/lab/combobox/ComboboxCountry";
import { ComboboxCreatable } from "@/components/lab/combobox/ComboboxCreatable";
import { ComboboxMultiselect } from "@/components/lab/combobox/ComboboxMultiselect";

export default function ComboboxPage() {
  return (
    <div className="space-y-8">
      <ComboboxBasic />
      <ComboboxCountry />
      <ComboboxUser />
      <ComboboxMultiselect />
      <ComboboxCreatable />
    </div>
  );
}
