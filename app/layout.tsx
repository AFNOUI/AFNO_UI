import type { Metadata } from "next";

import "./globals.css";

import AppLayout from "@/app-layout";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { I18nProviderWrapper } from "./providers/I18nextProvider";

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
    <html lang="en">
      <body>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <I18nProviderWrapper>
            <AppLayout>
              {children}
            </AppLayout>
          </ I18nProviderWrapper>
        </TooltipProvider>
      </body>
    </html>
  );
}
