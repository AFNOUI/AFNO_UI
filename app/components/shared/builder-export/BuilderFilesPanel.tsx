"use client";

/**
 * "Generated files" — the file browser under every Export tab.
 *
 * Four builders and three galleries each had their own copy of this tab strip.
 * They had drifted: different badge wording ("shared" / "fixed" / "Reusable —
 * install once"), different legends, and only some showed the destination
 * path. Same information, seven presentations.
 *
 * The distinction the panel is built around — **generated per export** versus
 * **shared engine, copy once** — is the one thing a reader has to understand
 * here, so it is carried consistently in three places: the dot on the tab, the
 * badge above the code, and the legend in the header.
 */

import { ArrowRight, FileCode, Package } from "lucide-react";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { CodeBlock } from "@/components/shared/CodeBlock";

import type { ExportFile } from "./types";

interface BuilderFilesPanelProps {
    files: ExportFile[];
    activeFile: string;
    onActiveFileChange: (name: string) => void;
    /**
     * What the non-shared files are regenerated from — "table", "form",
     * "board", "tree". Used in the legend and the per-file badge.
     */
    subject: string;
    title?: string;
    /** Rendered between the tab strip and the header, for family-specific copy. */
    children?: React.ReactNode;
}

export function BuilderFilesPanel({
    files,
    activeFile,
    onActiveFileChange,
    subject,
    title = "Generated files",
    children,
}: BuilderFilesPanelProps) {
    const current = files.find((file) => file.name === activeFile) ?? files[0];
    if (!current) return null;

    return (
        <Card className="border-border">
            <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                    <FileCode className="h-5 w-5 text-primary" />
                    <CardTitle className="text-base">{title}</CardTitle>
                </div>
                <CardDescription className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
                    <span className="inline-flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                        generated per {subject}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground" />
                        shared engine — copy once
                    </span>
                </CardDescription>
            </CardHeader>

            <CardContent>
                {children}

                <Tabs value={current.name} onValueChange={onActiveFileChange}>
                    <ScrollArea className="w-full">
                        <TabsList className="h-auto flex-wrap gap-1 bg-muted/50 p-1">
                            {files.map((file) => (
                                <TabsTrigger
                                    key={file.name}
                                    value={file.name}
                                    className="gap-1.5 text-xs data-[state=active]:bg-background"
                                >
                                    <span
                                        className={cn(
                                            "h-1.5 w-1.5 rounded-full",
                                            file.isFixed ? "bg-muted-foreground" : "bg-primary",
                                        )}
                                    />
                                    {file.isFixed ? (
                                        <Package className="h-3 w-3" />
                                    ) : (
                                        <FileCode className="h-3 w-3" />
                                    )}
                                    {file.name}
                                </TabsTrigger>
                            ))}
                        </TabsList>
                    </ScrollArea>

                    {files.map((file) => (
                        <TabsContent key={file.name} value={file.name} className="mt-4">
                            <div className="space-y-3">
                                <div className="flex flex-wrap items-start gap-2">
                                    {file.isFixed ? (
                                        <Badge variant="secondary" className="shrink-0 text-[10px]">
                                            <Package className="me-1 h-3 w-3" /> Shared engine — copy once
                                        </Badge>
                                    ) : (
                                        <Badge className="shrink-0 border-0 bg-primary/10 text-[10px] text-primary">
                                            <FileCode className="me-1 h-3 w-3" /> Generated per {subject}
                                        </Badge>
                                    )}
                                    {file.description && (
                                        <p className="text-xs text-muted-foreground">{file.description}</p>
                                    )}
                                </div>
                                <div className="flex items-center gap-1 font-mono text-xs text-muted-foreground">
                                    <ArrowRight className="h-3 w-3" /> {file.path}
                                </div>
                                <CodeBlock
                                    code={file.code}
                                    language={file.language}
                                    filename={file.path}
                                />
                            </div>
                        </TabsContent>
                    ))}
                </Tabs>
            </CardContent>
        </Card>
    );
}
