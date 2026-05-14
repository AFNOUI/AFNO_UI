export function generateFormServiceCode(): string {
  return `import axios from "axios";
import { BackendErrorResponse, BackendFieldError } from "@/hooks/useBackendErrors";

const API_BASE = "/api";

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

export const formService = {
  async submitForm(data: Record<string, unknown>): Promise<void> {
    try {
      await axios.post(\`\${API_BASE}/forms/submit\`, data);
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response?.data !== undefined) {
        throw normalizeBackendError(error.response.data);
      }
      throw { success: false, message: "Network error — please try again", errors: [] } as BackendErrorResponse;
    }
  },
};
`;
}
