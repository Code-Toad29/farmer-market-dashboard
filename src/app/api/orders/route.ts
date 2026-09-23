import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    
    let queryText = `
      SELECT 
        o.id,
        o.order_id,
        b.buyer_name as buyer,
        f.farmer_name as farmer,
        pr.product_name as product,
        o.quantity_kg as qty,
        o.total_price as total,
        os.status_name as status,
        o.order_date,
        o.collection_date
      FROM orders o
      JOIN buyers b ON b.id = o.buyer_id
      JOIN produce pr ON pr.id = o.produce_id
      JOIN farmers f ON f.id = pr.farmer_id
      JOIN order_status os ON os.id = o.status_id
    `;

    const values: string[] = [];
    if (status && status !== "All") {
      queryText += ` WHERE os.status_name = $1`;
      values.push(status);
    }
    queryText += ` ORDER BY o.order_date DESC`;

    const rows = await query(queryText, values);
    return NextResponse.json(rows);
  } catch {
    return NextResponse.json(
      { message: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.buyerId || !body.listingId || !body.quantity) {
      return NextResponse.json(
        { message: "Missing required fields: buyerId, listingId, quantity" },
        { status: 400 }
      );
    }

    const rows = await query(
      `SELECT place_order($1, $2, $3) AS order_id`,
      [body.buyerId, body.listingId, body.quantity]
    );

    return NextResponse.json(
      { 
        message: "Order placed successfully",
        orderId: rows[0]?.order_id 
      },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { message: "Failed to place order" },
      { status: 400 }
    );
  }
}