import { DialogBasic } from "@/components/lab/dialog/DialogBasic";
import { DialogConfirmation } from "@/components/lab/dialog/DialogConfirmation";
import { DialogForm } from "@/components/lab/dialog/DialogForm";
import { DialogSuccess } from "@/components/lab/dialog/DialogSuccess";
import { DialogSettings } from "@/components/lab/dialog/DialogSettings";
import { DialogImageUpload } from "@/components/lab/dialog/DialogImageUpload";
import { DialogScrollable } from "@/components/lab/dialog/DialogScrollable";

export default function DialogPage() {
  return (
    <div className="space-y-8">
      <DialogBasic />
      <DialogConfirmation />
      <DialogForm />
      <DialogSuccess />
      <DialogSettings />
      <DialogImageUpload />
      <DialogScrollable />
    </div>
  );
}
