/**
 * Sandboxed cell-click JS handler runner.
 *
 * The user can attach a small JS snippet to a column's `clickAction.code`
 * (when `clickAction.type === "js"`). Snippets execute with:
 *   - `row`     — the full row object (frozen).
 *   - `value`   — the cell's value.
 *   - `helpers` — a curated allowlist of helpers (`toast`, `copy`, `open`).
 *
 * Hardening:
 *   - Compiled with `new Function` as an **async** function so snippets may
 *     `await helpers.copy(value)` etc. The body runs in strict mode (the
 *     default for async functions), so we can't use `with` — instead we
 *     destructure the sandbox into local bindings as the very first line.
 *   - Common globals (`window`, `document`, `fetch`, `localStorage`, …) are
 *     shadowed with `undefined` parameters so naive `window.foo` access
 *     throws synchronously and is caught.
 *   - Errors are caught and surfaced via toast so a misbehaving snippet
 *     cannot crash the table.
 *
 * This is "safe enough" sandboxing for the builder preview / generated apps
 * the user controls — it is NOT a substitute for a real isolate when running
 * untrusted third-party code.
 */
import { toast } from "@/hooks/use-toast";

export interface CellJsHelpers {
  toast: (msg: string, variant?: "default" | "destructive") => void;
  copy: (text: string) => Promise<void>;
  open: (url: string, target?: "_self" | "_blank") => void;
  fetch: typeof fetch;
}

const SHADOWED_GLOBALS = [
  "window", "document", "globalThis", "self", "top", "parent",
  "fetch", "XMLHttpRequest", "WebSocket", "localStorage", "sessionStorage",
  "indexedDB", "navigator", "location", "history", "alert", "confirm", "prompt",
  "require",
];

function buildHelpers(): CellJsHelpers {
  return {
    toast: (msg, variant = "default") => {
      toast({ title: msg, variant });
    },
    copy: (text) => navigator.clipboard.writeText(String(text)),
    open: (url, target = "_self") => {
      if (target === "_blank") window.open(url, "_blank", "noopener,noreferrer");
      else window.location.href = url;
    },
    fetch: ((...args: Parameters<typeof fetch>) => window.fetch(...args)) as typeof fetch,
  };
}

/**
 * Compile + run a snippet. Returns `true` if it executed without throwing
 * synchronously. Async errors are caught and surfaced via toast.
 *
 * The snippet body is wrapped in an async function whose parameters destructure
 * the sandbox + shadow risky globals — this avoids the (illegal-in-strict-mode)
 * `with` statement while still preventing access to host globals. Users may
 * `await` and `return` freely.
 */
export function runCellJs(
  code: string,
  ctx: { row: Record<string, unknown>; value: unknown; el?: HTMLElement | null },
): boolean {
  if (!code.trim()) return false;
  const helpers = buildHelpers();
  // Freeze the row so snippets can't mutate the underlying table state.
  const safeRow = Object.freeze({ ...ctx.row });

  // Param order: row, value, helpers, el, console, ...shadowed globals.
  // Every shadowed name becomes a local `undefined` binding, masking the
  // real host global from inside the function body.
  const paramNames = ["row", "value", "helpers", "el", "console", ...SHADOWED_GLOBALS];
  const args: unknown[] = [
    safeRow,
    ctx.value,
    helpers,
    ctx.el ?? null,
    { log: console.log, warn: console.warn, error: console.error },
    ...SHADOWED_GLOBALS.map(() => undefined),
  ];

  // `eval` and `Function` are reserved/structural identifiers in strict mode
  // and cannot legally be used as parameter names. Shadow them inside the
  // function body instead so user code still can't reach the host versions.
  // `import` is a statement keyword — `new Function` bodies can never contain
  // a real `import` declaration, so it needs no shadowing.
  const wrappedBody = `var eval = undefined, Function = undefined;\n${code}\n`;

  let fn: (...a: unknown[]) => Promise<unknown>;
  try {
    const AsyncFn = Object.getPrototypeOf(async function () {}).constructor;
    // Async function body — supports `await` natively. Strict mode is implicit.
    fn = new AsyncFn(...paramNames, wrappedBody) as typeof fn;
  } catch (e) {
    toast({
      title: "Snippet syntax error",
      description: e instanceof Error ? e.message : "Unknown error",
      variant: "destructive",
    });
    return false;
  }

  try {
    const result = fn(...args);
    if (result && typeof (result as Promise<unknown>).then === "function") {
      (result as Promise<unknown>).catch((e) => {
        toast({
          title: "Cell handler runtime error",
          description: e instanceof Error ? e.message : "Unknown error",
          variant: "destructive",
        });
      });
    }
    return true;
  } catch (e) {
    toast({
      title: "Cell handler runtime error",
      description: e instanceof Error ? e.message : "Unknown error",
      variant: "destructive",
    });
    return false;
  }
}
