import type { Metadata } from "next";

import { routeMeta, buildToolJsonLd } from "@/lib/seo";
import { JsonLd } from "@/components/shared/JsonLd";

export const metadata: Metadata = routeMeta("/tree-builder");

/** Page-level structured data: SoftwareApplication + HowTo + FAQ + breadcrumb. */
const jsonLd = buildToolJsonLd("/tree-builder");

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd data={jsonLd} />
      {children}
    </>
  );
}
