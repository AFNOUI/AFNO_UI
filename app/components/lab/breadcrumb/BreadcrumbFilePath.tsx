"use client";

import React from "react";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { ComponentInstall } from "@/components/lab/ComponentInstall";
import { code, data } from "@/registry/breadcrumb/breadcrumb-file-path";

export function BreadcrumbFilePath() {
  const snippet = `const data = ${JSON.stringify(data, null, 2)};

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
</div>`;

  return (
    <ComponentInstall
      category="breadcrumb"
      variant="breadcrumb-file-path"
      title="File Path Style"
      code={snippet}
      fullCode={code}
    >
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
    </ComponentInstall>
  );
}
