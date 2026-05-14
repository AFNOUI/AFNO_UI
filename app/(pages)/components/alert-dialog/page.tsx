import { AlertDialogBasic } from "@/components/lab/alert-dialog/AlertDialogBasic";
import { AlertDialogLogout } from "@/components/lab/alert-dialog/AlertDialogLogout";
import { AlertDialogPayment } from "@/components/lab/alert-dialog/AlertDialogPayment";
import { AlertDialogSecurity } from "@/components/lab/alert-dialog/AlertDialogSecurity";
import { AlertDialogDestructive } from "@/components/lab/alert-dialog/AlertDialogDestructive";

export default function AlertDialogPage() {
  return (
    <div className="space-y-6">
      <AlertDialogBasic />
      <AlertDialogDestructive />
      <AlertDialogLogout />
      <AlertDialogSecurity />
      <AlertDialogPayment />
    </div>
  );
}
