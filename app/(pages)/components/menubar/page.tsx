import { MenubarApplication, MenubarEditor, MenubarSimple } from "@/components/lab/menubar";

export default function MenubarPage() {
  return (
    <div className="space-y-8">
      <MenubarApplication />
      <MenubarEditor />
      <MenubarSimple />
    </div>
  );
}
