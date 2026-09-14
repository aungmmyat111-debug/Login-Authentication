// src/app/api/auth/login/route.js
import { getCorsHeaders } from "@/lib/cors";
import { getClientPromise } from "@/lib/mongodb";
import { errorResponse, getCookieOptions } from "@/lib/utils";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

const JWT_SECRET = process.env.JWT_SECRET;
const adminUser = process.env.ADMIN_USER;
const adminPass = process.env.ADMIN_PASS;
const DB_NAME = process.env.DB_NAME;

export async function OPTIONS(req) {
  return NextResponse.json({}, { headers: getCorsHeaders(req) });
}

export async function POST(req) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return errorResponse("Missing email or password", 400, req);
    }

    const admin = checkAdmin(email, password);
    const user = !admin ? await checkUser(email, password) : admin;

    if (!user) {
      return errorResponse("Invalid email or password", 401, req);
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, username: user.username },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    const response = NextResponse.json(
      { message: "Login successful", user },
      { status: 200, headers: getCorsHeaders(req) }
    );

    response.cookies.set("token", token, getCookieOptions(req, { maxAge: 60 * 60 * 24 * 7 }));

    return response;
  } catch (error) {
    console.error("Login POST exception:", error);
    return errorResponse("Internal server error", 500, req);
  }
}

function checkAdmin(email, password) {
  if (!adminUser || !adminPass) return false;
  if (adminUser === email && adminPass === password) {
    return { _id: "-1", email, username: "admin" };
  }
  return false;
}

async function checkUser(email, password) {
  try {
    const client = await getClientPromise();
    const db = client.db(DB_NAME);
    const user = await db.collection("user").findOne({ email });
    if (!user) return false;

    const isValid = await bcrypt.compare(password, user.password);
    return isValid ? user : false;
  } catch (error) {
    console.error("checkUser exception:", error);
    return false;
  }
}