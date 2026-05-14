export const codeBlock = `import { useState, useEffect } from 'react';

interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'guest';
}

function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchUsers() {
      try {
        const response = await fetch('/api/users');
        const data = await response.json();
        setUsers(data);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    }

    fetchUsers();
  }, []);

  return { users, loading, error };
}

export default useUsers;`;

export const data = { codeBlock };

export const code = `"use client";

import { ScrollArea } from "@/components/ui/scroll-area";

const codeBlock = ${JSON.stringify(codeBlock)};

export default function ScrollAreaCodeBlockExample() {
  return (
    <ScrollArea className="h-[200px] w-full max-w-lg rounded-md border bg-muted/50">
      <pre className="p-4 text-sm font-mono">
        <code>${"{"}codeBlock${"}"}</code>
      </pre>
    </ScrollArea>
  );
}
`;
