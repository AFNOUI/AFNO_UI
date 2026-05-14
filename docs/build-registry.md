# Build Registry Script Documentation

## Overview

The `build-registry.ts` script is responsible for generating the component and theme registry files used by the Afnoui CLI. It processes component files and CSS theme variables to create a structured JSON registry that can be consumed by external tools.

## Architecture

The script uses a **configuration-driven architecture** that makes it highly scalable and future-proof. Instead of hardcoding parsing logic, it uses a pattern-based system where new variable types can be added without modifying the core parsing logic.

## How It Works

### 1. Component Registry Building

The script processes a list of components defined in the `components` array and:

1. Reads each component's source files
2. Extracts dependencies (npm packages and registry dependencies)
3. Generates JSON files in `public/registry/` for each component
4. Creates an `index.json` file listing all available components

**Process Flow:**
```
Component Source → Read Files → Extract Metadata → Generate JSON → Write to Registry
```

### 2. Theme Registry Building

The script parses CSS theme variables from `app/globals.css` and generates a `theme.json` file with:

- **v4 format**: Full CSS content for Tailwind CSS v4
- **v3 format**: Extracted CSS variables and Tailwind config for v3 compatibility

**Process Flow:**
```
CSS File → Extract @theme Block → Parse Variables → Transform to Tailwind Config → Generate JSON
```

## Variable Pattern System

### Configuration-Driven Parsing

The script uses a `VARIABLE_PATTERNS` array that defines how different CSS variable types are parsed. Each pattern includes:

- **prefix**: CSS variable prefix (e.g., `--color-`, `--spacing-`)
- **category**: Target Tailwind category
- **regex**: Pattern to extract variable name and original CSS variable
- **transformValue**: Optional function to transform the value
- **mergeIntoSpacing**: Whether to merge into spacing category

### Pattern Structure

```typescript
{
    prefix: "--color-",
    category: "colors",
    regex: /--color-([a-z0-9-]+):\s*hsl\(var\(--([a-z0-9-]+)\)\)/g,
    transformValue: (match) => `hsl(var(--${match[2]}))`,
}
```

**Regex Groups:**
- Group 1: Variable name without prefix (used as Tailwind key)
- Group 2+: Additional captured groups (e.g., original CSS variable name)

## Adding New Variable Types

### Step-by-Step Guide

1. **Add Category Type** (if new Tailwind category):
   ```typescript
   export type TailwindCategory = 
       | "colors"
       | "yourNewCategory"; // Add here
   ```

2. **Add Pattern Configuration**:
   ```typescript
   {
       prefix: "--your-prefix-",
       category: "yourNewCategory",
       regex: /--your-prefix-([a-z0-9-]+):\s*var\(--([a-z0-9-]+)\)/g,
       transformValue: createVarTransformer(), // or custom function
       mergeIntoSpacing: false, // optional
   }
   ```

3. **That's it!** The parser will automatically handle the new pattern.

### Pattern Ordering

**Important**: More specific patterns should come before general ones to avoid conflicts.

Example:
- `--font-size-*` should come before `--font-*`
- `--spacing-*` should come before `--spacing-*` variants

### Value Transformers

#### Standard Transformers

- `createVarTransformer()`: Creates `var(--variable-name)` format
- `createHslTransformer()`: Creates `hsl(var(--variable-name))` format

#### Custom Transformers

For complex cases, provide a custom function:

```typescript
transformValue: (match) => {
    // match[0] = full match
    // match[1] = variable name
    // match[2] = original CSS variable
    return `custom-format(${match[2]})`;
}
```

## Supported Variable Types

### Currently Supported

- **Colors**: `--color-*` → `colors` category
- **Font Sizes**: `--font-size-*` → `fontSize` category
- **Border Radius**: `--radius-*` → `borderRadius` category
- **Animations**: `--animation-*` → `animation` category
- **Spacing**: `--spacing-*` → `spacing` category
- **Height**: `--height-*` → merged into `spacing`
- **Width**: `--width-*` → merged into `spacing` (future-proof)
- **Gap**: `--gap-*` → merged into `spacing` (future-proof)

### Future-Ready Patterns

Pre-configured patterns ready for use:
- **Z-Index**: `--z-*` → `zIndex` category
- **Box Shadow**: `--shadow-*` → `boxShadow` category
- **Font Family**: `--font-*` → `fontFamily` category
- **Line Height**: `--leading-*` → `lineHeight` category
- **Letter Spacing**: `--tracking-*` → `letterSpacing` category
- **Opacity**: `--opacity-*` → `opacity` category

## CSS Variable Format

### Expected Format in `@theme` Block

```css
@theme {
  /* Colors */
  --color-primary: hsl(var(--primary));
  
  /* Spacing */
  --spacing-btn-padding-x-sm: var(--btn-padding-x-sm);
  
  /* Heights (merged into spacing) */
  --height-btn-height-sm: var(--btn-height-sm);
  
  /* Font Sizes */
  --font-size-btn-font-size-sm: var(--btn-font-size-sm);
  
  /* Border Radius */
  --radius-radius: var(--radius);
  
  /* Animations */
  --animation-fade-in-up: fade-in-up 0.4s ease-out forwards;
}
```

### Original CSS Variables

Original variables are defined in `:root` and `.dark` blocks:

```css
:root {
  --primary: 160 84% 39%;
  --btn-padding-x-sm: 0.75rem;
  --btn-height-sm: 2.25rem;
  --btn-font-size-sm: 0.75rem;
  --radius: 0.625rem;
}
```

## Output Structure

### Component Registry Files

Each component generates a JSON file at `public/registry/{component-name}.json`:

```json
{
  "name": "button",
  "dependencies": ["@radix-ui/react-slot", "class-variance-authority"],
  "devDependencies": [],
  "registryDependencies": ["utils"],
  "files": [
    {
      "path": "components/ui/button.tsx",
      "type": "registry:component",
      "content": "..."
    }
  ]
}
```

### Theme Registry File

Generated at `public/registry/theme.json`:

```json
{
  "version": "1.0.0",
  "v4": {
    "css": "/* Full CSS content */"
  },
  "v3": {
    "variables": "/* Extracted :root and .dark variables */",
    "config": {
      "darkMode": ["class"],
      "theme": {
        "extend": {
          "colors": { ... },
          "spacing": { ... },
          "fontSize": { ... },
          "animation": { ... },
          "borderRadius": { ... }
        }
      },
      "plugins": ["require(\"tailwindcss-animate\")"]
    }
  }
}
```

## Running the Script

### Command

```bash
pnpm build:registry
# or
pnpm dlx tsx scripts/build-registry.ts
```

### Output

The script generates:
- Component JSON files in `public/registry/`
- `public/registry/index.json` (component index)
- `public/registry/theme.json` (theme configuration)

### Console Output

```
🚀 Registry Built!
🎨 Theme Registry Built! (colors: 25, spacing: 15, fontSize: 4, animation: 3, borderRadius: 3)
🚀 Afnoui Registry Built Successfully!
```

## Error Handling

The script includes error handling:

- **Missing @theme block**: Warns and continues
- **File read errors**: Throws error with context
- **Invalid patterns**: Skips invalid matches (logs warning in development)

## Best Practices

1. **Keep patterns specific**: More specific patterns first
2. **Use transformers**: Leverage `createVarTransformer()` and `createHslTransformer()`
3. **Test new patterns**: Verify regex matches before committing
4. **Document custom patterns**: Add comments for complex transformations
5. **Maintain order**: Keep related patterns together

## Troubleshooting

### Variables Not Appearing in Output

1. Check regex pattern matches your CSS format
2. Verify variable is in `@theme` block
3. Ensure pattern order doesn't conflict
4. Check console for warnings

### Incorrect Value Format

1. Verify `transformValue` function
2. Check regex capture groups
3. Ensure original CSS variable exists

### Pattern Conflicts

1. Reorder patterns (specific → general)
2. Check for overlapping prefixes
3. Verify regex specificity

## Extension Examples

### Example 1: Adding Custom Spacing

```typescript
{
    prefix: "--custom-spacing-",
    category: "spacing",
    regex: /--custom-spacing-([a-z0-9-]+):\s*var\(--([a-z0-9-]+)\)/g,
    transformValue: createVarTransformer(),
}
```

### Example 2: Adding RGB Colors

```typescript
{
    prefix: "--color-rgb-",
    category: "colors",
    regex: /--color-rgb-([a-z0-9-]+):\s*rgb\(var\(--([a-z0-9-]+)\)\)/g,
    transformValue: (match) => `rgb(var(--${match[2]}))`,
}
```

### Example 3: Adding Custom Animation Format

```typescript
{
    prefix: "--motion-",
    category: "animation",
    regex: /--motion-([a-z0-9-]+):\s*([^;]+);/g,
    transformValue: (match) => {
        // Custom transformation logic
        return `custom-${match[2].trim()}`;
    },
}
```

## Architecture Benefits

1. **Scalability**: Add new types without code changes
2. **Maintainability**: Centralized configuration
3. **Type Safety**: Full TypeScript support
4. **Flexibility**: Custom transformers for edge cases
5. **Future-Proof**: Pre-configured for common patterns

## Related Files

- **Source**: `scripts/build-registry.ts`
- **CSS Input**: `app/globals.css`
- **Output**: `public/registry/`
- **CLI Consumer**: `afnoui-cli/src/index.tsx`
