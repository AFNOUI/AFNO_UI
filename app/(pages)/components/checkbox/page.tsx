import { CheckboxBasic } from "@/components/lab/checkbox/CheckboxBasic";
import { CheckboxGroup } from "@/components/lab/checkbox/CheckboxGroup";
import { CheckboxInline } from "@/components/lab/checkbox/CheckboxInline";
import { CheckboxColored } from "@/components/lab/checkbox/CheckboxColored";
import { CheckboxTaskList } from "@/components/lab/checkbox/CheckboxTaskList";
import { CheckboxCardStyle } from "@/components/lab/checkbox/CheckboxCardStyle";
import { CheckboxFormAgreement } from "@/components/lab/checkbox/CheckboxFormAgreement";
import { CheckboxIndeterminate } from "@/components/lab/checkbox/CheckboxIndeterminate";
import { CheckboxWithDescription } from "@/components/lab/checkbox/CheckboxWithDescription";

export default function CheckboxPage() {
  return (
    <div className="space-y-8">
      <CheckboxBasic />
      <CheckboxIndeterminate />
      <CheckboxWithDescription />
      <CheckboxCardStyle />
      <CheckboxGroup />
      <CheckboxInline />
      <CheckboxFormAgreement />
      <CheckboxTaskList />
      <CheckboxColored />
    </div>
  );
}
