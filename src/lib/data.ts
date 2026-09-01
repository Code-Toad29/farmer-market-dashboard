// import { query } from "./db";

// // Dashboard Stats
// export async function getDashboardStats() {
//   const [listings, farmers, orders, revenue] = await Promise.all([
//     query(`SELECT COUNT(*) as count FROM produce WHERE is_available = true`),
//     query(`SELECT COUNT(*) as count FROM farmers`),
//     query(`SELECT COUNT(*) as count FROM orders WHERE status_id IN (1, 2)`),
//     query(`SELECT COALESCE(SUM(total_price), 0) as total FROM orders WHERE status_id = 3`),
//   ]);

//   return {
//     listings: parseInt(listings[0]?.count || "0"),
//     farmers: parseInt(farmers[0]?.count || "0"),
//     orders: parseInt(orders[0]?.count || "0"),
//     revenue: parseInt(revenue[0]?.total || "0"),
//   };
// }

// // Listings by Category
// export async function getListingsByCategory() {
//   return query(`
//     SELECT 
//       c.category_name as category,
//       COUNT(p.id) as listings
//     FROM categories c
//     LEFT JOIN produce p ON p.category_id = c.id AND p.is_available = true
//     GROUP BY c.id, c.category_name
//     ORDER BY listings DESC
//   `);
// }

// // Order Status Distribution
// export async function getOrderStatusDistribution() {
//   return query(`
//     SELECT 
//       os.status_name as name,
//       COUNT(o.id) as value,
//       CASE 
//         WHEN os.status_name = 'Pending' THEN '#F59E0B'
//         WHEN os.status_name = 'Confirmed' THEN '#3B82F6'
//         WHEN os.status_name = 'Collected' THEN '#22C55E'
//         WHEN os.status_name = 'Cancelled' THEN '#EF4444'
//       END as color
//     FROM order_status os
//     LEFT JOIN orders o ON o.status_id = os.id
//     GROUP BY os.id, os.status_name
//     ORDER BY os.id
//   `);
// }

// // Recent Orders
// export async function getRecentOrders(limit: number = 5) {
//   return query(`
//     SELECT 
//       o.id,
//       o.order_id,
//       b.buyer_name as buyer,
//       pr.product_name as product,
//       o.quantity_kg as qty,
//       o.total_price as total,
//       os.status_name as status,
//       o.order_date
//     FROM orders o
//     JOIN buyers b ON b.id = o.buyer_id
//     JOIN produce pr ON pr.id = o.produce_id
//     JOIN order_status os ON os.id = o.status_id
//     ORDER BY o.order_date DESC
//     LIMIT $1
//   `, [limit]);
// }

// // Province Stats for Map
// export async function getProvinceStats() {
//   return query(`
//     SELECT 
//       pv.province_name as name,
//       COUNT(DISTINCT f.id) as farmers,
//       COUNT(pr.id) as listings
//     FROM provinces pv
//     LEFT JOIN farmers f ON f.province_id = pv.id
//     LEFT JOIN produce pr ON pr.farmer_id = f.id AND pr.is_available = true
//     GROUP BY pv.id, pv.province_name
//     ORDER BY farmers DESC
//   `);
// }
import { query } from "./db";

// --- Types for each query ---
interface CountResult { count: string }
interface TotalResult { total: string }
interface CategoryRow { category: string; listings: number }
interface StatusRow { name: string; value: number; color: string }
interface OrderRow {
  id: number;
  order_id: string;
  buyer: string;
  product: string;
  qty: number;
  total: number;
  status: string;
  order_date: string;
}
interface ProvinceRow { name: string; farmers: number; listings: number }

// --- Dashboard Stats ---
export async function getDashboardStats() {
  const [listings, farmers, orders, revenue] = await Promise.all([
    query<CountResult>("SELECT COUNT(*) as count FROM produce WHERE is_available = true"),
    query<CountResult>("SELECT COUNT(*) as count FROM farmers"),
    query<CountResult>("SELECT COUNT(*) as count FROM orders WHERE status_id IN (1, 2)"),
    query<TotalResult>("SELECT COALESCE(SUM(total_price), 0) as total FROM orders WHERE status_id = 3"),
  ]);

  return {
    listings: parseInt(listings[0]?.count || "0"),
    farmers: parseInt(farmers[0]?.count || "0"),
    orders: parseInt(orders[0]?.count || "0"),
    revenue: parseInt(revenue[0]?.total || "0"),
  };
}

// --- Listings by Category ---
export async function getListingsByCategory() {
  return query<CategoryRow>(`
    SELECT 
      c.category_name as category,
      COUNT(p.id) as listings
    FROM categories c
    LEFT JOIN produce p ON p.category_id = c.id AND p.is_available = true
    GROUP BY c.id, c.category_name
    ORDER BY listings DESC
  `);
}

// --- Order Status Distribution ---
export async function getOrderStatusDistribution() {
  return query<StatusRow>(`
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
  `);
}

// --- Recent Orders ---
export async function getRecentOrders(limit: number = 5) {
  return query<OrderRow>(`
    SELECT 
      o.id,
      o.order_id,
      b.buyer_name as buyer,
      pr.product_name as product,
      o.quantity_kg as qty,
      o.total_price as total,
      os.status_name as status,
      o.order_date
    FROM orders o
    JOIN buyers b ON b.id = o.buyer_id
    JOIN produce pr ON pr.id = o.produce_id
    JOIN order_status os ON os.id = o.status_id
    ORDER BY o.order_date DESC
    LIMIT $1
  `, [limit]);
}

// --- Province Stats for Map ---
export async function getProvinceStats() {
  return query<ProvinceRow>(`
    SELECT 
      pv.province_name as name,
      COUNT(DISTINCT f.id) as farmers,
      COUNT(pr.id) as listings
    FROM provinces pv
    LEFT JOIN farmers f ON f.province_id = pv.id
    LEFT JOIN produce pr ON pr.farmer_id = f.id AND pr.is_available = true
    GROUP BY pv.id, pv.province_name
    ORDER BY farmers DESC
  `);
}