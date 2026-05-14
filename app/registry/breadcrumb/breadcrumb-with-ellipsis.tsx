
export const data = [
  { type: "link" as const, href: "#", icon: "Home" },
  {
    type: "ellipsis" as const,
    dropdownItems: [
      { icon: "Folder", text: "Documents" },
      { icon: "Folder", text: "Projects" },
      { icon: "Folder", text: "2024" },
    ],
  },
  { type: "link" as const, href: "#", text: "Q4 Reports", icon: "Folder" },
  { type: "page" as const, text: "summary.pdf", icon: "File" },
];

export const code = `import React from "react";
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

const data = ${JSON.stringify(data, null, 2)};

export default function BreadcrumbWithEllipsisExample() {
  return (
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
  );
}`;
