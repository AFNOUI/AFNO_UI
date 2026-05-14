"use client";

import { ThemeProvider } from "@/contexts/ThemeContext";

export function RootThemeProvider({ children }: { children: React.ReactNode }) {
  return <ThemeProvider>{children}</ThemeProvider>;
}
