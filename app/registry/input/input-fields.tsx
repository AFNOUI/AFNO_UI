export const data = {
  fields: [
    { id: "email", label: "Email", type: "email", placeholder: "you@example.com" },
    { id: "password", label: "Password", type: "password", placeholder: "••••••••" },
    { id: "disabled", label: "Disabled", disabled: true, placeholder: "Disabled input" },
  ],
  textarea: { id: "textarea", label: "Message", placeholder: "Type your message here..." },
};

const dataStr = JSON.stringify(data, null, 2);
export const code =
  'import React from "react";\n' +
  'import { Input } from "@/components/ui/input";\n' +
  'import { Label } from "@/components/ui/label";\n' +
  'import { Textarea } from "@/components/ui/textarea";\n\n' +
  "const data = " +
  dataStr +
  ";\n\n" +
  "export default function InputFieldsExample() {\n" +
  "  return (\n" +
  '    <div className="space-y-4 max-w-md">\n' +
  "      {data.fields.map((field) => (\n" +
  '        <div key={field.id} className="space-y-2">\n' +
  "          <Label htmlFor={field.id}>{field.label}</Label>\n" +
  "          <Input\n" +
  "            id={field.id}\n" +
  "            type={field.type}\n" +
  "            placeholder={field.placeholder}\n" +
  "            disabled={field.disabled}\n" +
  "          />\n" +
  "        </div>\n" +
  "      ))}\n" +
  '      <div className="space-y-2">\n' +
  "        <Label htmlFor={data.textarea.id}>{data.textarea.label}</Label>\n" +
  "        <Textarea id={data.textarea.id} placeholder={data.textarea.placeholder} />\n" +
  "      </div>\n" +
  "    </div>\n" +
  "  );\n" +
  "}\n";