import { createContext, useContext, type ReactNode } from "react";

import { useTanstackForm } from "./useTanstackForm";

export interface TanstackFormContextValue {
  values: Record<string, unknown>;
  form: ReturnType<typeof useTanstackForm>["form"];
}

const TanstackFormContext = createContext<TanstackFormContextValue>(null!);

export function TanstackFormProvider({ children, value }: { children: ReactNode; value: TanstackFormContextValue }) {
  return <TanstackFormContext.Provider value={value}>{children}</TanstackFormContext.Provider>;
}

export function useTanstackFormContext() {
  const ctx = useContext(TanstackFormContext);
  if (!ctx) throw new Error("useTanstackFormContext must be used within TanstackFormProvider");
  return ctx;
}
