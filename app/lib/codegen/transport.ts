/**
 * Shared transport-choice contract for every variant generator.
 *
 * BUILDER-ONLY — this file is not registered in any registry generator and
 * never ships to a consumer project. It exists so the four code generators
 * (tables / kanban / tree / forms) describe the axios / TanStack opt-ins the
 * same way instead of each inventing its own flags.
 *
 * See AI_AGENT_RULES § R-56 (CLI-gated opt-ins) and § R-57 (tunables live in
 * the generated `constants.ts`).
 */

/** Which HTTP client the generated `services.ts` is written against. */
export type HttpClient = "fetch" | "axios";

/** Which caching / state strategy the generated `hooks.ts` is written against. */
export type QueryStrategy = "local" | "tanstack";

export interface TransportChoice {
  http: HttpClient;
  query: QueryStrategy;
}

/**
 * What a plain `afnoui add <variant>` produces: zero transport dependencies.
 * The axios / TanStack code paths still exist — they are *selected* by a CLI
 * flag, never hand-written (R-56).
 */
export const DEFAULT_TRANSPORT: TransportChoice = { http: "fetch", query: "local" };

/** npm packages a given choice requires, in the order the CLI should install them. */
export function transportNpmDependencies(choice: TransportChoice): string[] {
  const deps: string[] = [];
  if (choice.http === "axios") deps.push("axios");
  if (choice.query === "tanstack") deps.push("@tanstack/react-query");
  return deps;
}

/** `--axios --tanstack-query` — the flags that reproduce a given choice. */
export function transportFlags(choice: TransportChoice): string[] {
  const flags: string[] = [];
  if (choice.http === "axios") flags.push("--axios");
  if (choice.query === "tanstack") flags.push("--tanstack-query");
  return flags;
}

/** True when the choice is the zero-dependency default. */
export function isDefaultTransport(choice: TransportChoice): boolean {
  return choice.http === DEFAULT_TRANSPORT.http && choice.query === DEFAULT_TRANSPORT.query;
}

/**
 * The `TODO(cli-gated)` banner that marks generated code as flag-selected.
 *
 * Every axios / TanStack block carries one so it is obvious the code is inert
 * until the CLI installs it — and, conversely, that the fetch/local default is
 * not the only option available.
 */
export function cliGatedNote(
  kind: "http" | "query",
  choice: TransportChoice,
): string {
  if (kind === "http") {
    return choice.http === "axios"
      ? " * Generated for axios because this variant was installed with `--axios`.\n" +
          " * Re-install without the flag to go back to the dependency-free `fetch` version."
      : " * TODO(cli-gated): re-install with `--axios` to generate this on top of axios\n" +
          " * instead of fetch. Until then no HTTP dependency is installed.";
  }
  return choice.query === "tanstack"
    ? " * Generated for TanStack Query because this variant was installed with `--tanstack-query`.\n" +
        " * Re-install without the flag to go back to the dependency-free React-state version."
    : " * TODO(cli-gated): re-install with `--tanstack-query` to generate this on top of\n" +
        " * TanStack Query. Until then no data-fetching dependency is installed.";
}

export interface ConstantsEntry {
  name: string;
  value: string;
  doc: string;
}

/**
 * Renders the variant's `constants.ts` (R-57).
 *
 * Every knob a user realistically re-tunes lives here — cache windows, base
 * URL, headers, page size, debounce — so configuring a variant never means
 * reading generated logic.
 */
export function emitConstantsFile(
  title: string,
  entries: ConstantsEntry[],
): string {
  const body = entries
    .map((e) => `/** ${e.doc} */\nexport const ${e.name} = ${e.value};`)
    .join("\n\n");

  return `/**
 * Tunables for ${title}.
 *
 * Every knob this variant exposes lives here (AI_AGENT_RULES § R-57), so
 * \`hooks.ts\` and \`services.ts\` stay free of magic numbers and you only have
 * one file to edit when a base URL, page size or cache window changes.
 */

${body}
`;
}

/** Cache-window entries, emitted only when the TanStack adapter is generated. */
export function tanstackConstants(): ConstantsEntry[] {
  return [
    {
      name: "STALE_TIME_MS",
      value: "5 * 60 * 1000",
      doc: "How long fetched data stays fresh before TanStack Query refetches it.",
    },
    {
      name: "GC_TIME_MS",
      value: "10 * 60 * 1000",
      doc: "How long unused cache entries are retained before garbage collection.",
    },
  ];
}
