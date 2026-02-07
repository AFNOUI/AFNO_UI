"use client";

// import { useTranslation } from "react-i18next";

import { Badge } from "@/components/ui/badge";

import CodePreview from "@/components/lab/CodePreview";
import { SectionTitle } from "@/components/lab/SectionTitle";

export default function BadgePage() {
    // const { t } = useTranslation();

    const badgeCode = `import { Badge } from "@/components/ui/badge";

<Badge>Default</Badge>
<Badge variant="secondary">Secondary</Badge>
<Badge variant="outline">Outline</Badge>
<Badge variant="destructive">Destructive</Badge>`;

    return (
        <div className="space-y-6">
            <SectionTitle>Badges</SectionTitle>

            <CodePreview title="Badge Variants" code={badgeCode}>
                <div className="flex flex-wrap gap-3">
                    <Badge>Default</Badge>
                    <Badge variant="secondary">Secondary</Badge>
                    <Badge variant="outline">Outline</Badge>
                    <Badge variant="destructive">Destructive</Badge>
                </div>
            </CodePreview>
        </div>
    );
}
