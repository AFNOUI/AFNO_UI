import type { Metadata } from "next";

import { routeMeta } from "@/lib/seo";

export const metadata: Metadata = routeMeta("/forms");

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
