
export const data = [
  { variant: "default" as const, text: "Default" },
  { variant: "secondary" as const, text: "Secondary" },
  { variant: "destructive" as const, text: "Destructive" },
  { variant: "outline" as const, text: "Outline" },
  { variant: "ghost" as const, text: "Ghost" },
  { variant: "link" as const, text: "Link" },
];

const dataStr = JSON.stringify(data, null, 2);
export const code = `import { Button } from "@/components/ui/button";

const data = ${dataStr} as const;

export default function ButtonVariantsExample() {
  return (
    <div className="flex flex-wrap gap-3">
      {data.map((item, index) => (
        <Button key={index} variant={item.variant}>{item.text}</Button>
      ))}
    </div>
  );
}`;
