export const data = [
  { value: "john", name: "John Doe", email: "john@example.com", avatar: "JD" },
  { value: "jane", name: "Jane Smith", email: "jane@example.com", avatar: "JS" },
  { value: "bob", name: "Bob Wilson", email: "bob@example.com", avatar: "BW" },
  { value: "alice", name: "Alice Brown", email: "alice@example.com", avatar: "AB" },
];

export const code = `import React, { useState } from "react";
import { User } from "lucide-react";
import {
  Combobox,
  ComboboxList,
  ComboboxItem,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxGroup,
  ComboboxTrigger,
  ComboboxContent,
} from "@/components/ui/combobox";

const data = ${JSON.stringify(data, null, 2)};

export default function ComboboxUserExample() {
  const [selectedUser, setSelectedUser] = useState("");

  return (
    <Combobox value={selectedUser} onValueChange={setSelectedUser}>
      <ComboboxTrigger className="w-[280px]">
          {selectedUser ? (
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-medium">
                {data.find(u => u.value === selectedUser)?.avatar}
              </div>
              <span>{data.find(u => u.value === selectedUser)?.name}</span>
            </div>
          ) : (
            <p className="flex items-center gap-2">
              <User className="me-2 h-4 w-4 opacity-50" />
              <span>Assign to...</span>
            </p>
          )}
        </ComboboxTrigger>
      <ComboboxContent className="w-[280px]">
        <ComboboxInput placeholder="Search users..." />
        <ComboboxList>
          <ComboboxEmpty>No user found.</ComboboxEmpty>
          <ComboboxGroup>
            {data.map((user) => (
              <ComboboxItem key={user.value} value={user.value}>
                <div className="flex items-center gap-3">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-muted text-[10px] font-medium">
                    {user.avatar}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{user.name}</span>
                    <span className="text-xs text-muted-foreground">{user.email}</span>
                  </div>
                </div>
              </ComboboxItem>
            ))}
          </ComboboxGroup>
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}
`;