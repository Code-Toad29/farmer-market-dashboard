import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
  try {
    const rows = await query(`
      SELECT 
        f.id,
        f.farmer_name as name,
        f.farm_name as farm,
        pv.province_name as province,
        f.location,
        f.email,
        f.phone,
        f.rating,
        f.is_verified as verified,
        f.created_at as created
      FROM farmers f
      JOIN provinces pv ON pv.id = f.province_id
      ORDER BY f.farmer_name
    `);
    return NextResponse.json(rows);
  } catch {
    return NextResponse.json(
      { message: "Failed to fetch farmers" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const required = ['farmerName', 'farmName', 'provinceId', 'email', 'phone'];
    for (const field of required) {
      if (!body[field]) {
        return NextResponse.json(
          { message: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    const rows = await query(
      `SELECT add_farmer($1, $2, $3, $4, $5, $6, $7) AS farmer_id`,
      [
        body.farmerName,
        body.farmName,
        body.provinceId,
        body.location ?? null,
        body.email,
        body.phone,
        body.isVerified ?? false,
      ]
    );

    return NextResponse.json(
      { 
        message: "Farmer created successfully",
        farmerId: rows[0]?.farmer_id 
      },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { message: "Failed to create farmer" },
      { status: 400 }
    );
  }
}