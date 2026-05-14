"use client";

import { Plus, Search, FileText, Settings } from "lucide-react";
import { ComponentInstall } from "@/components/lab/ComponentInstall";
import { code, data } from "@/registry/command/command-inline";

export function CommandInline() {
    const snippet = `const data = ${JSON.stringify(data, null, 2)};

<div className="p-4 border rounded-lg bg-muted/30">
  <p className="text-sm mb-3">Quick actions:</p>
  <div className="flex flex-wrap gap-2">
    {data.map((item, i) => {
      const Icon = { Plus, Search, FileText, Settings }[item.icon as "Plus" | "Search" | "FileText" | "Settings"];
      return (
        <button
          key={i}
          className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-md border bg-background hover:bg-accent transition-colors"
        >
          {Icon && <Icon className="w-4 h-4" />}
          {item.label}
        </button>
      );
    })}
  </div>
</div>`;

    return (
        <ComponentInstall category="command" variant="command-inline" title="Inline Command Menu" code={snippet} fullCode={code}>
            <div className="p-4 border rounded-lg bg-muted/30 max-w-lg">
                <p className="text-sm mb-3">Quick actions:</p>
                <div className="flex flex-wrap gap-2">
                    {data.map((item, i) => {
                        const Icon = { Plus, Search, FileText, Settings }[item.icon as "Plus" | "Search" | "FileText" | "Settings"];
                        return (
                            <button
                                key={i}
                                className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-md border bg-background hover:bg-accent transition-colors"
                            >
                                {Icon && <Icon className="w-4 h-4" />}
                                {item.label}
                            </button>
                        );
                    })}
                </div>
            </div>
        </ComponentInstall>
    );
}