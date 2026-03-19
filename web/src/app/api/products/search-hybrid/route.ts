import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { getTextEmbedding } from "@/lib/embeddings";

// Only fall back to embedding search when text search finds nothing
const TEXT_SEARCH_THRESHOLD = 1;

// Thai keyword → English translation for CLIP embedding search
// CLIP's text encoder is English-only, so we translate common Thai queries
const THAI_TO_ENGLISH: Record<string, string> = {
  "น้ำ": "water drink beverage",
  "น้ำดื่ม": "drinking water",
  "น้ำอัดลม": "soda carbonated drink cola pepsi",
  "เครื่องดื่ม": "beverage drink",
  "นม": "milk dairy",
  "กาแฟ": "coffee latte",
  "ขนม": "snack cookie cracker chips",
  "มันฝรั่ง": "potato chips",
  "บะหมี่": "noodle instant noodle ramen",
  "ข้าว": "rice meal",
  "อาหาร": "food meal ready meal",
  "ขนมปัง": "bread bun bakery",
  "ไส้กรอก": "sausage",
  "ชา": "tea",
  "น้ำผลไม้": "juice fruit juice",
  "ชูกำลัง": "energy drink",
  "โค้ก": "coke cola coca-cola",
  "เป๊ปซี่": "pepsi cola",
};

// Haversine distance calculation
function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 100) / 100;
}

/**
 * GET /api/products/search-hybrid?query=...&lat=...&lng=...&radius_km=...
 *
 * Hybrid search: text-first, embedding fallback
 * 1. Traditional ILIKE text search on name/name_th
 * 2. If results < threshold, augment with embedding similarity search
 * 3. Deduplicate and merge results
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("query") || "";
    const lat = parseFloat(searchParams.get("lat") || "13.7563");
    const lng = parseFloat(searchParams.get("lng") || "100.5018");
    // radius_km kept for sorting but no longer filters out results

    if (!query) {
      return NextResponse.json([]);
    }

    const supabase = await createClient();

    // --- Phase 1: Traditional text search (name, name_th, description) ---
    const { data: textProducts, error: textError } = await supabase
      .from("products")
      .select("*")
      .or(`name.ilike.%${query}%,name_th.ilike.%${query}%,description.ilike.%${query}%`);

    if (textError) {
      return NextResponse.json({ error: textError.message }, { status: 500 });
    }

    const textProductIds = new Set((textProducts || []).map((p) => p.id));
    let allProducts = [...(textProducts || [])];

    // --- Phase 2: Embedding similarity search (if text search returned few results) ---
    let embeddingProducts: Array<{ id: string; similarity: number; [key: string]: unknown }> = [];

    if ((textProducts || []).length < TEXT_SEARCH_THRESHOLD) {
      try {
        // Translate Thai query to English for CLIP (English-only text encoder)
        const englishQuery = THAI_TO_ENGLISH[query] || query;
        const queryEmbedding = await getTextEmbedding(englishQuery);

        const { data: similarProducts, error: embeddingError } = await supabase.rpc("match_products", {
          query_embedding: `[${queryEmbedding.join(",")}]`,
          match_threshold: 0.22,
          match_count: 5,
        });

        if (!embeddingError && similarProducts) {
          embeddingProducts = similarProducts;
          // Add products not already found by text search
          for (const product of similarProducts) {
            if (!textProductIds.has(product.id)) {
              allProducts.push(product);
            }
          }
        }
      } catch (err) {
        // Embedding search failed - continue with text results only
        console.warn("Embedding search failed, using text results only:", err);
      }
    }

    // --- Phase 3: Enrich results with branch/inventory/promotion data ---
    const { data: branches } = await supabase.from("branches").select("*");
    const { data: promotions } = await supabase.from("promotions").select("*");

    const results = [];

    for (const product of allProducts) {
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

      branchesWithStock.sort((a, b) => a.distance_km - b.distance_km);

      // Find similarity score if this came from embedding search
      const embeddingMatch = embeddingProducts.find((ep) => ep.id === product.id);
      const similarity = embeddingMatch ? embeddingMatch.similarity : null;
      const isTextMatch = textProductIds.has(product.id);

      if (branchesWithStock.length > 0) {
        results.push({
          product: {
            ...product,
            embedding: undefined, // Don't send embedding to client
          },
          branches: branchesWithStock,
          search_meta: {
            text_match: isTextMatch,
            similarity_score: similarity,
          },
        });
      }
    }

    // Sort: text matches first, then by similarity score
    results.sort((a, b) => {
      if (a.search_meta.text_match && !b.search_meta.text_match) return -1;
      if (!a.search_meta.text_match && b.search_meta.text_match) return 1;
      // Within same category, sort by similarity
      const simA = a.search_meta.similarity_score ?? 0;
      const simB = b.search_meta.similarity_score ?? 0;
      return simB - simA;
    });

    return NextResponse.json(results);
  } catch (err) {
    console.error("Hybrid search error:", err);
    return NextResponse.json({ error: "Failed to search products" }, { status: 500 });
  }
}
