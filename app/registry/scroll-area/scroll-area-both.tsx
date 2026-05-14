export const data = { rowCount: 15 };

const dataStr = JSON.stringify(data, null, 2);

export const code = `"use client";

import { Badge } from "@/components/ui/badge";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

const data = ${dataStr};

export default function ScrollAreaBothExample() {
  return (
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
  );
}
`;
