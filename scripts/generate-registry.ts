#!/usr/bin/env node

/**
 * Generate Form Registry (CLI `forms.json` + optional TS for the AfnoUI app).
 *
 * Output shape (v2):
 * - `shared`: types, hooks, utils used by every stack
 * - `stacks.rhf` | `stacks.tanstack` | `stacks.action`: per-stack fixed + field files
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const JSON_OUTPUT_DIR = path.join(ROOT, 'public', 'registry');
const JSON_OUTPUT_FILE = path.join(JSON_OUTPUT_DIR, 'forms.json');

const args = process.argv.slice(2);
const generateTS = args.includes('--ts');
const outIdx = args.indexOf('--out');
const TS_OUTPUT_FILE =
  outIdx !== -1 && args[outIdx + 1]
  ? path.resolve(ROOT, args[outIdx + 1])
  : path.join(ROOT, 'app', 'registry', 'formRegistryGenerated.ts');

type Lang = 'typescript' | 'tsx';

type FieldFile = {
  name: string;
  path: string;
  code: string;
  description: string;
  language: Lang;
};

type FixedBucket = {
    core: FieldFile[];
    hook: FieldFile[];
    util: FieldFile[];
  };

type StackBundle = {
  fixed: FixedBucket;
  fields: Record<string, FieldFile>;
};

type FormStackKind = 'rhf' | 'tanstack' | 'action';

type StackInstallSpec = {
  npmDependencies: string[];
  npmDevDependencies?: string[];
  uiComponents: string[];
};

type FormRegistryOutput = {
  generatedAt: string;
  /** CLI reads this — edit here when form fields gain new imports (no CLI code change). */
  stackInstall: Record<FormStackKind, StackInstallSpec>;
  shared: FixedBucket;
  stacks: {
    rhf: StackBundle;
    tanstack: StackBundle;
    action: StackBundle;
  };
};

const STACK_INSTALL: Record<FormStackKind, StackInstallSpec> = {
  rhf: {
    npmDependencies: ['zod', 'react-hook-form', '@hookform/resolvers', 'axios', 'date-fns', '@tanstack/react-query'],
    npmDevDependencies: [],
    uiComponents: [
      'form',
      'label',
      'button',
      'card',
      'badge',
      'alert',
      'tabs',
      'progress',
      'separator',
      'input',
      'select',
      'checkbox',
      'switch',
      'radio-group',
      'textarea',
      'popover',
      'command',
      'calendar',
      'scroll-area',
    ],
  },
  tanstack: {
    npmDependencies: ['zod', '@tanstack/react-form', 'axios', 'date-fns', '@tanstack/react-query'],
    npmDevDependencies: [],
    uiComponents: [
      'label',
      'button',
      'card',
      'badge',
      'alert',
      'tabs',
      'progress',
      'separator',
      'input',
      'select',
      'checkbox',
      'switch',
      'radio-group',
      'textarea',
      'popover',
      'command',
      'calendar',
      'scroll-area',
    ],
  },
  action: {
    npmDependencies: ['zod', 'axios', 'date-fns', '@tanstack/react-query'],
    npmDevDependencies: [],
    uiComponents: [
      'label',
      'button',
      'card',
      'badge',
      'alert',
      'tabs',
      'progress',
      'separator',
      'input',
      'select',
      'checkbox',
      'switch',
      'radio-group',
      'textarea',
      'popover',
      'command',
      'calendar',
      'scroll-area',
    ],
  },
};

function readFileUtf8(registryPath: string): string {
  const rel = registryPath.replace(/^\/+/, '');
  const fullPath = path.join(ROOT, rel);
  if (!fs.existsSync(fullPath)) {
    console.warn(`⚠ File not found: ${registryPath} → ${fullPath}`);
    return '';
  }
  return fs.readFileSync(fullPath, 'utf-8');
}

function makeEntry(
  registryPath: string,
  displayName: string,
  description: string,
  language: Lang
): FieldFile {
  return {
    name: displayName,
    path: registryPath,
    code: readFileUtf8(registryPath),
    description,
    language,
  };
}

function langForFile(fileName: string): Lang {
  return fileName.endsWith('.tsx') ? 'tsx' : 'typescript';
}

/** Shared layer: types, hooks, utils */
function buildShared(): FixedBucket {
  return {
    core: [
      makeEntry(
        '/app/forms/types/types.ts',
        'types.ts',
        'All TypeScript types, interfaces, and getDefaultValues().',
        'typescript'
      ),
      makeEntry(
        '/app/forms/FormFieldErrorBoundary.tsx',
        'FormFieldErrorBoundary.tsx',
        'Per-field error boundary wrapper used by all form stacks.',
        'tsx'
      ),
      makeEntry(
        '/app/forms/types/hydration.ts',
        'hydration.ts',
        'Optional hydration utilities — applyHydration() for backend data.',
        'typescript'
      ),
    ],
    hook: [
      makeEntry(
        '/app/forms/hooks/useBackendErrors.ts',
        'useBackendErrors.ts',
        'Backend error types + mapBackendErrors (stack-neutral; RHF applyBackendErrors lives in react-hook-form/).',
        'typescript'
      ),
      makeEntry(
        '/app/forms/hooks/useInfiniteOptions.ts',
        'useInfiniteOptions.ts',
        'Async and infinite-scroll option loading hooks.',
        'typescript'
      ),
    ],
    util: [
      makeEntry(
        '/app/forms/utils/zodSchemaBuilder.ts',
        'zodSchemaBuilder.ts',
        'Runtime schema builder and compile-time code generator.',
        'typescript'
      ),
      makeEntry(
        '/app/forms/utils/fieldExtraKeys.ts',
        'fieldExtraKeys.ts',
        'Utility to persist extra response-mapped values under "{fieldName}__{key}".',
        'typescript'
      ),
      makeEntry(
        '/app/forms/utils/watchPopulate.ts',
        'watchPopulate.ts',
        'Watch & auto-populate coercion, valueMap resolution, and reset helpers for all field types.',
        'typescript'
      ),
      makeEntry(
        '/app/forms/utils/dependentApiRequest.ts',
        'dependentApiRequest.ts',
        'Dependent API URL/header/payload substitution and axios config for async/infinite fetches.',
        'typescript'
      ),
      makeEntry(
        '/app/forms/utils/dateSerialize.tsx',
        'dateSerialize.tsx',
        'HeaderlessMonth override for react-day-picker — drops the built-in month/year + nav caption row when surrounding UI provides its own.',
        'tsx'
      ),
      makeEntry(
        '/app/forms/utils/dateFieldHelpers.ts',
        'dateFieldHelpers.ts',
        'Shared pure helpers for DateField across all stacks (months/hours/minutes constants, to24Hour, generateYears, buildDateDisabler, stampPickedDay, getDateFieldFormatString).',
        'typescript'
      ),
      makeEntry(
        '/app/forms/utils/fileFieldHelpers.ts',
        'fileFieldHelpers.ts',
        'Shared pure helpers for FileField across all stacks (formatFileSize, matchesAcceptedType).',
        'typescript'
      ),
      makeEntry(
        '/app/forms/utils/formFieldGuards.ts',
        'formFieldGuards.ts',
        'Shared type guards used by every form-field router (hasOptions, hasDependentApiConfig, hasWatchValue).',
        'typescript'
      ),
    ],
  };
}

/** TanStack + Action field stacks import these; RHF uses form.tsx instead (see buildRhfStack). */
function appendFormPrimitivesUtil(bundle: StackBundle): void {
  bundle.fixed.util.push(
    makeEntry(
      '/app/components/ui/form-primitives.tsx',
      'form-primitives.tsx',
      'Shared FieldDescription / FieldError / normalizeFieldErrors for TanStack and Action form fields.',
      'tsx'
    )
  );
}

/**
 * Walk `app/forms/{stackDir}` into fixed buckets + fields record.
 * @param hookBasenames files at stack root treated as hook category (e.g. useReactHookForm.ts)
 */
function ingestStack(
  stackDir: string,
  hookBasenames: Set<string>,
  stackLabel: string
): StackBundle {
  const absRoot = path.join(ROOT, 'app', 'forms', stackDir);
  const fixed: FixedBucket = { core: [], hook: [], util: [] };
  const fields: Record<string, FieldFile> = {};

  function walk(dir: string, relFromStack: string): void {
    for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
      const abs = path.join(dir, ent.name);
      const rel = relFromStack ? `${relFromStack}/${ent.name}` : ent.name;
      if (ent.isDirectory()) {
        walk(abs, rel);
        continue;
      }
      if (!/\.tsx?$/.test(ent.name)) continue;

      const registryPath = `/app/forms/${stackDir}/${rel}`.replace(/\\/g, '/');
      const language = langForFile(ent.name);
      const entry = makeEntry(
        registryPath,
        rel,
        rel.startsWith('fields/') && ent.name.endsWith('.tsx')
          ? `Field component: ${ent.name} (${stackLabel})`
          : `${stackLabel}: ${rel}`,
        language
      );

      if (rel.startsWith('fields/')) {
        if (ent.name === 'index.ts') {
          fixed.core.push({
            ...entry,
            name: 'fields/index.ts',
            description: `Barrel export for ${stackLabel} field components.`,
          });
        } else if (ent.name.endsWith('.tsx')) {
          fields[ent.name] = {
            ...entry,
            name: ent.name,
            description: `Field component: ${ent.name}`,
          };
        }
        continue;
      }

      if (hookBasenames.has(ent.name)) {
        fixed.hook.push({
          ...entry,
          name: ent.name,
          description:
            stackDir === 'react-hook-form'
              ? 'Form state, validation, step/tab navigation, backend error mapping.'
              : stackDir === 'tanstack-forms'
                ? 'TanStack Form state, layout navigation, validation.'
                : 'Action-style form state (useActionForm), layout navigation.',
        });
      } else {
        fixed.core.push({
          ...entry,
          name: rel,
          description: entry.description,
        });
      }
    }
  }

  walk(absRoot, '');
  return { fixed, fields };
}

/** RHF: hook file lives next to ReactHookForm */
function buildRhfStack(): StackBundle {
  const bundle = ingestStack('react-hook-form', new Set(['useReactHookForm.ts', 'applyBackendErrors.ts']), 'react-hook-form');
  // Friendly display names for top-level core files (form builder looks up by basename)
  bundle.fixed.core = bundle.fixed.core.map((f) => {
    if (f.path.endsWith('/ReactHookForm.tsx')) {
      return { ...f, name: 'ReactHookForm.tsx', description: f.description };
    }
    if (f.path.endsWith('/ReactHookFormField.tsx')) {
      return { ...f, name: 'ReactHookFormField.tsx', description: f.description };
    }
    if (f.path.endsWith('/react-hook-form/index.ts')) {
      return { ...f, name: 'react-hook-form/index.ts', description: 'Barrel export for RHF stack.' };
    }
    return f;
  });
  bundle.fixed.util.push(
    makeEntry(
      '/app/components/ui/form.tsx',
      'form.tsx',
      'AfnoUI Form for React Hook Form — FormProvider, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage.',
      'tsx'
    )
  );
  return bundle;
}

function buildTanstackStack(): StackBundle {
  const bundle = ingestStack('tanstack-forms', new Set(['useTanstackForm.ts', 'applyBackendErrors.ts']), 'tanstack-forms');
  bundle.fixed.core = bundle.fixed.core.map((f) => {
    if (f.path.endsWith('/TanstackForm.tsx')) {
      return { ...f, name: 'TanstackForm.tsx', description: f.description };
    }
    if (f.path.endsWith('/TanstackFormField.tsx')) {
      return { ...f, name: 'TanstackFormField.tsx', description: f.description };
    }
    if (f.path.endsWith('/tanstack-forms/index.ts')) {
      return { ...f, name: 'tanstack-forms/index.ts', description: 'Barrel export for TanStack Form stack.' };
    }
    return f;
  });
  appendFormPrimitivesUtil(bundle);
  return bundle;
}

function buildActionStack(): StackBundle {
  const bundle = ingestStack('action-forms', new Set(['useActionForm.ts', 'applyBackendErrors.ts']), 'action-forms');
  bundle.fixed.core = bundle.fixed.core.map((f) => {
    if (f.path.endsWith('/ActionForm.tsx')) {
      return { ...f, name: 'ActionForm.tsx', description: f.description };
    }
    if (f.path.endsWith('/ActionFormField.tsx')) {
      return { ...f, name: 'ActionFormField.tsx', description: f.description };
    }
    if (f.path.endsWith('/action-forms/index.ts')) {
      return { ...f, name: 'action-forms/index.ts', description: 'Barrel export for ActionForm stack.' };
    }
    return f;
  });
  appendFormPrimitivesUtil(bundle);
  return bundle;
}

function buildFullRegistry(): FormRegistryOutput {
  return {
    generatedAt: new Date().toISOString(),
    stackInstall: STACK_INSTALL,
    shared: buildShared(),
    stacks: {
      rhf: buildRhfStack(),
      tanstack: buildTanstackStack(),
      action: buildActionStack(),
    },
  };
}

function generateJsonRegistry(registry: FormRegistryOutput): void {
  console.log('📦 Generating JSON registry…\n');

  let count = 0;
  const countBucket = (b: FixedBucket) => {
    count += b.core.length + b.hook.length + b.util.length;
  };
  countBucket(registry.shared);
  for (const k of Object.keys(registry.stacks)) {
    const s = registry.stacks[k as keyof FormRegistryOutput['stacks']];
    countBucket(s.fixed);
    count += Object.keys(s.fields).length;
  }

  fs.mkdirSync(JSON_OUTPUT_DIR, { recursive: true });
  fs.writeFileSync(JSON_OUTPUT_FILE, JSON.stringify(registry, null, 2), 'utf-8');
  const sizeKB = (fs.statSync(JSON_OUTPUT_FILE).size / 1024).toFixed(1);
  console.log(`\n✅ JSON registry: ${JSON_OUTPUT_FILE}`);
  console.log(`   ${count} files, ${sizeKB} KB`);
}

function escapeForTemplateLiteral(str: string): string {
  return str.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$\{/g, '\\${');
}

/** Valid JS identifier for `export const x = \`...\`` */
function toVarName(registryRelative: string): string {
  const base = registryRelative
    .replace(/^\/app\/forms\//, '')
    .replace(/\.tsx?$/i, '')
    .replace(/[^a-zA-Z0-9]+/g, '_')
    .replace(/^_|_$/g, '');
  return (base || 'file') + 'Raw';
}

type CategorizedFile = { file: FieldFile; category: 'core' | 'hook' | 'util' | 'field' };

function attachCategories(bucket: FixedBucket): CategorizedFile[] {
  return [
    ...bucket.core.map((file) => ({ file, category: 'core' as const })),
    ...bucket.hook.map((file) => ({ file, category: 'hook' as const })),
    ...bucket.util.map((file) => ({ file, category: 'util' as const })),
  ];
}

function mergeSharedAndStackFixed(shared: FixedBucket, stack: StackBundle): CategorizedFile[] {
  return [...attachCategories(shared), ...attachCategories(stack.fixed)];
}

function collectUniqueFieldFiles(registry: FormRegistryOutput): FieldFile[] {
  const byPath = new Map<string, FieldFile>();
  const add = (f: FieldFile) => {
    if (!byPath.has(f.path)) byPath.set(f.path, f);
  };
  for (const f of registry.shared.core) add(f);
  for (const f of registry.shared.hook) add(f);
  for (const f of registry.shared.util) add(f);
  for (const key of Object.keys(registry.stacks)) {
    const s = registry.stacks[key as keyof FormRegistryOutput['stacks']];
    for (const f of s.fixed.core) add(f);
    for (const f of s.fixed.hook) add(f);
    for (const f of s.fixed.util) add(f);
    for (const f of Object.values(s.fields)) add(f);
  }
  return Array.from(byPath.values()).sort((a, b) => a.path.localeCompare(b.path));
}

function emitRegistryRows(
  lines: string[],
  items: CategorizedFile[],
  vn: (p: string) => string
): void {
  for (const { file: f, category } of items) {
    const v = vn(f.path);
    lines.push(`  {`);
    lines.push(`    name: '${f.name.replace(/'/g, "\\'")}',`);
    lines.push(`    path: '${f.path}',`);
    lines.push(`    code: ${v},`);
    lines.push(`    language: '${f.language}',`);
    lines.push(`    description: '${f.description.replace(/'/g, "\\'")}',`);
    lines.push(`    isFixed: true,`);
    lines.push(`    category: '${category}',`);
    lines.push(`  },`);
  }
}

function emitFieldRecord(
  lines: string[],
  fields: Record<string, FieldFile>,
  vn: (p: string) => string
): void {
  for (const [fn, f] of Object.entries(fields)) {
    const v = vn(f.path);
    lines.push(`  '${fn}': {`);
    lines.push(`    name: '${fn}',`);
    lines.push(`    path: '${f.path}',`);
    lines.push(`    code: ${v},`);
    lines.push(`    language: 'tsx',`);
    lines.push(`    description: '${f.description.replace(/'/g, "\\'")}',`);
    lines.push(`    isFixed: true,`);
    lines.push(`    category: 'field',`);
    lines.push(`  },`);
  }
}

/** TS mirror of forms.json — all stacks; edit app/forms only, then npm run build:forms-registry */
function generateTsRegistry(registry: FormRegistryOutput): void {
  console.log('\n📦 Generating TypeScript registry (shared + rhf + tanstack + action)…\n');

  const uniqueFiles = collectUniqueFieldFiles(registry);
  const varDecls: string[] = [];
  for (const f of uniqueFiles) {
    const v = toVarName(f.path);
    varDecls.push(`export const ${v} = \`${escapeForTemplateLiteral(f.code)}\`;`);
    console.log(`  ✓ ${v}`);
  }

  const lines: string[] = [
    '/**',
    ' * AUTO-GENERATED by scripts/generate-registry.ts --ts',
    ' * DO NOT EDIT MANUALLY — run `npm run build:forms-registry` to regenerate.',
    ' */',
    '',
    'export interface RegistryFile {',
    "  name: string;",
    "  path: string;",
    "  code: string;",
    "  language: 'typescript' | 'tsx';",
    "  description: string;",
    "  isFixed: boolean;",
    "  category: 'core' | 'hook' | 'util' | 'field';",
    '}',
    '',
    `export const formRegistryGeneratedAt = '${registry.generatedAt}';`,
    '',
    '/**',
    ' * Single source of truth for per-stack install metadata.',
    ' *',
    ' * Mirrors `stackInstall` in `public/registry/forms.json` (which the CLI reads on',
    ' * `afnoui add forms/<variant> --stack=…`). The in-app Export tab + FormsCodePanel',
    ' * import this so the displayed `npm install` command never drifts from what the CLI',
    ' * actually installs.',
    ' */',
    `export const formStackInstall = ${JSON.stringify(STACK_INSTALL, null, 2)} as const;`,
    '',
    "export type FormStackInstallSpec = (typeof formStackInstall)[keyof typeof formStackInstall];",
    '',
    ...varDecls,
    '',
  ];

  const vn = (p: string) => toVarName(p);

  lines.push('/** Shared + React Hook Form — default for form builder / CLI RHF stack */');
  lines.push('export const generatedFixedFiles: RegistryFile[] = [');
  emitRegistryRows(lines, mergeSharedAndStackFixed(registry.shared, registry.stacks.rhf), vn);
  lines.push('];', '');

  lines.push('export const generatedFieldFiles: Record<string, RegistryFile> = {');
  emitFieldRecord(lines, registry.stacks.rhf.fields, vn);
  lines.push('};', '');

  lines.push('/** Shared + TanStack Form */');
  lines.push('export const generatedTanstackFixedFiles: RegistryFile[] = [');
  emitRegistryRows(lines, mergeSharedAndStackFixed(registry.shared, registry.stacks.tanstack), vn);
  lines.push('];', '');

  lines.push('export const generatedTanstackFieldFiles: Record<string, RegistryFile> = {');
  emitFieldRecord(lines, registry.stacks.tanstack.fields, vn);
  lines.push('};', '');

  lines.push('/** Shared + ActionForm */');
  lines.push('export const generatedActionFixedFiles: RegistryFile[] = [');
  emitRegistryRows(lines, mergeSharedAndStackFixed(registry.shared, registry.stacks.action), vn);
  lines.push('];', '');

  lines.push('export const generatedActionFieldFiles: Record<string, RegistryFile> = {');
  emitFieldRecord(lines, registry.stacks.action.fields, vn);
  lines.push('};', '');

  const output = lines.join('\n');
  const dir = path.dirname(TS_OUTPUT_FILE);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(TS_OUTPUT_FILE, output, 'utf-8');
  console.log(`\n✅ TypeScript registry: ${TS_OUTPUT_FILE} (${(Buffer.byteLength(output) / 1024).toFixed(1)} KB)`);
}

const registry = buildFullRegistry();
generateJsonRegistry(registry);
if (generateTS) {
  generateTsRegistry(registry);
}
