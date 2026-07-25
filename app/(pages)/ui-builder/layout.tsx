import type { Metadata } from "next";

import { routeMeta } from "@/lib/seo";

// UI Builder is not complete yet: keep the page reachable but tell search
// engines not to index it. Remove the `robots` override when it ships.
export const metadata: Metadata = {
  ...routeMeta("/ui-builder"),
  robots: { index: false, follow: true },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
