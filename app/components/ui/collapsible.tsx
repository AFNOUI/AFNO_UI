import * as CollapsiblePrimitive from "@radix-ui/react-collapsible";

const Collapsible = CollapsiblePrimitive.Root;
const CollapsibleTrigger = CollapsiblePrimitive.CollapsibleTrigger;
const CollapsibleContent = CollapsiblePrimitive.CollapsibleContent;

export { Collapsible, CollapsibleTrigger, CollapsibleContent };

// /* Add these to your global CSS file (e.g., globals.css) */
/*
 * ============================================
 * TAILWIND CSS VARIABLES DOCUMENTATION
 * ============================================
 * This component uses Tailwind CSS variables defined in app/globals.css
 * 
 * Notes:
 * -----
 * This component is a thin wrapper around Radix UI's Collapsible primitive.
 * It doesn't directly use CSS variables but manages state transitions.
 * 
 * It expects accordion animation styles from globals.css for smooth open/close:
 *   - --animation-accordion-down     For expanding content height transition
 *   - --animation-accordion-up       For collapsing content height transition
 * 
 * If using animations, ensure these keyframes are defined in your globals.css:
 *   @keyframes accordion-down { from { height: 0 } to { height: var(--radix-collapsible-content-height) } }
 *   @keyframes accordion-up { from { height: var(--radix-collapsible-content-height) } to { height: 0 } }
 * 
 * Position Breakdown:
 *   - Collapsible root: Transparent wrapper, no direct styling
 *   - CollapsibleTrigger: Transparent trigger, parent provides styling
 *   - CollapsibleContent: Uses Radix's built-in height transitions
 *                         Expects --radix-collapsible-content-height CSS variable
 *                         Animation classes applied via data-[state] attributes
 *                         data-[state=open]:animate-accordion-down on open
 *                         data-[state=closed]:animate-accordion-up on close
 */
