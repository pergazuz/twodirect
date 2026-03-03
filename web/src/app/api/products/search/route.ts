import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// Haversine distance calculation
function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 100) / 100;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("query") || "";
    const lat = parseFloat(searchParams.get("lat") || "13.7563");
    const lng = parseFloat(searchParams.get("lng") || "100.5018");
    const radiusKm = parseFloat(searchParams.get("radius_km") || "10");

    if (!query) {
      return NextResponse.json([]);
    }

    const supabase = await createClient();

    // Search products
    const { data: products, error: productsError } = await supabase
      .from("products")
      .select("*")
      .or(`name.ilike.%${query}%,name_th.ilike.%${query}%`);

    if (productsError) {
      return NextResponse.json({ error: productsError.message }, { status: 500 });
    }

    // Get all branches
    const { data: branches } = await supabase.from("branches").select("*");

    // Get all promotions
    const { data: promotions } = await supabase.from("promotions").select("*");

    const results = [];

    for (const product of products || []) {
      // Get inventory for this product
      const { data: inventory } = await supabase
        .from("branch_inventory")
        .select("*")
        .eq("product_id", product.id)
        .gt("quantity", 0);

      const branchesWithStock = [];

      for (const inv of inventory || []) {
        const branch = branches?.find((b) => b.id === inv.branch_id);
        if (branch) {
          const distance = haversineDistance(lat, lng, branch.latitude, branch.longitude);
          if (distance <= radiusKm) {
            const promos = (promotions || []).filter(
              (p) => !p.product_id || p.product_id === product.id
            );
            branchesWithStock.push({
              branch,
              quantity: inv.quantity,
              distance_km: distance,
              promotions: promos,
            });
          }
        }
      }

      branchesWithStock.sort((a, b) => a.distance_km - b.distance_km);

      if (branchesWithStock.length > 0) {
        results.push({
          product,
          branches: branchesWithStock,
        });
      }
    }

    return NextResponse.json(results);
  } catch (err) {
    console.error("Search error:", err);
    return NextResponse.json({ error: "Failed to search products" }, { status: 500 });
  }
}

