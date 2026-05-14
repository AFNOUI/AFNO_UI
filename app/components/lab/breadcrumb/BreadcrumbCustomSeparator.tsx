"use client";

import React from "react";
import { Slash } from "lucide-react";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { ComponentInstall } from "@/components/lab/ComponentInstall";
import { code, data } from "@/registry/breadcrumb/breadcrumb-custom-separator";

export function BreadcrumbCustomSeparator() {
  const snippet = `const data = ${JSON.stringify(data, null, 2)};

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
</Breadcrumb>`;

  return (
    <ComponentInstall
      category="breadcrumb"
      variant="breadcrumb-custom-separator"
      title="Custom Separator"
      code={snippet}
      fullCode={code}
    >
      <Breadcrumb>
        <BreadcrumbList>
          {data.map((item, index) => (
            <React.Fragment key={index}>
              {item.type === "link" ? (
                <BreadcrumbItem>
                  <BreadcrumbLink href="#">{item.text}</BreadcrumbLink>
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
    </ComponentInstall>
  );
}
