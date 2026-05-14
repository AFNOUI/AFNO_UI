/** Code-generation flavour: JSON-config-driven page or hand-rolled JSX page. */
export type ImplementationMode = 'config' | 'static';

/** Form library bucket consumed by every codegen helper. */
export type FormLibrary = 'rhf' | 'tanstack' | 'action';

/** Whether the generated page builds its Zod schema at runtime or at compile time. */
export type SchemaMode = 'runtime' | 'compile-time';

/** A single file produced by `generateAllFiles` (and its consumers). */
export interface GeneratedFile {
  name: string;
  path: string;
  code: string;
  language: string;
  description: string;
  isFixed: boolean;
}

/** A single file produced by `buildFormVariantStackFiles` (CLI variant bundle). */
export interface FormVariantStackFile {
  path: string;
  content: string;
}

export type { ImportStyle } from "./importAliases";
