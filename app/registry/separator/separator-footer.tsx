export const data = {
  links: ["About", "Blog", "Careers", "Privacy", "Terms"] as const,
};

const dataStr = JSON.stringify(data, null, 2);

export const code = `"use client";

import Link from "next/link";
import { Separator } from "@/components/ui/separator";

const data = ${dataStr};

export default function SeparatorFooterExample() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2 text-sm text-muted-foreground">
      {data.links.map((link, i) => (
        <span key={link}>
          {i > 0 && <Separator orientation="vertical" className="h-4" />}
          <Link href="#" className="hover:text-foreground transition-colors">
            {link}
          </Link>
        </span>
      ))}
    </div>
  );
}
`;
