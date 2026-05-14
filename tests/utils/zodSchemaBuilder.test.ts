import { describe, expect, it } from "vitest";

import {
  buildZodSchema,
  evaluateCondition,
  extractFields,
  generateZodSchemaCode,
} from "@/forms/utils/zodSchemaBuilder";
import type { FormConfig, FormFieldConfig } from "@/forms/types/types";

describe("zodSchemaBuilder / extractFields", () => {
  it("flattens fields from all sections", () => {
    const config: FormConfig = {
      sections: [
        { id: "s1", fields: [{ name: "a", type: "text" }] },
        { id: "s2", fields: [{ name: "b", type: "text" }, { name: "c", type: "text" }] },
      ],
    } as FormConfig;
    const fields = extractFields(config);
    expect(fields.map((f) => f.name)).toEqual(["a", "b", "c"]);
  });
});

describe("zodSchemaBuilder / evaluateCondition", () => {
  it("returns true when no condition", () => {
    expect(evaluateCondition(undefined, {})).toBe(true);
  });

  it("equals / notEquals", () => {
    expect(
      evaluateCondition({ field: "x", operator: "equals", value: "1" }, { x: 1 }),
    ).toBe(true);
    expect(
      evaluateCondition({ field: "x", operator: "notEquals", value: "1" }, { x: 1 }),
    ).toBe(false);
  });

  it("contains", () => {
    expect(
      evaluateCondition(
        { field: "x", operator: "contains", value: "ello" },
        { x: "hello" },
      ),
    ).toBe(true);
  });

  it("notEmpty / empty", () => {
    expect(evaluateCondition({ field: "x", operator: "notEmpty" }, { x: "y" })).toBe(true);
    expect(evaluateCondition({ field: "x", operator: "empty" }, { x: "" })).toBe(true);
    expect(evaluateCondition({ field: "x", operator: "empty" }, { x: undefined })).toBe(true);
  });

  it("in", () => {
    expect(
      evaluateCondition(
        { field: "x", operator: "in", value: "a, b, c" },
        { x: "b" },
      ),
    ).toBe(true);
    expect(
      evaluateCondition(
        { field: "x", operator: "in", value: "a, b, c" },
        { x: "z" },
      ),
    ).toBe(false);
  });

  it("isTrue / isFalse", () => {
    expect(evaluateCondition({ field: "x", operator: "isTrue" }, { x: true })).toBe(true);
    expect(evaluateCondition({ field: "x", operator: "isTrue" }, { x: "true" })).toBe(true);
    expect(evaluateCondition({ field: "x", operator: "isFalse" }, { x: false })).toBe(true);
    expect(evaluateCondition({ field: "x", operator: "isFalse" }, { x: "" })).toBe(true);
  });
});

describe("zodSchemaBuilder / buildZodSchema (runtime)", () => {
  it("text required: rejects empty, accepts non-empty", () => {
    const schema = buildZodSchema([
      { name: "name", type: "text", required: true } as FormFieldConfig,
    ]);
    expect(schema.safeParse({ name: "" }).success).toBe(false);
    expect(schema.safeParse({ name: "x" }).success).toBe(true);
  });

  it("text optional: accepts undefined and empty", () => {
    const schema = buildZodSchema([
      { name: "name", type: "text" } as FormFieldConfig,
    ]);
    expect(schema.safeParse({}).success).toBe(true);
    expect(schema.safeParse({ name: "" }).success).toBe(true);
  });

  it("email required: validates format", () => {
    const schema = buildZodSchema([
      { name: "e", type: "email", required: true } as FormFieldConfig,
    ]);
    expect(schema.safeParse({ e: "bad" }).success).toBe(false);
    expect(schema.safeParse({ e: "x@y.com" }).success).toBe(true);
  });

  it("email optional: empty/undefined OK, bad string fails", () => {
    const schema = buildZodSchema([
      { name: "e", type: "email" } as FormFieldConfig,
    ]);
    expect(schema.safeParse({}).success).toBe(true);
    expect(schema.safeParse({ e: "" }).success).toBe(true);
    expect(schema.safeParse({ e: "bad" }).success).toBe(false);
  });

  it("number with min/max coerces strings", () => {
    const schema = buildZodSchema([
      { name: "n", type: "number", required: true, min: 1, max: 10 } as FormFieldConfig,
    ]);
    expect(schema.safeParse({ n: "5" }).success).toBe(true);
    expect(schema.safeParse({ n: "0" }).success).toBe(false);
    expect(schema.safeParse({ n: "11" }).success).toBe(false);
    expect(schema.safeParse({ n: "" }).success).toBe(false);
  });

  it("number optional accepts empty", () => {
    const schema = buildZodSchema([
      { name: "n", type: "number" } as FormFieldConfig,
    ]);
    expect(schema.safeParse({ n: "" }).success).toBe(true);
    expect(schema.safeParse({}).success).toBe(true);
  });

  it("checkbox/switch are boolean (no required check)", () => {
    const schema = buildZodSchema([
      { name: "agree", type: "checkbox" } as FormFieldConfig,
    ]);
    expect(schema.safeParse({ agree: true }).success).toBe(true);
    expect(schema.safeParse({ agree: false }).success).toBe(true);
  });

  it("multiselect with maxItems", () => {
    const schema = buildZodSchema([
      { name: "tags", type: "multiselect", maxItems: 2 } as FormFieldConfig,
    ]);
    expect(schema.safeParse({ tags: ["a"] }).success).toBe(true);
    expect(schema.safeParse({ tags: ["a", "b", "c"] }).success).toBe(false);
  });

  it("conditional required: required only when condition holds", () => {
    const schema = buildZodSchema([
      { name: "type", type: "select", options: [], required: true } as FormFieldConfig,
      {
        name: "other",
        type: "text",
        required: true,
        condition: { field: "type", operator: "equals", value: "other" },
      } as FormFieldConfig,
    ]);
    expect(schema.safeParse({ type: "main", other: "" }).success).toBe(true);
    expect(schema.safeParse({ type: "other", other: "" }).success).toBe(false);
    expect(schema.safeParse({ type: "other", other: "yes" }).success).toBe(true);
  });

  it("date required min(1)", () => {
    const schema = buildZodSchema([
      { name: "dob", type: "date", required: true } as FormFieldConfig,
    ]);
    expect(schema.safeParse({ dob: "" }).success).toBe(false);
    expect(schema.safeParse({ dob: "2026-04-19T10:00:00.000Z" }).success).toBe(true);
  });
});

describe("zodSchemaBuilder / generateZodSchemaCode (compile-time)", () => {
  it("emits required text with min(1)", () => {
    const code = generateZodSchemaCode([
      { name: "name", type: "text", required: true, label: "Name" } as FormFieldConfig,
    ]);
    expect(code).toMatch(/name: z\.string\(\)\.min\(1, "Name is required"\)/);
    expect(code).toMatch(/export const formSchema = baseSchema;/);
    expect(code).toMatch(/export type FormValues = z\.infer<typeof formSchema>;/);
  });

  it("emits z.coerce.number with bounds + .optional() when not required", () => {
    const code = generateZodSchemaCode([
      { name: "qty", type: "number", min: 1, max: 99 } as FormFieldConfig,
    ]);
    expect(code).toContain("qty: z.coerce.number().min(1).max(99).optional(),");
  });

  it("emits superRefine for conditional required fields", () => {
    const code = generateZodSchemaCode([
      { name: "kind", type: "select", required: true } as FormFieldConfig,
      {
        name: "other",
        type: "text",
        required: true,
        label: "Other",
        condition: { field: "kind", operator: "equals", value: "x" },
      } as FormFieldConfig,
    ]);
    expect(code).toContain("baseSchema.superRefine");
    expect(code).toContain('data.kind === "x"');
    expect(code).toContain('"Other is required"');
  });

  it("emits z.array(z.string()).max() for multiselect with maxItems", () => {
    const code = generateZodSchemaCode([
      { name: "tags", type: "multiselect", maxItems: 3 } as FormFieldConfig,
    ]);
    expect(code).toContain("tags: z.array(z.string()).max(3).optional(),");
  });

  it("emits z.boolean() for checkbox/switch", () => {
    const code = generateZodSchemaCode([
      { name: "ok", type: "checkbox" } as FormFieldConfig,
      { name: "on", type: "switch" } as FormFieldConfig,
    ]);
    expect(code).toContain("ok: z.boolean(),");
    expect(code).toContain("on: z.boolean(),");
  });

  it("emits switchgroup as record", () => {
    const code = generateZodSchemaCode([
      { name: "perms", type: "switchgroup" } as FormFieldConfig,
    ]);
    expect(code).toContain("perms: z.record(z.string(), z.boolean()),");
  });

  it("emits file as instanceof(File).optional()", () => {
    const code = generateZodSchemaCode([
      { name: "doc", type: "file" } as FormFieldConfig,
    ]);
    expect(code).toContain("doc: z.instanceof(File).optional(),");
  });
});
