
export const data = [
  { type: "link", href: "/", text: "Home" },
  { type: "link", href: "/components", text: "Components" },
  { type: "page", text: "Breadcrumb" },
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

export default function BreadcrumbBasicExample() {
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
            {index < data.length - 1 && <BreadcrumbSeparator />}
          </React.Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}`;
