/**
 * Transport contracts for table row actions.
 *
 * ENGINE-OWNED and dependency-free. Mirrors the forms transport seam so both
 * engines are reasoned about the same way: the engine builds a request and
 * tracks state, the project's `services.ts` decides how it is sent.
 *
 * No HTTP client may be imported here — see AI_AGENT_RULES § R-53.
 */

/** A library-agnostic description of one row-action request. */
export interface TableRequest {
  url: string;
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  headers?: Record<string, string>;
  /** Serialized JSON body. `undefined` for GET / DELETE without a body. */
  body?: string;
  /** `METHOD /interpolated/path` — the human-readable label used in toasts. */
  label: string;
}

export interface RowActionResult {
  ok: boolean;
  status: number;
  error?: Error;
  /** Method + interpolated path — handy for toast messages. */
  label: string;
}

/**
 * Sends one row-action request.
 *
 * Implemented in the VARIANT layer (`services.ts`) so projects can use axios,
 * attach auth headers, or route through their own API client. The engine ships
 * a `fetch` implementation as the default.
 */
export type TableTransport = (request: TableRequest) => Promise<RowActionResult>;

export interface TableNotification {
  title: string;
  description?: string;
  variant?: "default" | "destructive";
}

/**
 * How the engine surfaces row-action success / failure.
 *
 * Defaults to the bundled toast. Projects that use a different notification
 * system (or want silence) override it rather than editing the engine.
 */
export type TableNotifier = (notification: TableNotification) => void;

export interface TableTransportValue {
  transport: TableTransport;
  notify: TableNotifier;
}
