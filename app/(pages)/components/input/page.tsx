"use client";

// import { useTranslation } from "react-i18next";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import CodePreview from "@/components/lab/CodePreview";
import { SectionTitle } from "@/components/lab/SectionTitle";

export default function InputPage() {
    // const { t } = useTranslation();

    const inputCode = `import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

<div className="space-y-2">
  <Label htmlFor="email">Email</Label>
  <Input id="email" type="email" placeholder="you@example.com" />
</div>

<div className="space-y-2">
  <Label htmlFor="password">Password</Label>
  <Input id="password" type="password" placeholder="••••••••" />
</div>

<div className="space-y-2">
  <Label htmlFor="message">Message</Label>
  <Textarea id="message" placeholder="Type your message here..." />
</div>`;

    return (
        <div className="space-y-6">
            <SectionTitle>Inputs</SectionTitle>

            <CodePreview title="Input Fields" code={inputCode}>
                <div className="space-y-4 max-w-md">
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" placeholder="you@example.com" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input id="password" type="password" placeholder="••••••••" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="disabled">Disabled</Label>
                        <Input id="disabled" disabled placeholder="Disabled input" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="textarea">Message</Label>
                        <Textarea id="textarea" placeholder="Type your message here..." />
                    </div>
                </div>
            </CodePreview>
        </div>
    );
}
