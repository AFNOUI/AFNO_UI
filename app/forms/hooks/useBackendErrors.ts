/**
 * useBackendErrors — Hook + utilities for handling backend validation errors.
 * Optional — only import if your form needs server-side error mapping.
 *
 * Standard backend error format:
 * { success: false, message: "Validation failed", errors: [{ field: "email", message: "Already exists" }] }
 *
 * If your backend uses a different format, use mapBackendErrors() to transform it.
 */

export interface BackendFieldError {
  /** Field name — must match the `name` in your FormConfig field */
  field: string;
  /** Error message to display */
  message: string;
}

export interface BackendErrorResponse {
  success: false;
  message: string;
  errors?: BackendFieldError[];
}

/**
 * Helper to map custom backend error formats to the standard format.
 *
 * Example:
 *   const mapped = mapBackendErrors(apiResponse, (res) => ({
 *     message: res.error,
 *     errors: Object.entries(res.fieldErrors).map(([field, msg]) => ({ field, message: msg as string })),
 *   }));
 */
export function mapBackendErrors<T>(
  response: T,
  mapper: (res: T) => { message: string; errors?: BackendFieldError[] }
): BackendErrorResponse {
  const mapped = mapper(response);
  return { success: false, ...mapped };
}
