// src/app/api/me/route.js
import { verifyJWT } from "@/lib/auth";
import corsHeaders from "@/lib/cors";
import { errorResponse } from "@/lib/utils";
import { NextResponse } from "next/server";

export async function GET(request) {
  const user = verifyJWT(request);
  if (!user) {
    return errorResponse("Unauthorized Request", 401);
  }

  return NextResponse.json(
    { user },
    {
      status: 200,
      headers: corsHeaders,
    }
  );
}

// Add an OPTIONS handler for CORS preflight
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}