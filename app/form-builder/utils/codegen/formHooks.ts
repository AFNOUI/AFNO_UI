/**
 * Emits the generated `hooks.ts` (and its `constants.ts`) for a form bundle.
 *
 * The hook layer was missing before Wave-9: the generated page called
 * `formService.submitForm(...)` straight from the component, which broke
 * `component → hooks.ts → services.ts` (AI_AGENT_RULES § R-55).
 */
import {
  DEFAULT_TRANSPORT,
  cliGatedNote,
  emitConstantsFile,
  tanstackConstants,
  type ConstantsEntry,
  type TransportChoice,
} from "@/lib/codegen/transport";

/** R-57 — every knob this bundle exposes, in one file. */
export function generateFormConstantsCode(
  transport: TransportChoice = DEFAULT_TRANSPORT,
): string {
  const entries: ConstantsEntry[] = [
    { name: "API_BASE", value: '"/api"', doc: "Base URL every request in services.ts is built from." },
    { name: "SUBMIT_PATH", value: '"/forms/submit"', doc: "Appended to API_BASE when submitting this form." },
    {
      name: "BASE_HEADERS",
      value: "{} as Record<string, string>",
      doc: "Sent on every request. Add auth headers here.",
    },
  ];
  if (transport.query === "tanstack") entries.push(...tanstackConstants());
  return emitConstantsFile("this form", entries);
}

function hookDoc(transport: TransportChoice): string {
  return `/**
 * React glue between the form component and \`services.ts\`.
 *
 * Per AI_AGENT_RULES § R-55 this is the ONLY file that calls services — the
 * page never imports \`./services\` directly. Submit state, retries and cache
 * invalidation belong here; the request belongs in \`services.ts\`.
 *
 * Errors are deliberately left to propagate: \`formService.submitForm\` throws a
 * normalized \`BackendErrorResponse\`, which the form component already maps onto
 * field errors. Wrap the call in try/catch here if you want different handling
 * (custom error class, status-code mapping, toast).
 *
${cliGatedNote("query", transport)}
 */`;
}

export function generateFormHooksCode(
  transport: TransportChoice = DEFAULT_TRANSPORT,
): string {
  const doc = hookDoc(transport);

  if (transport.query === "tanstack") {
    // The ENGINE's async / infinite field components load options through the
    // OptionsQueryAdapter port. Supplying a react-query implementation here (and
    // mounting it via FormTransportProvider) is what makes `--tanstack-query`
    // cover option-loading too, not just submit (R-56).
    return `import { useMutation, useQuery, useInfiniteQuery } from "@tanstack/react-query";

import type { OptionsQueryAdapter } from "@/components/forms/transport/types";

import { formService } from "./services";
import { STALE_TIME_MS, GC_TIME_MS } from "./constants";

${doc}
export function useFormSubmit() {
  const mutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => formService.submitForm(data),
    gcTime: GC_TIME_MS,
  });

  // \`mutateAsync\` rethrows, so the normalized BackendErrorResponse still
  // reaches the form component exactly as it does without TanStack Query.
  return { submit: mutation.mutateAsync, submitting: mutation.isPending };
}

/**
 * react-query implementation of the engine's option-loading port.
 *
 * MUST stay a module-level constant — its members are called as hooks, so
 * rebuilding it per render would violate the rules of hooks.
 */
export const optionsQueryAdapter: OptionsQueryAdapter = {
  useAsyncQuery({ key, enabled, run }) {
    const { data, isPending, error } = useQuery({
      queryKey: key,
      queryFn: ({ signal }) => run(signal),
      enabled,
      staleTime: STALE_TIME_MS,
      gcTime: GC_TIME_MS,
    });
    return {
      data,
      isLoading: enabled ? isPending : false,
      error: (error as Error | null) ?? null,
    };
  },

  useInfiniteQuery({ key, enabled, run }) {
    const query = useInfiniteQuery({
      queryKey: key,
      queryFn: ({ pageParam, signal }) => run(pageParam as number, signal),
      initialPageParam: 1,
      getNextPageParam: (last) => (last.hasMore ? last.page + 1 : undefined),
      enabled,
      staleTime: STALE_TIME_MS,
      gcTime: GC_TIME_MS,
    });
    return {
      pages: query.data?.pages ?? [],
      isLoading: query.isPending,
      isFetchingNextPage: query.isFetchingNextPage,
      hasNextPage: !!query.hasNextPage,
      fetchNextPage: () => {
        void query.fetchNextPage();
      },
    };
  },
};
`;
  }

  return `import { useCallback, useState } from "react";

import { formService } from "./services";

${doc}
export function useFormSubmit() {
  const [submitting, setSubmitting] = useState(false);

  const submit = useCallback(async (data: Record<string, unknown>): Promise<void> => {
    setSubmitting(true);
    try {
      await formService.submitForm(data);
    } finally {
      setSubmitting(false);
    }
  }, []);

  return { submit, submitting };
}
`;
}
