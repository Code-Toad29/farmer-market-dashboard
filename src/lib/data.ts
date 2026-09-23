

// // --- Types for each query ---
// interface CountResult { count: string }
// interface TotalResult { total: string }
// interface CategoryRow { category: string; listings: number }
// interface StatusRow { name: string; value: number; color: string }
// interface OrderRow {
//   id: number;
//   order_id: string;
//   buyer: string;
//   product: string;
//   qty: number;
//   total: number;
//   status: string;
//   order_date: string;
// }
// interface ProvinceRow { name: string; farmers: number; listings: number }
// interface ListingRow {
//   id: number;
//   name: string;
//   category: string;
//   farmer: string;
//   farm: string;
//   price: number;
//   quantity: number;
//   available: boolean;
//   harvest_date: string;
//   created_at: string;
// }
// interface FarmerRow {
//   id: number;
//   name: string;
//   farm: string;
//   province: string;
//   location: string;
//   email: string;
//   phone: string;
//   rating: number;
//   verified: boolean;
//   created: string;
// }
// interface BuyerRow {
//   id: number;
//   name: string;
//   email: string;
//   phone: string;
//   buyer_type: string;
//   location: string;
//   created: string;
// }
// interface ReviewRow {
//   id: number;
//   farmer: string;
//   buyer: string;
//   order_id: string;
//   rating: number;
//   comment: string;
//   date_posted: string;
// }
// interface PriceHistoryRow {
//   id: number;
//   old_price: number;
//   new_price: number;
//   changed_at: string;
//   changed_by: string;
// }

// import {Client} from "pg";
// const client = await new Client(
//   {
//     application_name: "farmer-market-dashboard",
//     connectionString: process.env.DATABASE_URL,
//     password: process.env.DATABASE_PASSWORD,
//   }
// ).connect();

// // --- Dashboard Stats ---
// export async function getDashboardStats() {
//   const [listings, farmers, orders, revenue] = await Promise.all([
//     client.query<CountResult>("SELECT COUNT(*) as count FROM produce WHERE is_available = true"),
//     client.query<CountResult>("SELECT COUNT(*) as count FROM farmers"),
//     client.query<CountResult>("SELECT COUNT(*) as count FROM orders WHERE status_id IN (1, 2)"),
//     client.query<TotalResult>("SELECT COALESCE(SUM(total_price), 0) as total FROM orders WHERE status_id = 3"),
//   ]);

//   return {
//     listings: parseInt(listings.rows[0]?.count || "0"),
//     farmers: parseInt(farmers.rows[0]?.count || "0"),
//     orders: parseInt(orders.rows[0]?.count || "0"),
//     revenue: parseInt(revenue.rows[0]?.total || "0"),
//   };
// }

// // --- Listings by Category ---
// export async function getListingsByCategory() {
//   return client.query<CategoryRow>(`
//     SELECT 
//       c.category_name as category,
//       COUNT(p.id) as listings
//     FROM categories c
//     LEFT JOIN produce p ON p.category_id = c.id AND p.is_available = true
//     GROUP BY c.id, c.category_name
//     ORDER BY listings DESC
//   `);
// }

// // --- Order Status Distribution ---
// export async function getOrderStatusDistribution() {
//   return client.query<StatusRow>(`
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

// // --- Recent Orders ---
// export async function getRecentOrders(limit: number = 5) {
//   return client.query<OrderRow>(`
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

// // --- Province Stats for Map ---
// export async function getProvinceStats() {
//   return client.query<ProvinceRow>(`
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

// // --- All Listings (for Listings Page) ---
// export async function getListings() {
//   return client.query<ListingRow>(`
//     SELECT 
//       p.id,
//       p.name as name,
//       c.name as category,
//       f.name as farmer,
//       f.farm_name as farm,
//       p.price_per_kg as price,
//       p.quantity_kg as quantity,
//       p.is_available as available,
//       p.harvest_date,
//       p.date_listed
//     FROM produce p
//     JOIN categories c ON c.id = p.category_id
//     JOIN farmers f ON f.id = p.farmer_id
//     ORDER BY p.date_listed DESC
//   `);
// }

// // --- All Farmers ---
// export async function getFarmers() {
//   return client.query<FarmerRow>(`
//     SELECT 
//       f.id,
//       f.farmer_name as name,
//       f.farm_name as farm,
//       pv.province_name as province,
//       f.location,
//       f.email,
//       f.phone,
//       f.rating,
//       f.is_verified as verified,
//       f.created_at as created
//     FROM farmers f
//     JOIN provinces pv ON pv.id = f.province_id
//     ORDER BY f.farmer_name
//   `);
// }

// // --- All Buyers ---
// export async function getBuyers() {
//   return client.query<BuyerRow>(`
//     SELECT 
//       b.id,
//       b.buyer_name as name,
//       b.email,
//       b.phone,
//       bt.type_name as buyer_type,
//       b.location,
//       b.created_at as created
//     FROM buyers b
//     JOIN buyer_type bt ON bt.id = b.buyer_type_id
//     ORDER BY b.buyer_name
//   `);
// }

// // --- All Reviews ---
// export async function getReviews() {
//   return client.query<ReviewRow>(`
//     SELECT 
//       r.id,
//       f.farmer_name as farmer,
//       b.buyer_name as buyer,
//       o.order_id,
//       r.rating,
//       r.comment,
//       r.created_at as date_posted
//     FROM reviews r
//     JOIN farmers f ON f.id = r.farmer_id
//     JOIN buyers b ON b.id = r.buyer_id
//     JOIN orders o ON o.id = r.order_id
//     ORDER BY r.created_at DESC
//   `);
// }

// // --- Price History for a Listing ---
// export async function getPriceHistory(listingId: number) {
//   return client.query<PriceHistoryRow>(`
//     SELECT 
//       ph.id,
//       ph.old_price,
//       ph.new_price,
//       ph.change_date as changed_at,
//       ph.changed_by
//     FROM price_history ph
//     WHERE ph.produce_id = $1
//     ORDER BY ph.change_date DESC
//   `, [listingId]);
// }

// interface CountResult { count: string }
// interface TotalResult { total: string }
// interface CategoryRow { category: string; listings: number }
// interface StatusRow { name: string; value: number; color: string }
// interface OrderRow {
//   id: number;
//   order_id: string;
//   buyer: string;
//   farmer: string;      // Added
//   product: string;
//   qty: number;
//   total: number;
//   status: string;
//   order_date: string;
//   collection_date: string | null; // Added
// }
// interface ProvinceRow { name: string; farmers: number; listings: number }
// interface ListingRow {
//   id: number;
//   name: string;
//   category: string;
//   farmer: string;
//   farm: string;
//   price: number;
//   quantity: number;
//   available: boolean;
//   harvest_date: string;
//   created_at: string; 
// }
// interface FarmerRow {
//   id: number;
//   name: string;
//   farm: string;
//   province: string;
//   location: string;
//   email: string;
//   phone: string;
//   rating: number;
//   verified: boolean;
//   created: string;
// }
// interface BuyerRow {
//   id: number;
//   name: string;
//   email: string;
//   phone: string;
//   buyer_type: string;
//   location: string;
//   created: string;
// }
// interface ReviewRow {
//   id: number;
//   farmer: string;
//   buyer: string;
//   order_id: string;
//   rating: number;
//   comment: string;
//   date_posted: string;
// }
// interface PriceHistoryRow {
//   id: number;
//   old_price: number;
//   new_price: number;
//   changed_at: string;
//   changed_by: string;
// }
// // New interface for dropdowns
// interface CategoryOption { id: number; name: string }

// import { Client } from "pg";
// const client = await new Client(
//   {
//     application_name: "farmer-market-dashboard",
//     connectionString: process.env.DATABASE_URL,
//     password: process.env.DATABASE_PASSWORD,
//   }
// ).connect();

// // --- Dashboard Stats ---
// export async function getDashboardStats() {
//   // ... (Keep existing code)
//   const [listings, farmers, orders, revenue] = await Promise.all([
//     client.query<CountResult>("SELECT COUNT(*) as count FROM produce WHERE is_available = true"),
//     client.query<CountResult>("SELECT COUNT(*) as count FROM farmers"),
//     client.query<CountResult>("SELECT COUNT(*) as count FROM orders WHERE status_id IN (1, 2)"),
//     client.query<TotalResult>("SELECT COALESCE(SUM(total_price), 0) as total FROM orders WHERE status_id = 3"),
//   ]);

//   return {
//     listings: parseInt(listings.rows[0]?.count || "0"),
//     farmers: parseInt(farmers.rows[0]?.count || "0"),
//     orders: parseInt(orders.rows[0]?.count || "0"),
//     revenue: parseInt(revenue.rows[0]?.total || "0"),
//   };
// }

// // --- Listings by Category ---
// export async function getListingsByCategory() {
//   return client.query<CategoryRow>(`...`); // keep existing
// }

// // --- Order Status Distribution ---
// export async function getOrderStatusDistribution() {
//   return client.query<StatusRow>(`...`); // keep existing
// }

// // --- Recent Orders ---
// export async function getRecentOrders(limit: number = 5) {
//   return client.query<OrderRow>(`
//     SELECT 
//       o.id,
//       o.order_id,
//       b.buyer_name as buyer,
//       pr.name as product, // Changed from pr.product_name to pr.name
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

// // --- Province Stats for Map ---
// export async function getProvinceStats() {
//   return client.query<ProvinceRow>(`...`); // keep existing
// }

// // --- All Listings (for Listings Page) ---
// export async function getListings() {
//   return client.query<ListingRow>(`
//     SELECT 
//       p.id,
//       p.name as name,
//       c.name as category,
//       f.name as farmer,
//       f.farm_name as farm,
//       p.price_per_kg as price,
//       p.quantity_kg as quantity,
//       p.is_available as available,
//       p.harvest_date,
//       p.date_listed as created_at  // Fixed alias to match interface
//     FROM produce p
//     JOIN categories c ON c.id = p.category_id
//     JOIN farmers f ON f.id = p.farmer_id
//     ORDER BY p.date_listed DESC
//   `);
// }

// // --- All Farmers ---
// export async function getFarmers() {
//   return client.query<FarmerRow>(`...`); // keep existing
// }

// // --- All Buyers ---
// export async function getBuyers() {
//   return client.query<BuyerRow>(`...`); // keep existing
// }

// // --- All Reviews ---
// export async function getReviews() {
//   return client.query<ReviewRow>(`...`); // keep existing
// }

// // --- Price History for a Listing ---
// export async function getPriceHistory(listingId: number) {
//   return client.query<PriceHistoryRow>(`...`, [listingId]); // keep existing
// }

// // ==========================================
// // ✨ NEW FUNCTIONS ADDED BELOW ✨
// // ==========================================

// // --- ALL ORDERS (for Orders Page) ---
// export async function getAllOrders() {
//   return client.query<OrderRow>(`
//     SELECT 
//       o.id,
//       o.order_id,
//       b.buyer_name as buyer,
//       f.farmer_name as farmer, 
//       pr.name as product,
//       o.quantity_kg as qty,
//       o.total_price as total,
//       os.status_name as status,
//       o.order_date,
//       o.collection_date
//     FROM orders o
//     JOIN buyers b ON b.id = o.buyer_id
//     JOIN produce pr ON pr.id = o.produce_id
//     JOIN farmers f ON f.id = pr.farmer_id
//     JOIN order_status os ON os.id = o.status_id
//     ORDER BY o.order_date DESC
//   `);
// }

// // --- CATEGORIES (for Dropdowns in New Listing Form) ---
// export async function getCategories() {
//   return client.query<CategoryOption>(`SELECT id, name FROM categories ORDER BY name`);
// }

// // --- SINGLE LISTING (for Edit Page) ---
// export async function getSingleListing(id: number) {
//   const result = await client.query<ListingRow>(`
//     SELECT 
//       p.id,
//       p.name as name,
//       c.name as category,
//       f.name as farmer,
//       f.farm_name as farm,
//       p.price_per_kg as price,
//       p.quantity_kg as quantity,
//       p.is_available as available,
//       p.harvest_date,
//       p.date_listed as created_at
//     FROM produce p
//     JOIN categories c ON c.id = p.category_id
//     JOIN farmers f ON f.id = p.farmer_id
//     WHERE p.id = $1
//   `, [id]);
  
//   return result.rows[0];
// }

// src/lib/data.ts
import { query } from "./db";

// --- Types ---
interface CountResult { count: string }
interface TotalResult { total: string }
interface CategoryRow { category: string; listings: number }
interface StatusRow { name: string; value: number; color: string }
interface OrderRow { id: number; order_id: number; buyer: string; farmer: string; product: string; qty: number; total: number; status: string; order_date: string; collection_date: string | null; }
interface ProvinceRow { name: string; farmers: number; listings: number }
interface ListingRow { id: number; name: string; category: string; farmer: string; farm: string; price: number; quantity: number; available: boolean; harvest_date: string; created_at: string; }
interface FarmerRow { id: number; name: string; farm: string; province: string; location: string; email: string; phone: string; rating: number | null; verified: boolean; created: string; }
interface BuyerRow { id: number; name: string; email: string; phone: string; buyer_type: string; location: string; created: string; }
interface ReviewRow { id: number; farmer: string; buyer: string; order_id: number; rating: number; comment: string; date_posted: string; }
interface PriceHistoryRow { id: number; old_price: number; new_price: number; changed_at: string; changed_by: string; }
interface CategoryOption { id: string; name: string }

// --- Dashboard Stats ---
export async function getDashboardStats() {
  const [listings, farmers, orders, revenue] = await Promise.all([
    query<CountResult>("SELECT COUNT(*) as count FROM produce WHERE is_available = true"),
    query<CountResult>("SELECT COUNT(*) as count FROM farmers"),
    query<CountResult>("SELECT COUNT(*) as count FROM orders WHERE status_id IN ('PEN', 'CON')"),
    query<TotalResult>("SELECT COALESCE(SUM(total_price), 0) as total FROM orders WHERE status_id = 'COL'"),
  ]);

  return {
    listings: parseInt(listings[0]?.count || "0"),
    farmers: parseInt(farmers[0]?.count || "0"),
    orders: parseInt(orders[0]?.count || "0"),
    revenue: parseFloat(revenue[0]?.total || "0"),
  };
}

// --- Listings by Category ---
export async function getListingsByCategory() {
  return query<CategoryRow>(`
    SELECT c.name as category, COUNT(p.id) as listings
    FROM categories c
    LEFT JOIN produce p ON p.category_id = c.id AND p.is_available = true
    GROUP BY c.id, c.name
    ORDER BY listings DESC
  `);
}

// --- Order Status Distribution ---
export async function getOrderStatusDistribution() {
  return query<StatusRow>(`
    SELECT os.name as name, COUNT(o.order_id) as value,
      CASE 
        WHEN os.name = 'Pending' THEN '#F59E0B'
        WHEN os.name = 'Confirmed' THEN '#3B82F6'
        WHEN os.name = 'Collected' THEN '#22C55E'
        WHEN os.name = 'Cancelled' THEN '#EF4444'
      END as color
    FROM order_status os
    LEFT JOIN orders o ON o.status_id = os.id
    GROUP BY os.id, os.name
    ORDER BY os.id
  `);
}

// --- Recent Orders ---
export async function getRecentOrders(limit = 5) {
  return query<OrderRow>(`
    SELECT o.order_id as id, o.order_id, b.full_name as buyer, p.name as product,
           o.quantity_ordered as qty, o.total_price as total, os.name as status, o.order_date
    FROM orders o
    JOIN buyers b ON b.buyer_id = o.buyer_id
    JOIN produce p ON p.id = o.listing_id
    JOIN order_status os ON os.id = o.status_id
    ORDER BY o.order_date DESC
    LIMIT $1
  `, [limit]);
}

// --- Province Stats for Map ---
export async function getProvinceStats() {
  return query<ProvinceRow>(`
    SELECT pv.name as name, COUNT(DISTINCT f.id) as farmers, COUNT(pr.id) as listings
    FROM provinces pv
    LEFT JOIN farmers f ON f.province_id = pv.id
    LEFT JOIN produce pr ON pr.farmer_id = f.id AND pr.is_available = true
    GROUP BY pv.id, pv.name
    ORDER BY farmers DESC
  `);
}

// --- All Listings ---
export async function getListings() {
  return query<ListingRow>(`
    SELECT p.id, p.name, c.name as category, f.name as farmer, f.farm_name as farm,
           p.price_per_kg as price, p.quantity_kg as quantity, p.is_available as available,
           p.harvest_date, p.date_listed as created_at
    FROM produce p
    JOIN categories c ON c.id = p.category_id
    JOIN farmers f ON f.id = p.farmer_id
    ORDER BY p.date_listed DESC
  `);
}

// --- All Farmers ---
export async function getFarmers() {
  return query<FarmerRow>(`
    SELECT f.id, f.name, f.farm_name as farm, pv.name as province,
           f.location, f.email, f.phone_number as phone, f.rating,
           f.is_verified as verified, f.created_at as created
    FROM farmers f
    JOIN provinces pv ON pv.id = f.province_id
    ORDER BY f.name
  `);
}

// --- All Buyers ---
export async function getBuyers() {
  return query<BuyerRow>(`
    SELECT b.buyer_id as id, b.full_name as name, b.email, b.phone_number as phone,
           bt.name as buyer_type, b.location, b.created_at as created
    FROM buyers b
    JOIN buyer_type bt ON bt.id = b.buyer_type_id
    ORDER BY b.full_name
  `);
}

// --- All Reviews ---
export async function getReviews() {
  return query<ReviewRow>(`
    SELECT r.review_id as id, f.name as farmer, b.full_name as buyer,
           o.order_id, r.rating, r.comment, r.date_posted
    FROM reviews r
    JOIN farmers f ON f.id = r.farmer_id
    JOIN buyers b ON b.buyer_id = r.buyer_id
    JOIN orders o ON o.order_id = r.order_id
    ORDER BY r.date_posted DESC
  `);
}

// --- Price History for a Listing ---
export async function getPriceHistory(listingId: number) {
  return query<PriceHistoryRow>(`
    SELECT ph.history_id as id, ph.old_price, ph.new_price, ph.changed_at, ph.changed_by
    FROM price_history ph
    WHERE ph.listing_id = $1
    ORDER BY ph.changed_at DESC
  `, [listingId]);
}

// --- ALL ORDERS ---
export async function getAllOrders() {
  return query<OrderRow>(`
    SELECT o.order_id as id, o.order_id, b.full_name as buyer, f.name as farmer,
           p.name as product, o.quantity_ordered as qty, o.total_price as total,
           os.name as status, o.order_date, o.collection_date
    FROM orders o
    JOIN buyers b ON b.buyer_id = o.buyer_id
    JOIN produce p ON p.id = o.listing_id
    JOIN farmers f ON f.id = p.farmer_id
    JOIN order_status os ON os.id = o.status_id
    ORDER BY o.order_date DESC
  `);
}

// --- CATEGORIES (for Dropdowns) ---
export async function getCategories() {
  return query<CategoryOption>(`SELECT id, name FROM categories ORDER BY name`);
}

// --- SINGLE LISTING (for Edit) ---
export async function getSingleListing(id: number) {
  const rows = await query<ListingRow>(`
    SELECT p.id, p.name, c.name as category, f.name as farmer, f.farm_name as farm,
           p.price_per_kg as price, p.quantity_kg as quantity, p.is_available as available,
           p.harvest_date, p.date_listed as created_at
    FROM produce p
    JOIN categories c ON c.id = p.category_id
    JOIN farmers f ON f.id = p.farmer_id
    WHERE p.id = $1
  `, [id]);
  return rows[0];
}