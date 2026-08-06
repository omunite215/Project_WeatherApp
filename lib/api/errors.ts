/**
 * Typed transport errors shared by the route handlers and the browser client.
 *
 * Every failure carries a `userMessage` that is safe to render directly, so
 * components never have to interpret a status code or invent copy. `retryable`
 * drives TanStack Query's retry decision: an unknown city is a user error and
 * retrying it three times only delays the message.
 */

export type ApiErrorCode =
  | "CITY_NOT_FOUND"
  | "INVALID_KEY"
  | "RATE_LIMITED"
  | "BAD_REQUEST"
  | "INVALID_RESPONSE"
  | "UPSTREAM_ERROR"
  | "NETWORK"
  | "UNKNOWN";

const USER_MESSAGES: Record<ApiErrorCode, string> = {
  CITY_NOT_FOUND: "We couldn't find that place. Try a different spelling.",
  INVALID_KEY: "The weather service rejected our API key.",
  RATE_LIMITED: "Too many requests right now. Try again in a moment.",
  BAD_REQUEST: "That request wasn't valid.",
  INVALID_RESPONSE: "The weather service returned data we couldn't read.",
  UPSTREAM_ERROR: "The weather service is having trouble. Try again shortly.",
  NETWORK: "Can't reach the network. Check your connection.",
  UNKNOWN: "Something went wrong. Try again.",
};

/** Codes where a retry has a realistic chance of succeeding. */
const RETRYABLE: ReadonlySet<ApiErrorCode> = new Set<ApiErrorCode>([
  "RATE_LIMITED",
  "UPSTREAM_ERROR",
  "NETWORK",
]);

export class ApiError extends Error {
  readonly code: ApiErrorCode;
  readonly status: number;
  readonly userMessage: string;

  constructor(code: ApiErrorCode, status: number, detail?: string) {
    super(detail ?? USER_MESSAGES[code]);
    this.name = "ApiError";
    this.code = code;
    this.status = status;
    this.userMessage = USER_MESSAGES[code];
  }

  get retryable(): boolean {
    return RETRYABLE.has(this.code);
  }

  /** Body shape returned to the browser by every route handler. */
  toResponseBody() {
    return {
      error: { code: this.code, message: this.userMessage },
    };
  }
}

/** Maps an upstream OpenWeather HTTP status onto a domain error code. */
export function codeFromUpstreamStatus(status: number): ApiErrorCode {
  if (status === 404) return "CITY_NOT_FOUND";
  if (status === 401 || status === 403) return "INVALID_KEY";
  if (status === 429) return "RATE_LIMITED";
  if (status >= 500) return "UPSTREAM_ERROR";
  if (status >= 400) return "BAD_REQUEST";
  return "UNKNOWN";
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

/**
 * Reconstructs an ApiError from a route handler's JSON body so the browser side
 * keeps the same type and retry semantics as the server.
 */
export function apiErrorFromResponseBody(
  body: unknown,
  status: number,
): ApiError {
  if (
    typeof body === "object" &&
    body !== null &&
    "error" in body &&
    typeof (body as { error: unknown }).error === "object" &&
    (body as { error: unknown }).error !== null
  ) {
    const inner = (body as { error: { code?: unknown } }).error;
    const code = inner.code;
    if (typeof code === "string" && code in USER_MESSAGES) {
      return new ApiError(code as ApiErrorCode, status);
    }
  }
  return new ApiError(codeFromUpstreamStatus(status), status);
}
