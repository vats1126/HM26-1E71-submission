import { NextResponse } from "next/server";

/**
 * Custom API error class for structured error responses.
 * Extends the native Error with an HTTP status code and a machine-readable code.
 */
export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly code: string;

  constructor(message: string, statusCode: number, code: string) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.code = code;

    // Maintain proper prototype chain for instanceof checks
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

// ---------------------------------------------------------------------------
// Factory helpers — convenient shortcuts for common HTTP error responses
// ---------------------------------------------------------------------------

/** Create a 400 Bad Request error. */
export function badRequest(message = "Bad request"): ApiError {
  return new ApiError(message, 400, "BAD_REQUEST");
}

/** Create a 401 Unauthorized error. */
export function unauthorized(message = "Unauthorized"): ApiError {
  return new ApiError(message, 401, "UNAUTHORIZED");
}

/** Create a 404 Not Found error. */
export function notFound(message = "Resource not found"): ApiError {
  return new ApiError(message, 404, "NOT_FOUND");
}

/** Create a 500 Internal Server Error. */
export function serverError(message = "Internal server error"): ApiError {
  return new ApiError(message, 500, "SERVER_ERROR");
}

// ---------------------------------------------------------------------------
// Sanitisation
// ---------------------------------------------------------------------------

/**
 * Patterns that may leak sensitive Supabase / database details.
 *
 * Each tuple is [regex, replacement]. Order matters — more specific patterns
 * should come first so they are matched before the generic fallback.
 */
const SENSITIVE_PATTERNS: [RegExp, string][] = [
  // Supabase service-role / anon keys (JWT-shaped, typically 200+ chars)
  [/eyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}/g, "[REDACTED]"],
  // Supabase project URLs  (e.g. https://xyzabc.supabase.co)
  [/https?:\/\/[a-zA-Z0-9-]+\.supabase\.co[^\s]*/g, "[REDACTED]"],
  // Generic connection strings (postgres://, postgresql://, mysql://)
  [/(?:postgres(?:ql)?|mysql):\/\/[^\s]+/gi, "[REDACTED]"],
  // Inline password / key assignments (password=…, apikey=…, secret=…)
  [/(?:password|apikey|api_key|secret|token|authorization)\s*[=:]\s*\S+/gi, "[REDACTED]"],
];

/**
 * Return a safe error message string, stripping any Supabase URLs,
 * API keys, connection strings, or other credential patterns.
 */
export function sanitizeError(error: unknown): string {
  let message: string;

  if (error instanceof Error) {
    message = error.message;
  } else if (typeof error === "string") {
    message = error;
  } else {
    return "An unexpected error occurred";
  }

  for (const [pattern, replacement] of SENSITIVE_PATTERNS) {
    message = message.replace(pattern, replacement);
  }

  return message;
}

// ---------------------------------------------------------------------------
// Response builder
// ---------------------------------------------------------------------------

/**
 * Convert any thrown value into a structured JSON `NextResponse`.
 *
 * - `ApiError` instances use their own statusCode and code.
 * - Generic `Error` instances return 500 with a sanitised message.
 * - All other values return a generic 500 response.
 *
 * Stack traces, database credentials, and internal details are **never**
 * included in the response body.
 */
export function createErrorResponse(error: unknown): NextResponse {
  if (error instanceof ApiError) {
    return NextResponse.json(
      { error: { message: sanitizeError(error), code: error.code } },
      { status: error.statusCode },
    );
  }

  if (error instanceof Error) {
    return NextResponse.json(
      { error: { message: sanitizeError(error), code: "SERVER_ERROR" } },
      { status: 500 },
    );
  }

  return NextResponse.json(
    { error: { message: "An unexpected error occurred", code: "SERVER_ERROR" } },
    { status: 500 },
  );
}
