import { NextResponse } from "next/server";
import { getCorsHeaders } from "./cors";

export function printExceptionLog(logMessage, error) {
  console.log(`==>${logMessage} Exception`);
  console.log(error);
}

export function errorResponse(message, status, request) {
  return NextResponse.json(
    { message },
    {
      status,
      headers: getCorsHeaders(request),
    }
  );
}

export function successResponse(jsonData, status = 200, request) {
  return NextResponse.json(jsonData, {
    status,
    headers: getCorsHeaders(request),
  });
}

// Cookie flags that work for local dev (http://localhost) and cross-origin
// production (https) alike. Derived from the backend's own protocol instead
// of NODE_ENV: Vercel forces "production" but a local .env.local may set
// "development", making env-based flags unreliable.
export function getCookieOptions(request, extra = {}) {
  const isHttps = request?.nextUrl?.protocol === "https:";
  return {
    httpOnly: true,
    sameSite: isHttps ? "none" : "lax",
    path: "/",
    secure: isHttps,
    ...extra,
  };
}
