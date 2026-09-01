import { NextResponse } from "next/server";
import { query } from "@/lib/db";

// GET - Price history for a specific listing
export async function GET(
  request: Request,
  { params }: { params: { listingId: string } }
) {
  try {
    const listingId = parseInt(params.listingId);
    if (isNaN(listingId)) {
      return NextResponse.json(
        { message: "Invalid listing ID" },
        { status: 400 }
      );
    }

    const rows = await query(`
      SELECT 
        ph.id,
        ph.old_price,
        ph.new_price,
        ph.change_date as changed_at,
        ph.changed_by
      FROM price_history ph
      WHERE ph.produce_id = $1
      ORDER BY ph.change_date DESC
    `, [listingId]);

    return NextResponse.json(rows);
  } catch (error) {
    console.error("Error fetching price history:", error);
    return NextResponse.json(
      { message: "Failed to fetch price history" },
      { status: 500 }
    );
  }
}