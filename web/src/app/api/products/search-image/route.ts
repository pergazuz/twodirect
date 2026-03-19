import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { getImageEmbedding } from "@/lib/embeddings";

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
 * POST /api/products/search-image
 *
 * Search products by uploaded image using CLIP image embeddings.
 * Accepts multipart form data with an image file.
 *
 * Form fields:
 *   - image: File (required)
 *   - lat: string (optional, default Bangkok)
 *   - lng: string (optional, default Bangkok)
 *   - radius_km: string (optional, default 10)
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const imageFile = formData.get("image") as File | null;
    const lat = parseFloat((formData.get("lat") as string) || "13.7563");
    const lng = parseFloat((formData.get("lng") as string) || "100.5018");
    // radius_km kept for sorting but no longer filters out results

    if (!imageFile) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    // Convert uploaded file to buffer
    const imageBuffer = Buffer.from(await imageFile.arrayBuffer());

    // Generate image embedding using local CLIP model
    const queryEmbedding = await getImageEmbedding(imageBuffer);

    // Search for similar products using pgvector
    const supabase = await createClient();

    const { data: similarProducts, error: embeddingError } = await supabase.rpc("match_products", {
      query_embedding: `[${queryEmbedding.join(",")}]`,
      match_threshold: 0.22,
      match_count: 5,
    });

    if (embeddingError) {
      return NextResponse.json({ error: embeddingError.message }, { status: 500 });
    }

    if (!similarProducts || similarProducts.length === 0) {
      return NextResponse.json([]);
    }

    // Enrich with branch/inventory data
    const { data: branches } = await supabase.from("branches").select("*");
    const { data: promotions } = await supabase.from("promotions").select("*");

    const results = [];

    for (const product of similarProducts) {
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

      results.push({
        product: {
          id: product.id,
          name: product.name,
          name_th: product.name_th,
          description: product.description,
          category: product.category,
          image_url: product.image_url,
          price: product.price,
        },
        branches: branchesWithStock,
        search_meta: {
          text_match: false,
          similarity_score: product.similarity,
        },
      });
    }

    return NextResponse.json(results);
  } catch (err) {
    console.error("Image search error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to search by image" },
      { status: 500 }
    );
  }
}
