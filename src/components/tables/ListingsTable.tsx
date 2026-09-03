"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Eye } from "lucide-react";

interface Listing {
  id: number;
  name: string;
  category: string;
  farmer: string;
  farm: string;
  price: number;
  quantity: number;
  available: boolean;
  harvest_date: string;
  created_at: string;
}

interface Props {
  initialData: Listing[];
}

export function ListingsTable({ initialData }: Props) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [availabilityFilter, setAvailabilityFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"price" | "harvest_date" | "name">("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // Get unique categories
  const categories = useMemo(() => {
    const cats = new Set(initialData.map((item) => item.category));
    return ["all", ...Array.from(cats)];
  }, [initialData]);

  // Filter and sort data
  const filteredData = useMemo(() => {
    let data = [...initialData];

    // Search
    if (searchTerm) {
      data = data.filter((item) =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.farmer.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (categoryFilter !== "all") {
      data = data.filter((item) => item.category === categoryFilter);
    }

    // Availability filter
    if (availabilityFilter === "available") {
      data = data.filter((item) => item.available === true);
    } else if (availabilityFilter === "unavailable") {
      data = data.filter((item) => item.available === false);
    }

    // Sort
    data.sort((a, b) => {
      let valA: any = a[sortBy];
      let valB: any = b[sortBy];
      if (sortBy === "price") { valA = a.price; valB = b.price; }
      if (sortBy === "harvest_date") { valA = new Date(a.harvest_date); valB = new Date(b.harvest_date); }
      if (valA < valB) return sortOrder === "asc" ? -1 : 1;
      if (valA > valB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return data;
  }, [initialData, searchTerm, categoryFilter, availabilityFilter, sortBy, sortOrder]);

  // Handle deactivate
  const handleDeactivate = async (id: number) => {
    if (!confirm("Are you sure you want to deactivate this listing?")) return;
    
    try {
      const res = await fetch(`/api/listings/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        router.refresh();
      } else {
        alert("Failed to deactivate listing");
      }
    } catch (error) {
      console.error("Error deactivating listing:", error);
      alert("Error deactivating listing");
    }
  };

  // Handle category filter change (fixed for string | null)
  const handleCategoryChange = (value: string | null) => {
    if (value !== null) {
      setCategoryFilter(value);
    }
  };

  // Handle availability filter change (fixed for string | null)
  const handleAvailabilityChange = (value: string | null) => {
    if (value !== null) {
      setAvailabilityFilter(value);
    }
  };

  // Handle sort change (fixed for string | null)
  const handleSortChange = (value: string | null) => {
    if (value !== null) {
      setSortBy(value as "price" | "harvest_date" | "name");
    }
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center bg-white p-4 rounded-xl border">
        <Input
          placeholder="Search by product or farmer..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-64"
        />

        <Select value={categoryFilter} onValueChange={handleCategoryChange}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat === "all" ? "All Categories" : cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={availabilityFilter} onValueChange={handleAvailabilityChange}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Availability" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="available">Available</SelectItem>
            <SelectItem value="unavailable">Unavailable</SelectItem>
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={handleSortChange}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name">Name</SelectItem>
            <SelectItem value="price">Price</SelectItem>
            <SelectItem value="harvest_date">Harvest Date</SelectItem>
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
        >
          {sortOrder === "asc" ? "↑" : "↓"}
        </Button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead>Product</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Farmer</TableHead>
              <TableHead className="text-right">Price/kg</TableHead>
              <TableHead className="text-right">Qty (kg)</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                  No listings found matching your criteria.
                </TableCell>
              </TableRow>
            ) : (
              filteredData.map((listing) => (
                <TableRow key={listing.id} className="hover:bg-gray-50">
                  <TableCell className="font-medium">{listing.name}</TableCell>
                  <TableCell>{listing.category}</TableCell>
                  <TableCell>
                    <div>
                      <p>{listing.farmer}</p>
                      <p className="text-xs text-gray-400">{listing.farm}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    R {listing.price}
                  </TableCell>
                  <TableCell className="text-right">{listing.quantity}</TableCell>
                  <TableCell>
                    <Badge
                      variant={listing.available ? "default" : "secondary"}
                      className={listing.available ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-gray-100 text-gray-500"}
                    >
                      {listing.available ? "Available" : "Unavailable"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push(`/dashboard/listings/${listing.id}`)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push(`/dashboard/listings/${listing.id}/edit`)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      {listing.available && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleDeactivate(listing.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
