import { Product, Branch, SearchResult, Promotion } from "@/types";

// Use Next.js API routes (works on Vercel) or external Rust backend
// If NEXT_PUBLIC_API_URL is set, use external backend; otherwise use local API routes
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";

// ============================================
// API calls - works with both:
// - Next.js API routes (/api/...) when deployed on Vercel
// - Rust backend (http://localhost:8080/api/...) for local dev
// ============================================

export async function fetchProducts(): Promise<Product[]> {
  const res = await fetch(`${API_BASE}/api/products`);
  if (!res.ok) throw new Error("Failed to fetch products");
  return res.json();
}

export async function searchProducts(
  query: string,
  lat?: number,
  lng?: number,
  radiusKm?: number,
  storeChain?: string
): Promise<SearchResult[]> {
  const params = new URLSearchParams({ query });
  if (lat !== undefined) params.set("lat", lat.toString());
  if (lng !== undefined) params.set("lng", lng.toString());
  if (radiusKm !== undefined) params.set("radius_km", radiusKm.toString());
  if (storeChain) params.set("chain", storeChain);

  const res = await fetch(`${API_BASE}/api/products/search?${params}`);
  if (!res.ok) throw new Error("Failed to search products");
  return res.json();
}

export async function fetchBranches(): Promise<Branch[]> {
  const res = await fetch(`${API_BASE}/api/branches`);
  if (!res.ok) throw new Error("Failed to fetch branches");
  return res.json();
}

export async function fetchBranch(id: string): Promise<Branch> {
  const res = await fetch(`${API_BASE}/api/branches/${id}`);
  if (!res.ok) throw new Error("Failed to fetch branch");
  return res.json();
}

export async function fetchPromotions(): Promise<Promotion[]> {
  const res = await fetch(`${API_BASE}/api/promotions`);
  if (!res.ok) throw new Error("Failed to fetch promotions");
  return res.json();
}

/**
 * Hybrid search: text-first with embedding similarity fallback
 */
export async function searchProductsHybrid(
  query: string,
  lat?: number,
  lng?: number,
  radiusKm?: number,
  storeChain?: string
): Promise<SearchResult[]> {
  const params = new URLSearchParams({ query });
  if (lat !== undefined) params.set("lat", lat.toString());
  if (lng !== undefined) params.set("lng", lng.toString());
  if (radiusKm !== undefined) params.set("radius_km", radiusKm.toString());
  if (storeChain) params.set("chain", storeChain);

  // Always use Next.js API routes for hybrid search (not available on Rust backend)
  const res = await fetch(`/api/products/search-hybrid?${params}`);
  if (!res.ok) throw new Error("Failed to search products");
  return res.json();
}

/**
 * Image-based search using CLIP embeddings
 */
export async function searchProductsByImage(
  imageFile: File,
  lat?: number,
  lng?: number,
  radiusKm?: number
): Promise<SearchResult[]> {
  const formData = new FormData();
  formData.append("image", imageFile);
  if (lat !== undefined) formData.append("lat", lat.toString());
  if (lng !== undefined) formData.append("lng", lng.toString());
  if (radiusKm !== undefined) formData.append("radius_km", radiusKm.toString());

  // Always use Next.js API routes for image search (not available on Rust backend)
  const res = await fetch(`/api/products/search-image`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) throw new Error("Failed to search by image");
  return res.json();
}

