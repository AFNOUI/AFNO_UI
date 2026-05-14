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
      // Form builder and field render props often use `any` until stricter generics land.
      "@typescript-eslint/no-explicit-any": "warn",
      // Many valid patterns (mounted flags, resetting UI when props change) still use setState in effects.
      "react-hooks/set-state-in-effect": "off",
      // Prefer readable copy in JSX over HTML-escaped quotes in UI strings.
      "react/no-unescaped-entities": "warn",
    },
  },
]);

export default eslintConfig;
