export const data = {
  label: "Select Theme",
  options: [
    { value: "light", icon: "Sun", label: "Light" },
    { value: "dark", icon: "Moon", label: "Dark" },
    { value: "system", icon: "Laptop", label: "System" },
  ],
};

export const code = `import React, { useState } from "react";
import { Sun, Moon, Laptop } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

const data = ${JSON.stringify(data, null, 2)};

export default function DropdownRadioItemsExample() {
  const [theme, setTheme] = useState("system");
  const icons = { Sun, Moon, Laptop };
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          {theme === "light" && <Sun className="me-2 h-4 w-4" />}
          {theme === "dark" && <Moon className="me-2 h-4 w-4" />}
          {theme === "system" && <Laptop className="me-2 h-4 w-4" />}
          Theme
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-48">
        <DropdownMenuLabel>{data.label}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup value={theme} onValueChange={setTheme}>
          {data.options.map((opt) => {
            const Icon = icons[opt.icon as keyof typeof icons];
            return (
              <DropdownMenuRadioItem key={opt.value} value={opt.value}>
                {Icon && <Icon className="me-2 h-4 w-4" />}
                {opt.label}
              </DropdownMenuRadioItem>
            );
          })}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
`;
