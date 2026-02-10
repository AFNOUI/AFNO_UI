import * as CollapsiblePrimitive from "@radix-ui/react-collapsible";

const Collapsible = CollapsiblePrimitive.Root;
const CollapsibleTrigger = CollapsiblePrimitive.CollapsibleTrigger;
const CollapsibleContent = CollapsiblePrimitive.CollapsibleContent;

export { Collapsible, CollapsibleTrigger, CollapsibleContent };

// /* Add these to your global CSS file (e.g., globals.css) */
// @layer base {
//   :root {
//     /* --- Animation Tokens (Tailwind v4 / @theme) --- */
//     --animation-accordion-down: ...;
//     --animation-accordion-up: ...;
//   }
// }
