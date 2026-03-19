import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { getTextEmbedding, getImageEmbedding, buildProductText } from "@/lib/embeddings";

/**
 * POST /api/products/embeddings
 *
 * Generate and store embeddings for all products.
 * Uses text embeddings (name + name_th + description + category) by default.
 * Optionally fetches product images and generates image embeddings too.
 *
 * Query params:
 *   - mode: "text" (default) | "image" | "both"
 *   - product_id: optional, generate for a single product
 */
export async function POST(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const mode = searchParams.get("mode") || "text";
    const productId = searchParams.get("product_id");

    const supabase = await createClient();

    // Fetch products
    let query = supabase.from("products").select("*");
    if (productId) {
      query = query.eq("id", productId);
    }
    const { data: products, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!products || products.length === 0) {
      return NextResponse.json({ error: "No products found" }, { status: 404 });
    }

    const results: Array<{ id: string; name: string; status: string; error?: string }> = [];

    for (const product of products) {
      try {
        let embedding: number[];

        if (mode === "image" && product.image_url) {
          // Fetch the product image and generate image embedding
          const imageResponse = await fetch(product.image_url);
          if (!imageResponse.ok) {
            results.push({ id: product.id, name: product.name, status: "skipped", error: "Image fetch failed" });
            continue;
          }
          const imageBuffer = Buffer.from(await imageResponse.arrayBuffer());
          embedding = await getImageEmbedding(imageBuffer);
        } else if (mode === "both" && product.image_url) {
          // Generate both and average them for a richer representation
          const textEmbedding = await getTextEmbedding(buildProductText(product));

          const imageResponse = await fetch(product.image_url);
          if (imageResponse.ok) {
            const imageBuffer = Buffer.from(await imageResponse.arrayBuffer());
            const imageEmbedding = await getImageEmbedding(imageBuffer);
            // Average text and image embeddings
            embedding = textEmbedding.map((v, i) => (v + imageEmbedding[i]) / 2);
            // Re-normalize
            const norm = Math.sqrt(embedding.reduce((sum, v) => sum + v * v, 0));
            embedding = embedding.map((v) => v / norm);
          } else {
            embedding = textEmbedding;
          }
        } else {
          // Default: text-only embedding
          embedding = await getTextEmbedding(buildProductText(product));
        }

        // Store embedding in Supabase
        // pgvector expects the format "[0.1,0.2,...]" as a string for the vector type
        const vectorString = `[${embedding.join(",")}]`;
        const { error: updateError } = await supabase
          .from("products")
          .update({ text_embedding: vectorString })
          .eq("id", product.id);

        if (updateError) {
          results.push({ id: product.id, name: product.name, status: "error", error: updateError.message });
        } else {
          results.push({ id: product.id, name: product.name, status: "success" });
        }
      } catch (err) {
        results.push({
          id: product.id,
          name: product.name,
          status: "error",
          error: err instanceof Error ? err.message : "Unknown error",
        });
      }
    }

    const succeeded = results.filter((r) => r.status === "success").length;
    const failed = results.filter((r) => r.status === "error").length;

    return NextResponse.json({
      message: `Processed ${results.length} products: ${succeeded} succeeded, ${failed} failed`,
      results,
    });
  } catch (err) {
    console.error("Embedding generation error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to generate embeddings" },
      { status: 500 }
    );
  }
}
