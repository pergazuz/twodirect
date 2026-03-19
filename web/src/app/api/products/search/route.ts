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

// Embedding service URL (default to localhost if not set)
const EMBEDDING_SERVICE_URL = process.env.EMBEDDING_SERVICE_URL || "http://localhost:8000";

// Minimum results threshold to trigger embedding search
// Set to 100 to always trigger embedding search for testing
const MIN_RESULTS_THRESHOLD = 100; // Change back to 5 for production

/**
 * Fetch text embedding from embedding service
 */
async function getTextEmbedding(text: string): Promise<number[] | null> {
  try {
    const response = await fetch(`${EMBEDDING_SERVICE_URL}/api/embed/text`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, normalize: true }),
    });

    if (!response.ok) {
      console.error("Failed to get embedding:", response.statusText);
      return null;
    }

    const data = await response.json();
    return data.embedding;
  } catch (error) {
    console.error("Error fetching embedding:", error);
    return null;
  }
}

/**
 * Search products using embedding similarity
 */
async function searchByEmbedding(
  supabase: any,
  queryEmbedding: number[],
  limit: number = 20,
  threshold: number = 0.5
): Promise<any[]> {
  try {
    const { data, error } = await supabase.rpc("search_products_by_embedding", {
      query_embedding: queryEmbedding,
      match_threshold: threshold,
      match_count: limit,
      embedding_column: "text_embedding",
    });

    if (error) {
      console.error("Embedding search error:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Error in embedding search:", error);
    return [];
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("query") || "";
    const lat = parseFloat(searchParams.get("lat") || "13.7563");
    const lng = parseFloat(searchParams.get("lng") || "100.5018");
    const radiusKm = parseFloat(searchParams.get("radius_km") || "10");
    const useEmbedding = searchParams.get("use_embedding") === "true";

    if (!query) {
      return NextResponse.json([]);
    }

    const supabase = await createClient();

    // STEP 1: Primary Search - Traditional text-based search
    console.log(`🔍 Primary search: "${query}"`);
    const { data: products, error: productsError } = await supabase
      .from("products")
      .select("*")
      .or(`name.ilike.%${query}%,name_th.ilike.%${query}%`);

    if (productsError) {
      return NextResponse.json({ error: productsError.message }, { status: 500 });
    }

    let finalProducts = products || [];

    // STEP 2: Secondary Search - Embedding similarity search (if needed)
    if ((finalProducts.length < MIN_RESULTS_THRESHOLD || useEmbedding) && EMBEDDING_SERVICE_URL) {
      console.log(`🧠 Triggering embedding search (found ${finalProducts.length} results from text search)`);

      const queryEmbedding = await getTextEmbedding(query);
      console.log(`📊 Query embedding received: ${queryEmbedding ? 'YES' : 'NO'} (length: ${queryEmbedding?.length || 0})`);

      if (queryEmbedding) {
        // Lower threshold to 0.0 for testing - will return all products sorted by similarity
        const embeddingResults = await searchByEmbedding(supabase, queryEmbedding, 20, 0.0);
        console.log(`📦 Embedding search returned ${embeddingResults.length} results`);

        if (embeddingResults.length > 0) {
          console.log(`✨ Found ${embeddingResults.length} additional results from embedding search`);

          // Merge results, avoiding duplicates
          const existingIds = new Set(finalProducts.map((p: any) => p.id));
          const newProducts = embeddingResults.filter((p: any) => !existingIds.has(p.id));

          finalProducts = [...finalProducts, ...newProducts];
          console.log(`📊 Total products after merge: ${finalProducts.length}`);
        }
      }
    }

    // Get all branches
    const { data: branches } = await supabase.from("branches").select("*");

    // Get all promotions
    const { data: promotions } = await supabase.from("promotions").select("*");

    const results = [];

    for (const product of finalProducts) {
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

      // TEMPORARY: Show all products even without nearby inventory for testing
      if (branchesWithStock.length > 0) {
        results.push({
          product,
          branches: branchesWithStock,
        });
      } else {
        // Add product with empty branches array for testing
        console.log(`⚠️  Product "${product.name}" has no nearby inventory`);
        results.push({
          product,
          branches: [],
        });
      }
    }

    console.log(`📤 Returning ${results.length} results to frontend`);
    return NextResponse.json(results);
  } catch (err) {
    console.error("Search error:", err);
    return NextResponse.json({ error: "Failed to search products" }, { status: 500 });
  }
}

