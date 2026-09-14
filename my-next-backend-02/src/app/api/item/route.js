import { getClientPromise } from "@/lib/mongodb";
import { errorResponse, printExceptionLog, successResponse } from "@/lib/utils";
import { getCorsHeaders } from "@/lib/cors";

export async function OPTIONS(request) {
  return new Response(null, {
    status: 204,
    headers: getCorsHeaders(request),
  });
}

// GET all items (Filter out DELETED items)
export async function GET(request) {
  try {
    const client = await getClientPromise();
    const db = client.db(process.env.DB_NAME);

    const itemList = await db
      .collection("item")
      .find({ status: { $ne: "DELETED" } })
      .toArray();

    return successResponse({ itemList }, 200, request);
  } catch (error) {
    printExceptionLog("GET Items Exception", error);
    return errorResponse("GET Items Internal Error", 500, request);
  }
}

// POST item (Set default status to ACTIVE)
export async function POST(request) {
  try {
    const data = await request.json();
    const client = await getClientPromise();
    const db = client.db(process.env.DB_NAME);

    const newItem = {
      name: data.name,
      category: data.category,
      price: Number(data.price),
      amount: Number(data.amount),
      status: "ACTIVE",
    };

    const result = await db.collection("item").insertOne(newItem);

    return successResponse({ id: result.insertedId }, 201, request);
  } catch (error) {
    printExceptionLog("POST Item Exception", error);
    return errorResponse("POST Item Internal Error", 500, request);
  }
}