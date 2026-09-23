import { getListings } from "@/lib/data";
import { ListingsTable } from "@/components/tables/ListingsTable";

export default async function ListingsPage() {
  const listings = await getListings();

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">📦 Produce Listings</h1>
          <p className="text-gray-500 text-sm">Manage all produce listings</p>
        </div>
        <a
          href="/dashboard/listings/new"
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          + Add New Listing
        </a>
      </div>
      <h1>{listings.length} Listings</h1>
      <ListingsTable initialData={listings} />
    </div>
  );
}