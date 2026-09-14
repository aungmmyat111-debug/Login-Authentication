// src/lib/cors.js
const corsHeaders = {
  "Access-Control-Allow-Credentials": "true",
  "Access-Control-Allow-Origin": process.env.FRONTEND_URL,
  "Access-Control-Allow-Methods": "GET, POST, PUT, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Max-Age": "86400",
};

export default corsHeaders;