import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
  try {
    const rows = await query(`
      SELECT 
        r.id,
        f.farmer_name as farmer,
        b.buyer_name as buyer,
        o.order_id,
        r.rating,
        r.comment,
        r.created_at as date_posted
      FROM reviews r
      JOIN farmers f ON f.id = r.farmer_id
      JOIN buyers b ON b.id = r.buyer_id
      JOIN orders o ON o.id = r.order_id
      ORDER BY r.created_at DESC
    `);
    return NextResponse.json(rows);
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to fetch reviews" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const required = ['farmerId', 'buyerId', 'orderId', 'rating'];
    for (const field of required) {
      if (!body[field]) {
        return NextResponse.json(
          { message: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    if (body.rating < 1 || body.rating > 5) {
      return NextResponse.json(
        { message: "Rating must be between 1 and 5" },
        { status: 400 }
      );
    }

    const rows = await query(`
      INSERT INTO reviews (farmer_id, buyer_id, order_id, rating, comment)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, rating, comment, created_at as date_posted
    `, [
      body.farmerId,
      body.buyerId,
      body.orderId,
      body.rating,
      body.comment ?? null,
    ]);

    return NextResponse.json(
      { 
        message: "Review created successfully",
        review: rows[0]
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to create review" },
      { status: 400 }
    );
  }
}