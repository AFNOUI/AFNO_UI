import { AlertDefault } from "@/components/lab/alert/AlertDefault";
import { AlertDestructive } from "@/components/lab/alert/AlertDestructive";

export default function AlertPage() {
  return (
    <div className="space-y-6">
        <AlertDefault />
        <AlertDestructive />
    </div>
  );
}
