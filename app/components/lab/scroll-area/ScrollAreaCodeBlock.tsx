"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { ComponentInstall } from "@/components/lab/ComponentInstall";
import { code, codeBlock } from "@/registry/scroll-area/scroll-area-code-block";

export function ScrollAreaCodeBlock() {
  return (
    <ComponentInstall
      category="scroll-area"
      variant="scroll-area-code-block"
      title="Code Block"
      code="// ScrollArea with <pre><code>...</code></pre>"
      fullCode={code}
    >
      <ScrollArea className="h-[200px] w-full max-w-lg rounded-md border bg-muted/50">
        <pre className="p-4 text-sm font-mono">
          <code>{codeBlock}</code>
        </pre>
      </ScrollArea>
    </ComponentInstall>
  );
}
