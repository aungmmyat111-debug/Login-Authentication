// src/lib/auth.js
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

export function verifyJWT(req) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token) return null;
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    console.error("JWT Verification error:", err);
    return null;
  }
}
export function isAdmin(request) { 

    const headers = request.headers; 
  
    const userId = Number(headers.get(X_HEADER_USER_ID)); 
  
    return userId == -1; 
  
  } 