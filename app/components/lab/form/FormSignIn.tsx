"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ComponentInstall } from "@/components/lab/ComponentInstall";
import { code, data } from "@/registry/form/form-sign-in";

export function FormSignIn() {
  const snippet = `const data = ${JSON.stringify(data, null, 2)};

<Card className="max-w-md">
  <CardHeader>
    <CardTitle>{data.title}</CardTitle>
    <CardDescription>{data.description}</CardDescription>
  </CardHeader>
  <CardContent className="space-y-4">
    {data.fields.map((field) => (
      <div key={field.id} className="space-y-2">
        <Label htmlFor={field.id}>{field.label}</Label>
        <Input id={field.id} type={field.type} placeholder={field.placeholder} />
      </div>
    ))}
    ...
  </CardContent>
  <CardFooter>
    <Button className="w-full">{data.submitText}</Button>
  </CardFooter>
</Card>`;

  return (
    <ComponentInstall category="form" variant="form-sign-in" title="Sign In Form" code={snippet} fullCode={code}>
      <Card className="max-w-md">
        <CardHeader>
          <CardTitle>{data.title}</CardTitle>
          <CardDescription>{data.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {data.fields.map((field) => (
            <div key={field.id} className="space-y-2">
              <Label htmlFor={`signin-${field.id}`}>{field.label}</Label>
              <Input id={`signin-${field.id}`} type={field.type} placeholder={field.placeholder} />
            </div>
          ))}
          <div className="flex items-center space-x-2">
            <Checkbox id={data.rememberId} />
            <Label htmlFor={data.rememberId}>{data.rememberLabel}</Label>
          </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full">{data.submitText}</Button>
        </CardFooter>
      </Card>
    </ComponentInstall>
  );
}
