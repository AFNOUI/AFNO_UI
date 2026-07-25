import type { Metadata } from "next";

import { routeMeta } from "@/lib/seo";

// Dashboard is not complete yet: keep the page reachable but tell search
// engines not to index it. Remove the `robots` override when it ships.
export const metadata: Metadata = {
  ...routeMeta("/dashboard"),
  robots: { index: false, follow: true },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
