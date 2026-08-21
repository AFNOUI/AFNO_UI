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
 * here, so it's now the panel's actual layout, not just a color: generated
 * and shared files sit in two labeled groups instead of one 20+ item strip
 * where a reader has to check each chip's dot to tell which is which. Each
 * group wraps in a plain grid (no forced horizontal scroll — the variant
 * picker had the same "wrap fighting scroll" bug, fixed the same way there).
 */

import { ArrowRight, FileCode, Package } from "lucide-react";

import { Badge } from "@/components/ui/badge";
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

function FileGroupList({
    label,
    icon: Icon,
    files,
}: {
    label: string;
    icon: typeof FileCode;
    files: ExportFile[];
}) {
    if (files.length === 0) return null;
    return (
        <div className="space-y-1.5">
            <p className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
                <Icon className="h-3 w-3" />
                {label}
                <span className="text-muted-foreground/60">({files.length})</span>
            </p>
            <TabsList className="h-auto flex-wrap justify-start gap-1 bg-muted/50 p-1.5">
                {files.map((file) => (
                    <TabsTrigger
                        key={file.name}
                        value={file.name}
                        className="gap-1.5 text-xs data-[state=active]:bg-background"
                    >
                        <Icon className="h-3 w-3" />
                        {file.name}
                    </TabsTrigger>
                ))}
            </TabsList>
        </div>
    );
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

    const generatedFiles = files.filter((file) => !file.isFixed);
    const sharedFiles = files.filter((file) => file.isFixed);

    return (
        <Card className="border-border">
            <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                    <FileCode className="h-5 w-5 text-primary" />
                    <CardTitle className="text-base">{title}</CardTitle>
                </div>
                <CardDescription className="text-xs">
                    Generated files are yours to copy and edit; shared engine files are installed once and reused.
                </CardDescription>
            </CardHeader>

            <CardContent>
                {children}

                <Tabs value={current.name} onValueChange={onActiveFileChange} className="space-y-3">
                    <FileGroupList
                        label={`Generated per ${subject}`}
                        icon={FileCode}
                        files={generatedFiles}
                    />
                    <FileGroupList label="Shared engine — copy once" icon={Package} files={sharedFiles} />

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
