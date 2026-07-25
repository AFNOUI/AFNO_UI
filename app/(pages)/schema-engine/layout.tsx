import type { Metadata } from "next";

import { routeMeta } from "@/lib/seo";

export const metadata: Metadata = routeMeta("/schema-engine");

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
