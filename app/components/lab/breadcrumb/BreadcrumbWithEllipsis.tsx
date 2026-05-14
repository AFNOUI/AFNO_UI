"use client";

import React from "react";
import { Home, Folder, File } from "lucide-react";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbEllipsis,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ComponentInstall } from "@/components/lab/ComponentInstall";
import { code, data } from "@/registry/breadcrumb/breadcrumb-with-ellipsis";

export function BreadcrumbWithEllipsis() {
  const snippet = `const data = ${JSON.stringify(data, null, 2)};

<Breadcrumb>
  <BreadcrumbList>
    {data.map((item, index) => (
      <React.Fragment key={index}>
        {item.type === "link" && (
          <BreadcrumbItem>
            <BreadcrumbLink href={item.href}>
              {item.icon === "Home" && <Home className="h-4 w-4" />}
              {item.icon === "Folder" && <Folder className="me-1 h-4 w-4 inline" />}
              {item.text}
            </BreadcrumbLink>
          </BreadcrumbItem>
        )}
        {item.type === "ellipsis" && (
          <BreadcrumbItem>
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-1">
                <BreadcrumbEllipsis className="h-4 w-4" />
                <span className="sr-only">Toggle menu</span>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                {item.dropdownItems?.map((dropdownItem, idx) => (
                  <DropdownMenuItem key={idx}>
                    <Folder className="me-2 h-4 w-4" />
                    {dropdownItem.text}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </BreadcrumbItem>
        )}
        {item.type === "page" && (
          <BreadcrumbItem>
            <BreadcrumbPage>
              {item.icon === "File" && <File className="me-1 h-4 w-4 inline" />}
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
      variant="breadcrumb-with-ellipsis"
      title="With Ellipsis Dropdown"
      code={snippet}
      fullCode={code}
    >
      <Breadcrumb>
        <BreadcrumbList>
          {data.map((item, index) => (
            <React.Fragment key={index}>
              {item.type === "link" && (
                <BreadcrumbItem>
                  <BreadcrumbLink href={item.href}>
                    {item.icon === "Home" && <Home className="h-4 w-4" />}
                    {item.icon === "Folder" && <Folder className="me-1 h-4 w-4 inline" />}
                    {item.text}
                  </BreadcrumbLink>
                </BreadcrumbItem>
              )}
              {item.type === "ellipsis" && (
                <BreadcrumbItem>
                  <DropdownMenu>
                    <DropdownMenuTrigger className="flex items-center gap-1">
                      <BreadcrumbEllipsis className="h-4 w-4" />
                      <span className="sr-only">Toggle menu</span>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                      {item.dropdownItems?.map((dropdownItem, idx) => (
                        <DropdownMenuItem key={idx}>
                          <Folder className="me-2 h-4 w-4" />
                          {dropdownItem.text}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </BreadcrumbItem>
              )}
              {item.type === "page" && (
                <BreadcrumbItem>
                  <BreadcrumbPage>
                    {item.icon === "File" && <File className="me-1 h-4 w-4 inline" />}
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
