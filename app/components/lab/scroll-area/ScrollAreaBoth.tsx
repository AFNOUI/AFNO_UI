"use client";

import { Badge } from "@/components/ui/badge";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { ComponentInstall } from "@/components/lab/ComponentInstall";
import { code, data } from "@/registry/scroll-area/scroll-area-both";

export function ScrollAreaBoth() {
  return (
    <ComponentInstall
      category="scroll-area"
      variant="scroll-area-both"
      title="Both Directions"
      code={`const data = ${JSON.stringify(data, null, 2)};\n\n<ScrollArea><ScrollBar orientation="horizontal" /></ScrollArea>`}
      fullCode={code}
    >
      <ScrollArea className="h-[200px] w-[350px] rounded-md border">
        <div className="p-4">
          <table className="w-[500px]">
            <thead>
              <tr className="border-b">
                <th className="text-start p-2 font-medium">ID</th>
                <th className="text-start p-2 font-medium">Name</th>
                <th className="text-start p-2 font-medium">Email</th>
                <th className="text-start p-2 font-medium">Status</th>
                <th className="text-start p-2 font-medium">Role</th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: data.rowCount }).map((_, i) => (
                <tr key={i} className="border-b">
                  <td className="p-2 text-sm">{i + 1}</td>
                  <td className="p-2 text-sm">User {i + 1}</td>
                  <td className="p-2 text-sm">user{i + 1}@example.com</td>
                  <td className="p-2">
                    <Badge variant={i % 2 === 0 ? "default" : "secondary"}>
                      {i % 2 === 0 ? "Active" : "Inactive"}
                    </Badge>
                  </td>
                  <td className="p-2 text-sm">{i % 3 === 0 ? "Admin" : "User"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </ComponentInstall>
  );
}
