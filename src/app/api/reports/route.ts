import { NextResponse } from "next/server";
import { query } from "@/lib/db";

// GET - Reports data
export async function GET() {
  try {
    const [avgPriceByCategory, stockByCategory, listingsByCategory, topFarmers, orderValueByStatus] = await Promise.all([
      // Average price per category
      query(`
        SELECT 
          c.category_name as category,
          AVG(p.price_per_kg) as avg_price
        FROM produce p
        JOIN categories c ON c.id = p.category_id
        WHERE p.is_available = true
        GROUP BY c.id, c.category_name
        ORDER BY avg_price DESC
      `),
      
      // Total available stock by category
      query(`
        SELECT 
          c.category_name as category,
          SUM(p.quantity_kg) as total_stock
        FROM produce p
        JOIN categories c ON c.id = p.category_id
        WHERE p.is_available = true
        GROUP BY c.id, c.category_name
        ORDER BY total_stock DESC
      `),
      
      // Number of listings by category
      query(`
        SELECT 
          c.category_name as category,
          COUNT(p.id) as listings
        FROM categories c
        LEFT JOIN produce p ON p.category_id = c.id AND p.is_available = true
        GROUP BY c.id, c.category_name
        ORDER BY listings DESC
      `),
      
      // Top rated farmers
      query(`
        SELECT 
          f.farmer_name as farmer,
          f.rating,
          COUNT(r.id) as review_count
        FROM farmers f
        LEFT JOIN reviews r ON r.farmer_id = f.id
        WHERE f.rating IS NOT NULL
        GROUP BY f.id, f.farmer_name, f.rating
        ORDER BY f.rating DESC
        LIMIT 10
      `),
      
      // Order value by status
      query(`
        SELECT 
          os.status_name as status,
          COUNT(o.id) as count,
          COALESCE(SUM(o.total_price), 0) as total_value
        FROM order_status os
        LEFT JOIN orders o ON o.status_id = os.id
        GROUP BY os.id, os.status_name
        ORDER BY os.id
      `),
    ]);

    return NextResponse.json({
      avgPriceByCategory,
      stockByCategory,
      listingsByCategory,
      topFarmers,
      orderValueByStatus,
    });
  } catch (error) {
    console.error("Error fetching reports:", error);
    return NextResponse.json(
      { message: "Failed to fetch reports data" },
      { status: 500 }
    );
  }
}