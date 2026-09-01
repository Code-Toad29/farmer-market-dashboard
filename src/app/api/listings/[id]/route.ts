import { NextResponse } from "next/server";
import { query } from "@/lib/db";

// GET - Fetch a single listing by ID
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json(
        { message: "Invalid listing ID" },
        { status: 400 }
      );
    }

    const rows = await query(`
      SELECT 
        p.id,
        p.product_name as name,
        c.category_name as category,
        f.id as farmer_id,
        f.farmer_name as farmer,
        f.farm_name as farm,
        p.price_per_kg as price,
        p.quantity_kg as quantity,
        p.is_available as available,
        p.harvest_date,
        p.description,
        p.created_at
      FROM produce p
      JOIN categories c ON c.id = p.category_id
      JOIN farmers f ON f.id = p.farmer_id
      WHERE p.id = $1
    `, [id]);

    if (rows.length === 0) {
      return NextResponse.json(
        { message: "Listing not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error("Error fetching listing:", error);
    return NextResponse.json(
      { message: "Failed to fetch listing" },
      { status: 500 }
    );
  }
}

// PATCH - Update a listing (price, quantity, description)
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json(
        { message: "Invalid listing ID" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    // Build dynamic update query
    if (body.price !== undefined) {
      updates.push(`price_per_kg = $${paramIndex++}`);
      values.push(body.price);
    }
    if (body.quantity !== undefined) {
      updates.push(`quantity_kg = $${paramIndex++}`);
      values.push(body.quantity);
    }
    if (body.description !== undefined) {
      updates.push(`description = $${paramIndex++}`);
      values.push(body.description);
    }
    if (body.isAvailable !== undefined) {
      updates.push(`is_available = $${paramIndex++}`);
      values.push(body.isAvailable);
    }

    if (updates.length === 0) {
      return NextResponse.json(
        { message: "No fields to update" },
        { status: 400 }
      );
    }

    values.push(id);
    const queryText = `
      UPDATE produce 
      SET ${updates.join(", ")}, updated_at = NOW()
      WHERE id = $${paramIndex}
      RETURNING id, product_name, price_per_kg, quantity_kg, is_available
    `;

    const rows = await query(queryText, values);

    if (rows.length === 0) {
      return NextResponse.json(
        { message: "Listing not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Listing updated successfully",
      listing: rows[0]
    });
  } catch (error) {
    console.error("Error updating listing:", error);
    return NextResponse.json(
      { message: "Failed to update listing" },
      { status: 400 }
    );
  }
}

// DELETE - Deactivate a listing (soft delete)
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json(
        { message: "Invalid listing ID" },
        { status: 400 }
      );
    }

    // Soft delete - set is_available to false
    const rows = await query(`
      UPDATE produce 
      SET is_available = false, updated_at = NOW()
      WHERE id = $1
      RETURNING id, product_name, is_available
    `, [id]);

    if (rows.length === 0) {
      return NextResponse.json(
        { message: "Listing not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Listing deactivated successfully",
      listing: rows[0]
    });
  } catch (error) {
    console.error("Error deactivating listing:", error);
    return NextResponse.json(
      { message: "Failed to deactivate listing" },
      { status: 400 }
    );
  }
}