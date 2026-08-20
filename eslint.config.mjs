import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // CLI / validate:variants scratch project — not part of the main app source tree
    "test/**",
  ]),
  {
    rules: {
      // Treat a leading underscore as "intentionally unused" for vars, args, and
      // caught errors — the standard convention (e.g. API-shape stub params).
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
      // Form builder and field render props often use `any` until stricter generics land.
      "@typescript-eslint/no-explicit-any": "warn",
      // Many valid patterns (mounted flags, resetting UI when props change) still use setState in effects.
      "react-hooks/set-state-in-effect": "off",
      // Prefer readable copy in JSX over HTML-escaped quotes in UI strings.
      "react/no-unescaped-entities": "warn",
    },
  },
  {
    // Engine sources ship to consumer projects via the registry, so they must
    // not depend on a bundler rewriting `./x.js` back to `./x.ts`. Every
    // relative import stays extensionless.
    //
    // Scoped to `app/**` on purpose: `afnoui-cli/dist/**` is compiled ESM,
    // where the `.js` extension is required and correct.
    files: ["app/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["./*.js", "../*.js", "./**/*.js", "../**/*.js"],
              message:
                "Use an extensionless relative import (`./types`, not `./types.js`). Engine files ship to consumer projects and must not rely on bundler .js→.ts resolution.",
            },
          ],
        },
      ],
    },
  },
]);

export default eslintConfig;
