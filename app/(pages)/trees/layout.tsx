import type { Metadata } from "next";

import { routeMeta } from "@/lib/seo";

export const metadata: Metadata = routeMeta("/trees");

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
