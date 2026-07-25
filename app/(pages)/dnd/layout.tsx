import type { Metadata } from "next";

import { routeMeta } from "@/lib/seo";

import { DndChrome } from "./DndChrome";

export const metadata: Metadata = routeMeta("/dnd");

export default function Layout({ children }: { children: React.ReactNode }) {
  return <DndChrome>{children}</DndChrome>;
}
