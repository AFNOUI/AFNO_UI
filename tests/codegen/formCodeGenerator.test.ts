import { describe, expect, it } from "vitest";

import {
  generateAllFiles,
  generateInstallCommand,
  generatePageComponentCode,
  getRequiredComponents,
  getUsedFieldTypes,
  type FormLibrary,
  type ImplementationMode,
  type SchemaMode,
} from "@/form-builder/utils/formCodeGenerator";
import type { FormConfig } from "@/forms/types/types";

/**
 * Representative configs covering the main field families exercised by codegen.
 * Kept INTENTIONALLY small + stable so snapshots stay readable.
 */
const SMALL_CONFIG = {
  id: "login",
  title: "Login",
  description: "Login form",
  layout: { columns: 1, gap: "md" },
  submitButton: { label: "Sign in", className: "" },
  sections: [
    {
      id: "main",
      title: "",
      fields: [
        { name: "email", type: "email", label: "Email", required: true } as never,
        { name: "password", type: "password", label: "Password", required: true } as never,
        { name: "remember", type: "checkbox", label: "Remember me" } as never,
      ],
    },
  ],
} as unknown as FormConfig;

const RICH_CONFIG = {
  id: "profile",
  title: "Profile",
  description: "All field families",
  layout: { columns: 2, gap: "md" },
  submitButton: { label: "Save", className: "" },
  sections: [
    {
      id: "main",
      title: "Identity",
      fields: [
        { name: "name", type: "text", label: "Name", required: true, minLength: 2 } as never,
        { name: "age", type: "number", label: "Age", min: 0, max: 120 } as never,
        { name: "country", type: "select", label: "Country", options: [{ value: "us", label: "US" }, { value: "np", label: "NP" }], required: true } as never,
        {
          name: "city",
          type: "asyncselect",
          label: "City",
          api: {
            url: "https://api.example.com/cities",
            method: "GET",
            responseMapping: { dataPath: "data", labelKey: "name", valueKey: "id" },
          },
        } as never,
        { name: "tags", type: "multiselect", label: "Tags", options: [{ value: "a", label: "A" }] } as never,
        { name: "agree", type: "checkbox", label: "Agree", required: true } as never,
        { name: "dob", type: "date", label: "Date of birth" } as never,
        { name: "bio", type: "textarea", label: "Bio", maxLength: 500 } as never,
      ],
    },
  ],
} as unknown as FormConfig;

/** Snapshot-friendly view: keeps generator-owned files VERBATIM,
 *  reduces registry "fixed" files to a stable structural fingerprint. */
function snapshotShape(files: ReturnType<typeof generateAllFiles>) {
  return {
    fixed: files
      .filter((f) => f.isFixed)
      .map((f) => ({ path: f.path, name: f.name, language: f.language, codeBytes: f.code.length }))
      .sort((a, b) => a.path.localeCompare(b.path)),
    variant: files
      .filter((f) => !f.isFixed)
      .map((f) => ({ path: f.path, name: f.name, language: f.language, code: f.code }))
      .sort((a, b) => a.path.localeCompare(b.path)),
  };
}

const STACKS: FormLibrary[] = ["rhf", "tanstack", "action"];
const MODES: ImplementationMode[] = ["config", "static"];
const SCHEMA_MODES: SchemaMode[] = ["runtime", "compile-time"];

describe("formCodeGenerator / pure helpers", () => {
  it("getUsedFieldTypes returns deduped types from all sections", () => {
    expect(getUsedFieldTypes(RICH_CONFIG).sort()).toEqual(
      ["asyncselect", "checkbox", "date", "multiselect", "number", "select", "text", "textarea"].sort(),
    );
  });

  it("getRequiredComponents always includes core components", () => {
    const out = getRequiredComponents(SMALL_CONFIG);
    expect(out.coreComponents).toEqual(["card", "separator", "button"]);
    expect(Array.isArray(out.uiComponents)).toBe(true);
    expect(Array.isArray(out.fieldComponents)).toBe(true);
  });

  it("generateInstallCommand emits a deterministic, sorted npm command", () => {
    expect(generateInstallCommand(SMALL_CONFIG)).toMatchInlineSnapshot(
      `"npm install @radix-ui/react-button @radix-ui/react-card @radix-ui/react-checkbox @radix-ui/react-form @radix-ui/react-input @radix-ui/react-separator"`,
    );
  });
});

describe("formCodeGenerator / generatePageComponentCode (per stack × per mode × per schema)", () => {
  for (const lib of STACKS) {
    for (const mode of MODES) {
      for (const sm of SCHEMA_MODES) {
        // Static mode always uses compile-time schema; skip the redundant pair to keep snapshot count tight.
        if (mode === "static" && sm === "runtime") continue;
        it(`${lib} / ${mode} / ${sm} — locked snapshot`, () => {
          const code = generatePageComponentCode(
            SMALL_CONFIG,
            sm,
            [],
            lib,
            mode,
            "relative",
            "pages/MyFormPage.tsx",
          );
          expect(code).toMatchSnapshot();
        });
      }
    }
  }
});

describe("formCodeGenerator / generateAllFiles (per stack × per mode)", () => {
  for (const lib of STACKS) {
    for (const mode of MODES) {
      it(`${lib} / ${mode} — file shape locked`, () => {
        const files = generateAllFiles(
          RICH_CONFIG,
          mode === "static" ? "compile-time" : "runtime",
          [],
          lib,
          mode,
          "relative",
        );
        expect(snapshotShape(files)).toMatchSnapshot();
      });
    }
  }
});
