import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
  try {
    const [listings, farmers, orders, revenue, categoryData, orderStatusData, topFarmers] = await Promise.all([
      query(`SELECT COUNT(*) as count FROM produce WHERE is_available = true`),
      query(`SELECT COUNT(*) as count FROM farmers`),
      query(`SELECT COUNT(*) as count FROM orders WHERE status_id IN (1, 2)`),
      query(`SELECT COALESCE(SUM(total_price), 0) as total FROM orders WHERE status_id = 3`),
      query(`
        SELECT 
          c.category_name as category,
          COUNT(p.id) as listings
        FROM categories c
        LEFT JOIN produce p ON p.category_id = c.id AND p.is_available = true
        GROUP BY c.id, c.category_name
        ORDER BY listings DESC
      `),
      query(`
        SELECT 
          os.status_name as name,
          COUNT(o.id) as value,
          CASE 
            WHEN os.status_name = 'Pending' THEN '#F59E0B'
            WHEN os.status_name = 'Confirmed' THEN '#3B82F6'
            WHEN os.status_name = 'Collected' THEN '#22C55E'
            WHEN os.status_name = 'Cancelled' THEN '#EF4444'
          END as color
        FROM order_status os
        LEFT JOIN orders o ON o.status_id = os.id
        GROUP BY os.id, os.status_name
        ORDER BY os.id
      `),
      query(`
        SELECT 
          f.farmer_name as name,
          f.rating,
          COUNT(r.id) as review_count
        FROM farmers f
        LEFT JOIN reviews r ON r.farmer_id = f.id
        WHERE f.rating IS NOT NULL
        GROUP BY f.id, f.farmer_name, f.rating
        ORDER BY f.rating DESC
        LIMIT 5
      `),
    ]);

    return NextResponse.json({
      stats: {
        listings: parseInt(listings[0]?.count || "0"),
        farmers: parseInt(farmers[0]?.count || "0"),
        orders: parseInt(orders[0]?.count || "0"),
        revenue: parseInt(revenue[0]?.total || "0"),
      },
      categoryData,
      orderStatusData,
      topFarmers,
    });
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
}