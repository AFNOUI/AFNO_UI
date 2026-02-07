"use client";

// import { useTranslation } from "react-i18next";

import {
  Select,
  SelectItem,
  SelectValue,
  SelectContent,
  SelectTrigger,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

import CodePreview from "@/components/lab/CodePreview";
import { SectionTitle } from "@/components/lab/SectionTitle";

export default function SelectPage() {
  // const { t } = useTranslation();

  const selectCode = `import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from "@/components/ui/select";
  
  <Select>
    <SelectTrigger className="w-[180px]">
      <SelectValue placeholder="Select a theme" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="light">Light</SelectItem>
      <SelectItem value="dark">Dark</SelectItem>
      <SelectItem value="system">System</SelectItem>
    </SelectContent>
  </Select>`;

  return (
    <div className="space-y-6">
      <SectionTitle>Select</SectionTitle>

      <CodePreview title="Select Component" code={selectCode}>
        <div className="max-w-xs space-y-4">
          <div className="space-y-2">
            <Label>Theme</Label>

            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select a theme" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CodePreview>
    </div>
  );
}
