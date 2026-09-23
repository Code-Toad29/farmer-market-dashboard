import { NextResponse } from "next/server";
import { getListings } from "@/lib/data";
import { query } from "@/lib/db";

// GET - Fetch all listings
export async function GET() {
  try {
    const rows = await getListings();
    return NextResponse.json(rows);
  } catch {
    return NextResponse.json(
      { message: "Failed to fetch listings" },
      { status: 500 }
    );
  }
}

// POST - Create a new listing
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate required fields
    const required = ['farmerId', 'productName', 'categoryId', 'pricePerKg', 'quantityKg', 'harvestDate'];
    for (const field of required) {
      if (!body[field]) {
        return NextResponse.json(
          { message: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Call the database function add_listing
    const rows = await query(
      `SELECT add_listing($1, $2, $3, $4, $5, $6, $7) AS listing_id`,
      [
        body.farmerId,
        body.productName,
        body.categoryId,
        body.pricePerKg,
        body.quantityKg,
        body.harvestDate,
        body.description ?? null,
      ]
    );

    return NextResponse.json(
      { 
        message: "Listing created successfully",
        listingId: rows[0]?.listing_id 
      },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { message: "Failed to create listing" },
      { status: 400 }
    );
  }
}