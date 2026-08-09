import {
  DEFAULT_TRANSPORT,
  cliGatedNote,
  type TransportChoice,
} from "@/lib/codegen/transport";

export function generateFormServiceCode(
  transport: TransportChoice = DEFAULT_TRANSPORT,
): string {
  const requestHelper =
    transport.http === "axios"
      ? `import axios from "axios";

/**
 * Single place the HTTP client is named, so swapping clients (or adding
 * interceptors / auth refresh) is a one-spot change.
 */
async function request(url: string, data: Record<string, unknown>): Promise<void> {
  await axios.post(url, data, { headers: { "Content-Type": "application/json", ...BASE_HEADERS } });
}`
      : `/**
 * Single place the HTTP client is named, so swapping \`fetch\` for axios (or
 * adding interceptors / auth refresh) is a one-spot change.
 */
async function request(url: string, data: Record<string, unknown>): Promise<void> {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...BASE_HEADERS },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const payload = await response.json().catch(() => undefined);
    throw normalizeBackendError(payload);
  }
}`;

  const errorAdapter =
    transport.http === "axios"
      ? `    if (axios.isAxiosError(error) && error.response?.data !== undefined) {
      throw normalizeBackendError(error.response.data);
    }
    throw { success: false, message: "Network error — please try again", errors: [] } as BackendErrorResponse;`
      : `    if (error && typeof error === "object" && "success" in error) throw error;
    throw { success: false, message: "Network error — please try again", errors: [] } as BackendErrorResponse;`;

  // When axios is chosen the ENGINE must use it too: the async/infinite field
  // components load options through their own transport context, which defaults
  // to fetch. Exporting an adapter here (and mounting the provider on the page)
  // keeps option-loading and form submit on the same client (R-56).
  const engineTransport =
    transport.http === "axios"
      ? `
/**
 * Adapter that lets the ENGINE's option-loading use axios as well.
 * The page mounts this via \`FormTransportProvider\`; without it the async /
 * infinite fields would keep using their built-in fetch default.
 */
export const optionsTransport: OptionsTransport = async (request, signal) => {
  const res = await axios.request({
    url: request.url,
    method: request.method,
    headers: { ...BASE_HEADERS, ...request.headers },
    params: request.params,
    data: request.body,
    signal,
  });
  return res.data;
};
`
      : "";

  return `import { BackendErrorResponse, BackendFieldError } from "@/hooks/useBackendErrors";${
    transport.http === "axios"
      ? `\nimport type { OptionsTransport } from "@/components/forms/transport/types";`
      : ""
  }
import { API_BASE, SUBMIT_PATH, BASE_HEADERS } from "./constants";

/**
 * Network layer for this form — the ONLY file here that talks to your backend
 * (AI_AGENT_RULES § R-55: component → hooks.ts → services.ts).
 *
${cliGatedNote("http", transport)}
 */

/**
 * Normalize any backend payload to AfnoUI's expected shape:
 * { success: false, message: string, errors?: [{ field, message }] }
 *
 * If your API uses a different format, edit only this function.
 */
function normalizeBackendError(data: unknown): BackendErrorResponse {
  if (typeof data !== "object" || data === null) {
    return { success: false, message: "Server error", errors: [] };
  }

  const payload = data as Record<string, unknown>;
  const message =
    (typeof payload.message === "string" && payload.message) ||
    (typeof payload.error === "string" && payload.error) ||
    "Server error";

  let errors: BackendFieldError[] = [];

  // Shape A: { errors: [{ field, message }] }
  if (Array.isArray(payload.errors)) {
    errors = payload.errors
      .map((item) => {
        if (typeof item !== "object" || item === null) return null;
        const e = item as Record<string, unknown>;
        const field = typeof e.field === "string" ? e.field : (typeof e.path === "string" ? e.path : null);
        const text = typeof e.message === "string" ? e.message : null;
        return field && text ? { field, message: text } : null;
      })
      .filter((e): e is BackendFieldError => e !== null);
  }

  // Shape B: { fieldErrors: { email: "Invalid", password: ["Too short"] } }
  if (errors.length === 0 && typeof payload.fieldErrors === "object" && payload.fieldErrors !== null) {
    const map = payload.fieldErrors as Record<string, unknown>;
    errors = Object.entries(map).flatMap(([field, raw]) => {
      if (typeof raw === "string") return [{ field, message: raw }];
      if (Array.isArray(raw)) {
        return raw
          .filter((x): x is string => typeof x === "string" && x.length > 0)
          .map((message) => ({ field, message }));
      }
      return [];
    });
  }

  return { success: false, message, errors };
}

${requestHelper}

${engineTransport}export const formService = {
  /**
   * Throws a normalized \`BackendErrorResponse\` on failure so the hook layer can
   * map it onto field errors. Nothing is swallowed here.
   */
  async submitForm(data: Record<string, unknown>): Promise<void> {
    try {
      await request(\`\${API_BASE}\${SUBMIT_PATH}\`, data);
    } catch (error: unknown) {
${errorAdapter}
    }
  },
};
`;
}
