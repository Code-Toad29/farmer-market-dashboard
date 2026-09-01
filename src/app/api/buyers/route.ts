import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
  try {
    const rows = await query(`
      SELECT 
        b.id,
        b.buyer_name as name,
        b.email,
        b.phone,
        bt.type_name as buyer_type,
        b.location,
        b.created_at as created
      FROM buyers b
      JOIN buyer_type bt ON bt.id = b.buyer_type_id
      ORDER BY b.buyer_name
    `);
    return NextResponse.json(rows);
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to fetch buyers" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const required = ['buyerName', 'email', 'phone', 'buyerTypeId'];
    for (const field of required) {
      if (!body[field]) {
        return NextResponse.json(
          { message: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    const rows = await query(`
      INSERT INTO buyers (buyer_name, email, phone, buyer_type_id, location)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, buyer_name as name, email, phone
    `, [
      body.buyerName,
      body.email,
      body.phone,
      body.buyerTypeId,
      body.location ?? null,
    ]);

    return NextResponse.json(
      { 
        message: "Buyer created successfully",
        buyer: rows[0]
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to create buyer" },
      { status: 400 }
    );
  }
}