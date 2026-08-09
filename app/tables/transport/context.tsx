"use client";

/**
 * Dependency-injection seam for table row actions.
 *
 * `TablePreview` is an ENGINE file, so it cannot import a project's HTTP
 * client or notification system. Both arrive through this context, supplied by
 * the variant layer:
 *
 *   component  →  hooks.ts  →  services.ts
 *   (renders)     (state)      (transport)
 *
 * With no provider the engine falls back to `fetch` + the bundled toast, which
 * is what an install with no extra dependencies should do.
 *
 * See AI_AGENT_RULES § R-53 / § R-54.
 */
import { createContext, useContext, useMemo, type ReactNode } from "react";

import { toast } from "@/hooks/use-toast";
import { fetchTableTransport } from "./defaultTransport";
import type { TableNotifier, TableTransport, TableTransportValue } from "./types";

const defaultNotifier: TableNotifier = (notification) => {
  toast({
    title: notification.title,
    variant: notification.variant,
    description: notification.description,
  });
};

export const defaultTableTransport: TableTransportValue = {
  notify: defaultNotifier,
  transport: fetchTableTransport,
};

const TableTransportContext = createContext<TableTransportValue>(defaultTableTransport);

export interface TableTransportProviderProps {
  children: ReactNode;
  /** Surfaces success / failure. Defaults to the bundled toast. */
  notify?: TableNotifier;
  /** Sends row-action requests. Defaults to the built-in `fetch` transport. */
  transport?: TableTransport;
}

export function TableTransportProvider({
  notify,
  children,
  transport,
}: TableTransportProviderProps) {
  const value = useMemo<TableTransportValue>(
    () => ({
      notify: notify ?? defaultTableTransport.notify,
      transport: transport ?? defaultTableTransport.transport,
    }),
    [transport, notify],
  );

  return (
    <TableTransportContext.Provider value={value}>{children}</TableTransportContext.Provider>
  );
}

export function useTableTransport(): TableTransportValue {
  return useContext(TableTransportContext);
}
