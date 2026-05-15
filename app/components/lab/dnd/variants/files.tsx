"use client";

import { useState } from "react";
import { FileText, Folder, FolderOpen } from "lucide-react";

import { cn } from "@/lib/utils";
import { useDraggable, useDropZone } from "@/components/ui/dnd";

interface FileItem {
  id: string;
  name: string;
  folderId: string | null;
}

function LooseFile({ file }: { file: FileItem }) {
  const { dragProps, isDragging } = useDraggable({
    id: file.id,
    data: { id: file.id },
    preview: () => (
      <div className="flex items-center gap-2 rounded border bg-card px-2 py-1 text-xs shadow-lg">
        <FileText className="h-3.5 w-3.5" />
        {file.name}
      </div>
    ),
  });
  return (
    <div
      {...dragProps}
      className={cn(
        "flex items-center gap-2 rounded border bg-card px-2 py-1 text-xs",
        isDragging && "opacity-30",
      )}
    >
      <FileText className="h-3.5 w-3.5 text-muted-foreground" />
      {file.name}
    </div>
  );
}

function FolderTarget({
  id,
  name,
  count,
  onDrop,
}: {
  id: string;
  name: string;
  count: number;
  onDrop: (fileId: string) => void;
}) {
  const { zoneProps, isOver, isDragging } = useDropZone<
    { folderId: string },
    { id: string }
  >({
    id: `folder-${id}`,
    data: { folderId: id },
    onDrop: ({ item }) => onDrop(item.data.id),
  });
  return (
    <div
      {...zoneProps}
      className={cn(
        "flex flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed p-3 transition",
        isOver
          ? "border-primary bg-primary/10"
          : isDragging
            ? "border-primary/40"
            : "border-border bg-muted/20",
      )}
    >
      {isOver ? (
        <FolderOpen className="h-7 w-7 text-primary" />
      ) : (
        <Folder className="h-7 w-7 text-muted-foreground" />
      )}
      <span className="text-xs font-medium truncate max-w-full">{name}</span>
      <span className="text-[10px] text-muted-foreground">{count} files</span>
    </div>
  );
}

export function FilesDemo() {
  const [files, setFiles] = useState<FileItem[]>([
    { id: "fl1", name: "report.pdf", folderId: null },
    { id: "fl2", name: "notes.md", folderId: null },
    { id: "fl3", name: "logo.svg", folderId: null },
    { id: "fl4", name: "data.csv", folderId: null },
  ]);
  const folders = ["Documents", "Designs", "Archive"];

  const move = (fileId: string, folderId: string | null) =>
    setFiles((cur) =>
      cur.map((f) => (f.id === fileId ? { ...f, folderId } : f)),
    );

  const loose = files.filter((f) => f.folderId === null);

  return (
    <div className="space-y-3">
      <div className="rounded-lg border bg-muted/20 p-3">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Loose files
        </p>
        <div className="flex flex-wrap gap-2">
          {loose.length === 0 && (
            <p className="text-xs text-muted-foreground">All filed away.</p>
          )}
          {loose.map((f) => (
            <LooseFile key={f.id} file={f} />
          ))}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {folders.map((name) => {
          const id = name.toLowerCase();
          const count = files.filter((f) => f.folderId === id).length;
          return (
            <FolderTarget
              key={id}
              id={id}
              name={name}
              count={count}
              onDrop={(fileId) => move(fileId, id)}
            />
          );
        })}
      </div>
    </div>
  );
}

export const filesSnippet = `import { useState } from "react";
import { Folder, FolderOpen, FileText } from "lucide-react";

import { cn } from "../../lib/utils";
import { useDraggable, useDropZone } from "../../components/dnd";

interface FileItem { id: string; label: string; folderId: string | null }
type FileDragData = { id: string } & Record<string, unknown>;
type FolderZoneData = { folderId: string } & Record<string, unknown>;

function FolderDrop({ id, name, count, onDrop }: { id: string; name: string; count: number; onDrop: (fileId: string) => void }) {
  const { zoneProps, isOver } = useDropZone<FolderZoneData, FileDragData>({
    id: \`folder-\${id}\`, data: { folderId: id },
    onDrop: ({ item }) => onDrop(item.data.id),
  });
  return (
    <div {...zoneProps}
      className={cn("flex flex-col items-center gap-1 rounded-lg border-2 border-dashed p-4 transition",
        isOver ? "border-primary bg-primary/10 scale-105" : "border-border bg-muted/20")}>
      {isOver ? <FolderOpen className="h-8 w-8 text-primary" /> : <Folder className="h-8 w-8 text-muted-foreground" />}
      <p className="text-xs font-medium">{name}</p>
      <p className="text-[10px] text-muted-foreground">{count} files</p>
    </div>
  );
}

export default function FileDrop() {
  const [files, setFiles] = useState<FileItem[]>([
    { id: "f1", label: "report.pdf", folderId: null },
    { id: "f2", label: "logo.png", folderId: null },
    { id: "f3", label: "notes.md", folderId: "docs" },
  ]);
  const move = (fileId: string, folderId: string) =>
    setFiles((prev) => prev.map((f) => (f.id === fileId ? { ...f, folderId } : f)));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        {[{ id: "docs", name: "Documents" }, { id: "img", name: "Images" }, { id: "misc", name: "Misc" }].map((f) => (
          <FolderDrop key={f.id} id={f.id} name={f.name} count={files.filter((x) => x.folderId === f.id).length} onDrop={(id) => move(id, f.id)} />
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {files.filter((f) => f.folderId === null).map((file) => {
          const D = () => {
            const { dragProps, isDragging } = useDraggable<FileDragData>({
              id: file.id, data: { id: file.id },
              preview: () => <div className="rounded-md border bg-card px-3 py-2 text-sm shadow-lg">{file.label}</div>,
            });
            return (
              <div {...dragProps} className={cn("flex items-center gap-2 rounded-md border bg-card px-3 py-2 text-sm", isDragging && "opacity-30")}>
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span>{file.label}</span>
              </div>
            );
          };
          return <D key={file.id} />;
        })}
      </div>
    </div>
  );
}
`;
