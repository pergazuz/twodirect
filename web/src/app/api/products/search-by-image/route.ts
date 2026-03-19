import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// Embedding service URL
const EMBEDDING_SERVICE_URL = process.env.EMBEDDING_SERVICE_URL || "http://localhost:8000";

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

/**
 * Get image embedding from embedding service
 */
async function getImageEmbedding(imageFile: File): Promise<number[] | null> {
  try {
    const formData = new FormData();
    formData.append("file", imageFile);

    const response = await fetch(`${EMBEDDING_SERVICE_URL}/api/embed/image`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      console.error("Failed to get image embedding:", response.statusText);
      return null;
    }

    const data = await response.json();
    return data.embedding;
  } catch (error) {
    console.error("Error fetching image embedding:", error);
    return null;
  }
}

/**
 * Search products using image embedding similarity
 */
async function searchByImageEmbedding(
  supabase: any,
  queryEmbedding: number[],
  limit: number = 20,
  threshold: number = 0.6
): Promise<any[]> {
  try {
    const { data, error } = await supabase.rpc("search_products_by_embedding", {
      query_embedding: queryEmbedding,
      match_threshold: threshold,
      match_count: limit,
      embedding_column: "image_embedding",
    });

    if (error) {
      console.error("Image embedding search error:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Error in image embedding search:", error);
    return [];
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const imageFile = formData.get("image") as File;
    const lat = parseFloat(formData.get("lat") as string || "13.7563");
    const lng = parseFloat(formData.get("lng") as string || "100.5018");
    const radiusKm = parseFloat(formData.get("radius_km") as string || "10");

    if (!imageFile) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    console.log(`🖼️  Image search initiated`);

    const supabase = await createClient();

    // Get image embedding
    const imageEmbedding = await getImageEmbedding(imageFile);

    if (!imageEmbedding) {
      return NextResponse.json({ error: "Failed to generate image embedding" }, { status: 500 });
    }

    // Search by image embedding
    const products = await searchByImageEmbedding(supabase, imageEmbedding, 20, 0.6);

    if (products.length === 0) {
      console.log("No products found matching the image");
      return NextResponse.json([]);
    }

    console.log(`✨ Found ${products.length} products matching the image`);

    // Get all branches
    const { data: branches } = await supabase.from("branches").select("*");

    // Get all promotions
    const { data: promotions } = await supabase.from("promotions").select("*");

    const results = [];

    for (const product of products) {
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
          similarity: product.similarity, // Include similarity score from embedding search
        });
      }
    }

    return NextResponse.json(results);
  } catch (err) {
    console.error("Image search error:", err);
    return NextResponse.json({ error: "Failed to search by image" }, { status: 500 });
  }
}

