
export const data = [
  { type: "link" as const, href: "/", text: "Home", icon: "Home" },
  { type: "link" as const, href: "/settings", text: "Settings", icon: "Settings" },
  { type: "page" as const, text: "Profile", icon: "User" },
];

export const code = `import React from "react";
import { Home, Settings, User } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

const data = ${JSON.stringify(data, null, 2)};

export default function BreadcrumbWithIconsExample() {
  return (
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
  );
}`;
