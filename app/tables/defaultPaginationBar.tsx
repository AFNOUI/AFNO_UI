/**
 * Default pagination bar — the single built-in fallback rendered when
 * `config.enablePagination` is true and the user did NOT supply
 * `config.renderPagination`.
 *
 * Exported so user-supplied `renderPagination` functions can compose with
 * it, and so the generator can wire it into exported variants.
 *
 * Resolution order at render time (built into the engine):
 *   config.renderPagination → <DefaultPaginationBar />
 */
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
} from "lucide-react";
import type { TableBuilderConfig, PaginationRenderContext } from "./types";

export interface DefaultPaginationBarProps extends PaginationRenderContext {
  config: TableBuilderConfig;
}

export function DefaultPaginationBar({
  page, setPage, totalPages, pageSize, setPageSize, totalRows, config,
}: DefaultPaginationBarProps) {
  const layout = config.paginationLayout || "full";
  const showInfo = config.showPageInfo !== false;
  const showFirstLast = config.showFirstLastButtons !== false;
  const showSizeSelector = config.showPageSizeSelector === true;
  const sizeOptions = config.pageSizeOptions?.length ? config.pageSizeOptions : [5, 10, 20, 50];

  const info = showInfo && (
    <p className="text-xs text-muted-foreground">
      Showing {totalRows > 0 ? page * pageSize + 1 : 0}–{Math.min((page + 1) * pageSize, totalRows)} of {totalRows}
    </p>
  );

  const sizer = showSizeSelector && (
    <div className="flex items-center gap-1.5">
      <span className="text-xs text-muted-foreground hidden sm:inline">Rows:</span>
      <Select value={String(pageSize)} onValueChange={v => { setPageSize(Number(v)); setPage(0); }}>
        <SelectTrigger className="h-7 text-xs w-[70px]"><SelectValue /></SelectTrigger>
        <SelectContent>
          {sizeOptions.map(n => <SelectItem key={n} value={String(n)} className="text-xs">{n}</SelectItem>)}
        </SelectContent>
      </Select>
    </div>
  );

  const wrapClass = "flex items-center justify-between gap-2 px-4 py-3 border-t border-border flex-wrap";

  if (layout === "infoOnly") {
    return <div className={wrapClass}>{info}{sizer}</div>;
  }

  if (layout === "minimal") {
    return (
      <div className={wrapClass}>
        {info}
        <div className="flex items-center gap-2">
          {sizer}
          <Button variant="outline" size="sm" className="h-7 text-xs gap-1" disabled={page === 0} onClick={() => setPage(p => p - 1)}>
            <ChevronLeft className="h-3 w-3 rtl:rotate-180" /> Prev
          </Button>
          <Button variant="outline" size="sm" className="h-7 text-xs gap-1" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>
            Next <ChevronRight className="h-3 w-3 rtl:rotate-180" />
          </Button>
        </div>
      </div>
    );
  }

  if (layout === "numbered") {
    const pages: (number | "...")[] = [];
    const maxBtns = 5;
    if (totalPages <= maxBtns) for (let i = 0; i < totalPages; i++) pages.push(i);
    else {
      pages.push(0);
      const start = Math.max(1, page - 1);
      const end = Math.min(totalPages - 2, page + 1);
      if (start > 1) pages.push("...");
      for (let i = start; i <= end; i++) pages.push(i);
      if (end < totalPages - 2) pages.push("...");
      pages.push(totalPages - 1);
    }
    return (
      <div className={wrapClass}>
        {info}
        <div className="flex items-center gap-1.5 flex-wrap">
          {sizer}
          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon" className="h-7 w-7" disabled={page === 0} onClick={() => setPage(p => p - 1)}>
              <ChevronLeft className="h-3.5 w-3.5 rtl:rotate-180" />
            </Button>
            {pages.map((p, i) =>
              p === "..." ? (
                <span key={`e-${i}`} className="px-1.5 text-xs text-muted-foreground">…</span>
              ) : (
                <Button key={p} variant={p === page ? "default" : "outline"} size="icon" className="h-7 w-7 text-xs tabular-nums" onClick={() => setPage(p)}>
                  {p + 1}
                </Button>
              ),
            )}
            <Button variant="outline" size="icon" className="h-7 w-7" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>
              <ChevronRight className="h-3.5 w-3.5 rtl:rotate-180" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (layout === "compact") {
    return (
      <div className={wrapClass}>
        {info}
        <div className="flex items-center gap-2">
          {sizer}
          <span className="text-xs tabular-nums">{page + 1}/{totalPages}</span>
          <div className="flex">
            <Button variant="outline" size="icon" className="h-7 w-7 rounded-e-none" disabled={page === 0} onClick={() => setPage(p => p - 1)}>
              <ChevronLeft className="h-3.5 w-3.5 rtl:rotate-180" />
            </Button>
            <Button variant="outline" size="icon" className="h-7 w-7 rounded-s-none -ms-px" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>
              <ChevronRight className="h-3.5 w-3.5 rtl:rotate-180" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // FULL (default)
  return (
    <div className={wrapClass}>
      <div className="flex items-center gap-3 flex-wrap">{info}{sizer}</div>
      <div className="flex items-center gap-1">
        {showFirstLast && (
          <Button variant="outline" size="icon" className="h-7 w-7" disabled={page === 0} onClick={() => setPage(0)}>
            <ChevronsLeft className="h-3.5 w-3.5 rtl:rotate-180" />
          </Button>
        )}
        <Button variant="outline" size="icon" className="h-7 w-7" disabled={page === 0} onClick={() => setPage(p => p - 1)}>
          <ChevronLeft className="h-3.5 w-3.5 rtl:rotate-180" />
        </Button>
        <span className="text-xs px-2 tabular-nums">{page + 1} / {totalPages}</span>
        <Button variant="outline" size="icon" className="h-7 w-7" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>
          <ChevronRight className="h-3.5 w-3.5 rtl:rotate-180" />
        </Button>
        {showFirstLast && (
          <Button variant="outline" size="icon" className="h-7 w-7" disabled={page >= totalPages - 1} onClick={() => setPage(totalPages - 1)}>
            <ChevronsRight className="h-3.5 w-3.5 rtl:rotate-180" />
          </Button>
        )}
      </div>
    </div>
  );
}
