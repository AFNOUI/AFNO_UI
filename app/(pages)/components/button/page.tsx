"use client";

import { Mail, Settings } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";

import CodePreview from "@/components/lab/CodePreview";
import { SectionTitle } from "@/components/lab/SectionTitle";

export default function ButtonPage() {
    const { t } = useTranslation();

    const buttonCode = `import { Button } from "@/components/ui/button";
  import { Mail, Settings } from "lucide-react";
  
  // Variants
  <Button>Default</Button>
  <Button variant="secondary">Secondary</Button>
  <Button variant="destructive">Destructive</Button>
  <Button variant="outline">Outline</Button>
  <Button variant="ghost">Ghost</Button>
  <Button variant="link">Link</Button>
  
  // Sizes
  <Button size="sm">Small</Button>
  <Button size="default">Default</Button>
  <Button size="lg">Large</Button>
  
  // With Icons
  <Button>
    <Mail className="mr-2 h-4 w-4" />
    Login with Email
  </Button>
  
  // States
  <Button disabled>Disabled</Button>`;

    return (
        <div className="space-y-6">
            <SectionTitle>Buttons</SectionTitle>

            <CodePreview title={t("preview.variants")} code={buttonCode}>
                <div className="flex flex-wrap gap-3">
                    <Button>Default</Button>
                    <Button variant="secondary">Secondary</Button>
                    <Button variant="destructive">Destructive</Button>
                    <Button variant="outline">Outline</Button>
                    <Button variant="ghost">Ghost</Button>
                    <Button variant="link">Link</Button>
                </div>
            </CodePreview>

            <CodePreview title={t("preview.sizes")} code={`<Button size="sm">Small</Button>\n<Button size="default">Default</Button>\n<Button size="lg">Large</Button>`}>
                <div className="flex flex-wrap items-center gap-3">
                    <Button size="sm">Small</Button>
                    <Button size="default">Default</Button>
                    <Button size="lg">Large</Button>
                </div>
            </CodePreview>

            <CodePreview title={t("preview.withIcons")} code={`<Button>\n  <Mail className="mr-2 h-4 w-4" />\n  Login with Email\n</Button>`}>
                <div className="flex flex-wrap gap-3">
                    <Button><Mail className="mr-2 h-4 w-4" />Login with Email</Button>
                    <Button variant="outline"><Settings className="mr-2 h-4 w-4" />Settings</Button>
                </div>
            </CodePreview>

            <CodePreview title={t("preview.states")} code={`<Button disabled>Disabled</Button>`}>
                <div className="flex flex-wrap gap-3">
                    <Button disabled>{t("preview.disabled")}</Button>
                    <Button className="animate-pulse">{t("preview.loading")}</Button>
                </div>
            </CodePreview>
        </div>
    );
}
