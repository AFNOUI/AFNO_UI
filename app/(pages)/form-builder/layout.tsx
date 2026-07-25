import type { Metadata } from "next";

import { routeMeta } from "@/lib/seo";

export const metadata: Metadata = routeMeta("/form-builder");

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
