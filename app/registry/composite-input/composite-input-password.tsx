export const data = {
  defaultPassword: "supersecret123",
  placeholder: "Enter password",
};

export const code = `import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const data = ${JSON.stringify(data, null, 2)};

export default function CompositeInputPasswordExample() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="max-w-sm space-y-2">
      <Label>Password</Label>
      <div className="relative">
        <Input
          type={showPassword ? "text" : "password"}
          placeholder={data.placeholder}
          defaultValue={data.defaultPassword}
        />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
          onClick={() => setShowPassword(!showPassword)}
        >
          {showPassword ? (
            <EyeOff className="h-4 w-4 text-muted-foreground" />
          ) : (
            <Eye className="h-4 w-4 text-muted-foreground" />
          )}
        </Button>
      </div>
    </div>
  );
}
`;