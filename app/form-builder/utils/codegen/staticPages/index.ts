import type { FormConfig } from "@/forms/types/types";

import type { FormLibrary } from "../types";

import { generateStaticAction } from "./action";
import { generateStaticRHF } from "./rhf";
import { generateStaticTanStack } from "./tanstack";

/** Generate static page code — dispatches to library-specific generator */
export function generateStaticPageCode(config: FormConfig, library: FormLibrary): string {
  switch (library) {
    case 'rhf': return generateStaticRHF(config);
    case 'tanstack': return generateStaticTanStack(config);
    case 'action': return generateStaticAction(config);
  }
}

export { generateStaticAction, generateStaticRHF, generateStaticTanStack };
