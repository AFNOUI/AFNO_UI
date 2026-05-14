"use client";

import {
    Select,
    SelectItem,
    SelectValue,
    SelectContent,
    SelectTrigger,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button, type ButtonVariant } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { ComponentInstall } from "@/components/lab/ComponentInstall";
import { code, data } from "@/registry/card/card-basic";
import {
    Card,
    CardTitle,
    CardFooter,
    CardHeader,
    CardContent,
    CardDescription,
} from "@/components/ui/card";

export function CardBasic() {
    const snippet = `const data = ${JSON.stringify(data, null, 2)};

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
            {field.type === "select" ? (
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder={field.placeholder} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="next">Next.js</SelectItem>
                  <SelectItem value="vite">Vite</SelectItem>
                  <SelectItem value="remix">Remix</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <Input id={\`field-\${index}-\${i}\`} placeholder={field.placeholder} />
            )}
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
      {card.footer && (
        <CardFooter className="flex justify-between">
          {card.footer.buttons?.map((btn, i) => (
            <Button key={i} variant={btn.variant as ButtonVariant}>{btn.text}</Button>
          ))}
        </CardFooter>
      )}
    </Card>
  ))}
</div>`;

    return (
        <ComponentInstall category="card" variant="card-basic" title="Basic Card" code={snippet} fullCode={code}>
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
                                    <Label htmlFor={`field-${index}-${i}`}>{field.label}</Label>
                                    {field.type === "select" ? (
                                        <Select>
                                            <SelectTrigger>
                                                <SelectValue placeholder={field.placeholder} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="next">Next.js</SelectItem>
                                                <SelectItem value="vite">Vite</SelectItem>
                                                <SelectItem value="remix">Remix</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    ) : (
                                        <Input id={`field-${index}-${i}`} placeholder={field.placeholder} />
                                    )}
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
                        {card.footer && (
                            <CardFooter className="flex justify-between">
                                {card.footer.buttons?.map((btn, i) => (
                                    <Button key={i} variant={btn.variant as ButtonVariant}>{btn.text}</Button>
                                ))}
                            </CardFooter>
                        )}
                    </Card>
                ))}
            </div>
        </ComponentInstall>
    );
}