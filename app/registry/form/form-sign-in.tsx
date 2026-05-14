export const data = {
  title: "Sign In",
  description: "Enter your credentials to access your account.",
  fields: [
    { id: "email", label: "Email", type: "email", placeholder: "you@example.com" },
    { id: "password", label: "Password", type: "password", placeholder: "••••••••" },
  ],
  rememberId: "remember",
  rememberLabel: "Remember me",
  submitText: "Sign In",
};

const dataStr = JSON.stringify(data, null, 2);
export const code = `import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

const data = ${dataStr};

export default function FormSignInExample() {
  return (
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
        <div className="flex items-center space-x-2">
          <Checkbox id={data.rememberId} />
          <Label htmlFor={data.rememberId}>{data.rememberLabel}</Label>
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full">{data.submitText}</Button>
      </CardFooter>
    </Card>
  );
}
`;