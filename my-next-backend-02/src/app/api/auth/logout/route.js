// src/app/api/auth/logout/route.js
import { getCorsHeaders } from "@/lib/cors";
import { getCookieOptions } from "@/lib/utils";
import { NextResponse } from "next/server";

export async function GET(request) {
  const response = NextResponse.json(
    { message: "Logout successful" },
    { status: 200, headers: getCorsHeaders(request) }
  );

  response.cookies.set("token", "", getCookieOptions(request, { maxAge: 0 }));

  return response;
}
