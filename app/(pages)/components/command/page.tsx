import { CommandBasic } from "@/components/lab/command/CommandBasic";
import { CommandPalette } from "@/components/lab/command/CommandPalette";
import { CommandThemeSwitcher } from "@/components/lab/command/CommandThemeSwitcher";
import { CommandUserMenu } from "@/components/lab/command/CommandUserMenu";
import { CommandCompact } from "@/components/lab/command/CommandCompact";
import { CommandInline } from "@/components/lab/command/CommandInline";

export default function CommandPage() {
  return (
    <div className="space-y-8">
      <CommandBasic />
      <CommandPalette />
      <CommandThemeSwitcher />
      <CommandUserMenu />
      <CommandCompact />
      <CommandInline />
    </div>
  );
}
