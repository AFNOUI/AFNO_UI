import { CollapsibleFaq } from "@/components/lab/collapsible/CollapsibleFaq";
import { CollapsibleBasic } from "@/components/lab/collapsible/CollapsibleBasic";
import { CollapsibleFileTree } from "@/components/lab/collapsible/CollapsibleFileTree";
import { CollapsibleSettings } from "@/components/lab/collapsible/CollapsibleSettings";
import { CollapsibleAnimated } from "@/components/lab/collapsible/CollapsibleAnimated";

export default function CollapsiblePage() {
  return (
    <div className="space-y-6">
      <CollapsibleBasic />
      <CollapsibleFileTree />
      <CollapsibleSettings />
      <CollapsibleFaq />
      <CollapsibleAnimated />
    </div>
  );
}
