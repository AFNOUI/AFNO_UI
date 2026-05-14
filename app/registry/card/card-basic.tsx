export const data = [
  {
    title: "Create Project",
    description: "Deploy your new project in one-click.",
    type: "form",
    content: {
      fields: [
        { label: "Name", placeholder: "Project name", type: "input" },
        { label: "Framework", placeholder: "Select", type: "select" },
      ],
    },
    footer: {
      buttons: [
        { text: "Cancel", variant: "outline" as const },
        { text: "Deploy", variant: "default" as const },
      ],
    },
  },
  {
    title: "Notifications",
    description: "Manage your notification settings.",
    type: "settings",
    content: {
      settings: [
        { label: "Push Notifications", description: "Receive push notifications", defaultChecked: true },
        { label: "Email Notifications", description: "Receive email updates", defaultChecked: false },
      ],
    },
  },
];

const dataStr = JSON.stringify(data, null, 2);
export const code = `import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardTitle,
  CardFooter,
  CardHeader,
  CardContent,
  CardDescription,
} from "@/components/ui/card";

const data = ${dataStr} as const;

export default function CardBasicExample() {
  return (
    <div className="grid gap-6 md:grid-cols-2 max-w-2xl">
      {data.map((card, index) => (
        <Card key={index}>
          <CardHeader>
            <CardTitle>{card.title}</CardTitle>
            <CardDescription>{card.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {card.type === "form" && card.content?.fields?.map((field, i) => (
              <div key={i} className="space-y-2">
                <Label htmlFor={\`field-\${index}-\${i}\`}>{field.label}</Label>
                <Input id={\`field-\${index}-\${i}\`} placeholder={field.placeholder} />
              </div>
            ))}
            {card.type === "settings" && card.content?.settings?.map((setting, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>{setting.label}</Label>
                  <p className="text-sm text-muted-foreground">{setting.description}</p>
                </div>
                <Switch defaultChecked={setting.defaultChecked} />
              </div>
            ))}
          </CardContent>
          {card.type === "form" && "footer" in card && card.footer && (
            <CardFooter className="flex justify-between">
              {card.footer.buttons?.map((btn: { text: string; variant: "default" | "secondary" | "destructive" | "outline" | "ghost" | "link" }, i: number) => (
                <Button key={i} variant={btn.variant}>{btn.text}</Button>
              ))}
            </CardFooter>
          )}
        </Card>
      ))}
    </div>
  );
}
`;