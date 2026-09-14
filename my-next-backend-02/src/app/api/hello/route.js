import { getCorsHeaders } from "@/lib/cors";
import { NextResponse } from "next/server";

// Handle preflight OPTIONS requests
export async function OPTIONS(request) {
  return new Response(null, {
    status: 200,
    headers: getCorsHeaders(request),
  });
}

export async function GET(request) {
  const message = {
    message: "hello world"
  };

  return NextResponse.json(message, {
    headers: getCorsHeaders(request),
  });
}
