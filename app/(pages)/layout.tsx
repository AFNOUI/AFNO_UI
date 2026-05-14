import PagesLayout from "@/(pages)/pages-layout";

export default function Layout({ children }: { children: React.ReactNode }) {
  return <PagesLayout>{children}</PagesLayout>;
}
