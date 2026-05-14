import { createContext, useContext, type ReactNode } from "react";

export interface ActionFormContextValue {
  values: Record<string, unknown>;
  errors: Record<string, string[]>;
  setValue: (name: string, value: unknown) => void;
  setValues: (values: Record<string, unknown>) => void;
  watch: (name: string) => unknown;
}

const ActionFormContext = createContext<ActionFormContextValue>(null!);

export function ActionFormProvider({ children, value }: { children: ReactNode; value: ActionFormContextValue }) {
  return <ActionFormContext.Provider value={value}>{children}</ActionFormContext.Provider>;
}

export function useActionFormContext() {
  const ctx = useContext(ActionFormContext);
  if (!ctx) throw new Error("useActionFormContext must be used within ActionFormProvider");
  return ctx;
}
