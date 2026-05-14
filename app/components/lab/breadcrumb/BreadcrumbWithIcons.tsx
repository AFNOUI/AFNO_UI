"use client";

import React from "react";
import { Home, Settings, User } from "lucide-react";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { ComponentInstall } from "@/components/lab/ComponentInstall";
import { code, data } from "@/registry/breadcrumb/breadcrumb-with-icons";

export function BreadcrumbWithIcons() {
  const snippet = `const data = ${JSON.stringify(data, null, 2)};

<Breadcrumb>
  <BreadcrumbList>
    {data.map((item, index) => (
      <React.Fragment key={index}>
        {item.type === "link" ? (
          <BreadcrumbItem>
            <BreadcrumbLink href={item.href} className="flex items-center gap-1">
              {item.icon === "Home" && <Home className="h-4 w-4" />}
              {item.icon === "Settings" && <Settings className="h-4 w-4" />}
              {item.text}
            </BreadcrumbLink>
          </BreadcrumbItem>
        ) : (
          <BreadcrumbItem>
            <BreadcrumbPage className="flex items-center gap-1">
              {item.icon === "User" && <User className="h-4 w-4" />}
              {item.text}
            </BreadcrumbPage>
          </BreadcrumbItem>
        )}
        {index < data.length - 1 && <BreadcrumbSeparator />}
      </React.Fragment>
    ))}
  </BreadcrumbList>
</Breadcrumb>`;

  return (
    <ComponentInstall
      category="breadcrumb"
      variant="breadcrumb-with-icons"
      title="With Icons"
      code={snippet}
      fullCode={code}
    >
      <Breadcrumb>
        <BreadcrumbList>
          {data.map((item, index) => (
            <React.Fragment key={index}>
              {item.type === "link" ? (
                <BreadcrumbItem>
                  <BreadcrumbLink href={item.href} className="flex items-center gap-1">
                    {item.icon === "Home" && <Home className="h-4 w-4" />}
                    {item.icon === "Settings" && <Settings className="h-4 w-4" />}
                    {item.text}
                  </BreadcrumbLink>
                </BreadcrumbItem>
              ) : (
                <BreadcrumbItem>
                  <BreadcrumbPage className="flex items-center gap-1">
                    {item.icon === "User" && <User className="h-4 w-4" />}
                    {item.text}
                  </BreadcrumbPage>
                </BreadcrumbItem>
              )}
              {index < data.length - 1 && <BreadcrumbSeparator />}
            </React.Fragment>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
    </ComponentInstall>
  );
}
