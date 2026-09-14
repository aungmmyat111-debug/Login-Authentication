// src/lib/cors.js
// Dynamic CORS headers: echoes the request Origin when it is in the
// allowlist. Credentialed requests (cookies) require an exact origin match,
// so a static header breaks every time the frontend is served from a
// different origin (localhost dev, Vercel preview, new deployment).

const DEFAULT_FRONTEND_ORIGIN = "https://login-authentication-chi-nine.vercel.app";

function getAllowedOrigins() {
  const origins = [DEFAULT_FRONTEND_ORIGIN];
  // FRONTEND_URL may hold a comma-separated list of allowed origins.
  const envOrigins = (process.env.FRONTEND_URL || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
  origins.push(...envOrigins);
  return origins;
}

function isAllowedOrigin(origin) {
  if (!origin) return false;
  if (getAllowedOrigins().includes(origin)) return true;
  // Local dev servers on any port.
  if (/^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$/.test(origin)) {
    return true;
  }
  // Any Vercel deployment of the frontend (production or preview).
  if (/^https:\/\/[a-z0-9-]+\.vercel\.app$/.test(origin)) {
    return true;
  }
  return false;
}

export function getCorsHeaders(request) {
  const origin = request?.headers?.get("origin");
  return {
    "Access-Control-Allow-Credentials": "true",
    // If the origin is not allowed, fall back to the default origin so the
    // browser rejects the response (origin mismatch) instead of accepting it.
    "Access-Control-Allow-Origin": isAllowedOrigin(origin)
      ? origin
      : getAllowedOrigins()[0],
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
}
