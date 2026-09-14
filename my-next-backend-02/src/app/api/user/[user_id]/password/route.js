//src/app/api/user/[user_id]/password/route.js

import corsHeaders from "@/lib/cors";
import { isAdmin } from "@/lib/auth";
import { getClientPromise } from "@/lib/mongodb";
import { errorResponse, printExceptionLog, successResponse } from "@/lib/utils";
import { ObjectId } from "mongodb";
import bcrypt from "bcrypt";

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
}

// Change a user's password (Admin only)
export async function PUT(request, { params }) {
  if (!isAdmin(request)) {
    return errorResponse("Unauthorized Request", 403);
  }

  const { user_id } = await params;

  if (!ObjectId.isValid(user_id)) {
    return errorResponse("Invalid User ID format", 400);
  }

  const data = await request.json();
  const newPassword = data.newPassword;

  if (!newPassword || newPassword.length < 6) {
    return errorResponse("New password must be at least 6 characters", 400);
  }

  try {
    const client = await getClientPromise();
    const db = client.db(process.env.DB_NAME);

    const updateResult = await db.collection("user").updateOne(
      { _id: new ObjectId(user_id) },
      { $set: { password: await bcrypt.hash(newPassword, 12) } }
    );

    if (updateResult.matchedCount === 0) {
      return errorResponse("User not found", 404);
    }

    return successResponse({ message: "Password change success" }, 200);
  } catch (error) {
    printExceptionLog("Change Password Exception", error);
    return errorResponse("Change Password Internal Error", 500);
  }
}
