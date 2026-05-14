import type { Metadata } from "next";

import "./globals.css";

import { QueryProvider } from "./providers/QueryProvider";
import { RtlLayoutProvider } from "./providers/RtlLayoutProvide";
import { I18nProviderWrapper } from "./providers/I18nextProvider";
import { RootThemeProvider } from "./providers/RootThemeProvider";

import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster as Sonner } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "UI LAB",
  description: "Created by TEKINA",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <QueryProvider>
          <RootThemeProvider>
            <TooltipProvider>
              <RtlLayoutProvider>
                <Toaster />
                <Sonner />
                <I18nProviderWrapper>
                  {children}
                </I18nProviderWrapper>
              </RtlLayoutProvider>
            </TooltipProvider>
          </RootThemeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
