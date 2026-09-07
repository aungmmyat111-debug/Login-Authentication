import { getClientPromise } from "@/lib/mongodb";
import { errorResponse, printExceptionLog, successResponse } from "@/lib/utils";
import { ObjectId } from "mongodb";
import corsHeaders from "@/lib/cors";

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
}

export async function GET(request, { params }) {
  const { item_id } = await params;

  if (!ObjectId.isValid(item_id)) {
    return errorResponse("Invalid Item ID format", 400);
  }

  try {
    const client = await getClientPromise();
    const db = client.db(process.env.DB_NAME);
    
    // Find item only if it is NOT soft deleted
    const item = await db.collection("item").findOne({
      _id: new ObjectId(item_id),
      status: { $ne: "DELETED" },
    });

    if (!item) {
      return errorResponse("Item not found", 404);
    }

    return successResponse({ item }, 200);
  } catch (error) {
    printExceptionLog("GET Item Exception", error);
    return errorResponse("GET Item Internal Error", 500);
  }
}

export async function DELETE(request, { params }) {
  const { item_id } = await params;

  if (!ObjectId.isValid(item_id)) {
    return errorResponse("Invalid Item ID format", 400);
  }

  try {
    const client = await getClientPromise();
    const db = client.db(process.env.DB_NAME);

    // Soft delete by updating status to "DELETED"
    const deleteResult = await db.collection("item").updateOne(
      { _id: new ObjectId(item_id) },
      {
        $set: {
          status: "DELETED",
        },
      }
    );

    if (deleteResult.matchedCount === 0) {
      return errorResponse("Item not found", 404);
    }

    return successResponse({ message: "Delete Success" }, 200);
  } catch (error) {
    printExceptionLog("DELETE Item Exception", error);
    return errorResponse("DELETE Item Internal Error", 500);
  }
}

export async function PUT(request, { params }) {
  const { item_id } = await params;

  if (!ObjectId.isValid(item_id)) {
    return errorResponse("Invalid Item ID format", 400);
  }

  try {
    const data = await request.json();
    const client = await getClientPromise();
    const db = client.db(process.env.DB_NAME);

    // Update only active items
    const updatedResult = await db.collection("item").updateOne(
      { 
        _id: new ObjectId(item_id),
        status: { $ne: "DELETED" }
      },
      {
        $set: {
          name: data.name,
          category: data.category,
          price: Number(data.price),
          amount: Number(data.amount),
        },
      }
    );

    if (updatedResult.matchedCount === 0) {
      return errorResponse("Item not found", 404);
    }

    return successResponse({ message: "Item update success" }, 200);
  } catch (error) {
    printExceptionLog("PUT Item Exception", error);
    return errorResponse("PUT Item Internal Error", 500);
  }
}