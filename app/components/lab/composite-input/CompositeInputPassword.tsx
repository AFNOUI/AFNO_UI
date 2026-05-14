"use client";

import  { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ComponentInstall } from "@/components/lab/ComponentInstall";
import { code, data } from "@/registry/composite-input/composite-input-password";

export function CompositeInputPassword() {
    const [showPassword, setShowPassword] = useState(false);

    const snippet = `const data = ${JSON.stringify(data, null, 2)};

const [showPassword, setShowPassword] = useState(false);

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
</div>`;

    return (
        <ComponentInstall category="composite-input" variant="composite-input-password" title="Password with Toggle" code={snippet} fullCode={code}>
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
        </ComponentInstall>
    );
}