
export const data = [
  { type: "link", href: "#", text: "Dashboard" },
  { type: "link", href: "#", text: "Analytics" },
  { type: "page", text: "Overview" },
];

export const code = `import React from "react";
import { Slash } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

const data = ${JSON.stringify(data, null, 2)};

export default function BreadcrumbCustomSeparatorExample() {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        {data.map((item, index) => (
          <React.Fragment key={index}>
            {item.type === "link" ? (
              <BreadcrumbItem>
                <BreadcrumbLink href={item.href}>{item.text}</BreadcrumbLink>
              </BreadcrumbItem>
            ) : (
              <BreadcrumbItem>
                <BreadcrumbPage>{item.text}</BreadcrumbPage>
              </BreadcrumbItem>
            )}
            {index < data.length - 1 && (
              <BreadcrumbSeparator>
                <Slash className="h-4 w-4" />
              </BreadcrumbSeparator>
            )}
          </React.Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}`;
