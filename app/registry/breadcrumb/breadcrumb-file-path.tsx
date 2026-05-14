
export const data = [
  { type: "link", href: "#", text: "src" },
  { type: "link", href: "#", text: "components" },
  { type: "link", href: "#", text: "ui" },
  { type: "page", text: "breadcrumb.tsx" },
];

export const code = `import React from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

const data = ${JSON.stringify(data, null, 2)};

export default function BreadcrumbFilePathExample() {
  return (
    <div className="rounded-md bg-muted px-3 py-2 font-mono text-sm">
      <Breadcrumb>
        <BreadcrumbList>
          {data.map((item, index) => (
            <React.Fragment key={index}>
              {item.type === "link" ? (
                <BreadcrumbItem>
                  <BreadcrumbLink href={item.href} className="text-muted-foreground hover:text-foreground">
                    {item.text}
                  </BreadcrumbLink>
                </BreadcrumbItem>
              ) : (
                <BreadcrumbItem>
                  <BreadcrumbPage className="text-primary">{item.text}</BreadcrumbPage>
                </BreadcrumbItem>
              )}
              {index < data.length - 1 && (
                <BreadcrumbSeparator>
                  <span className="text-muted-foreground">/</span>
                </BreadcrumbSeparator>
              )}
            </React.Fragment>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
}`;
