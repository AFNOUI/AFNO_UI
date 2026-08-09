"use client";

/**
 * Dependency-injection seam for option loading.
 *
 * The field components are ENGINE files, so they cannot import a project's
 * HTTP client directly. Instead they read the transport out of context, and
 * the project supplies it from its VARIANT layer:
 *
 *   component  →  hooks.ts  →  services.ts
 *   (renders)     (adapter)    (transport)
 *
 * Without a provider the engine falls back to `fetch` + React state, which is
 * exactly what an install with no extra dependencies should do.
 *
 * See AI_AGENT_RULES § R-53 / § R-54.
 */
import { createContext, useContext, useMemo, type ReactNode } from "react";

import { fetchOptionsTransport } from "./defaultTransport";
import { localStateQueryAdapter } from "./localStateAdapter";
import type { FormTransport, OptionsQueryAdapter, OptionsTransport } from "./types";

/** Module-level constant: its `adapter` members are called as hooks. */
export const defaultFormTransport: FormTransport = {
  transport: fetchOptionsTransport,
  adapter: localStateQueryAdapter,
};

const FormTransportContext = createContext<FormTransport>(defaultFormTransport);

export interface FormTransportProviderProps {
  children: ReactNode;
  /** Sends requests. Defaults to the built-in `fetch` implementation. */
  transport?: OptionsTransport;
  /**
   * Caching / state strategy. Defaults to React state.
   *
   * MUST be a stable module-level value — it is invoked as a hook, so an
   * inline object literal would violate the rules of hooks on re-render.
   */
  adapter?: OptionsQueryAdapter;
}

export function FormTransportProvider({
  children,
  transport,
  adapter,
}: FormTransportProviderProps) {
  const value = useMemo<FormTransport>(
    () => ({
      transport: transport ?? defaultFormTransport.transport,
      adapter: adapter ?? defaultFormTransport.adapter,
    }),
    [transport, adapter],
  );

  return (
    <FormTransportContext.Provider value={value}>{children}</FormTransportContext.Provider>
  );
}

export function useFormTransport(): FormTransport {
  return useContext(FormTransportContext);
}
