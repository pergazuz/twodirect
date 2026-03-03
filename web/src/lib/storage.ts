import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const STORAGE_BUCKET = "products";
export const STORAGE_URL = `${supabaseUrl}/storage/v1/object/public/${STORAGE_BUCKET}`;

/**
 * Upload an image to Supabase Storage
 * @param file - The file to upload
 * @param filename - The filename to use (e.g., "coke-zero.jpg")
 * @returns The public URL of the uploaded image
 */
export async function uploadProductImage(
  file: File,
  filename: string
): Promise<string> {
  // Remove any path traversal characters
  const safeFilename = filename.replace(/[^a-zA-Z0-9.-]/g, "-");

  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(safeFilename, file, {
      cacheControl: "3600",
      upsert: true,
    });

  if (error) {
    throw new Error(`Failed to upload image: ${error.message}`);
  }

  return getPublicUrl(safeFilename);
}

/**
 * Get the public URL for an image
 * @param filename - The filename in storage
 * @returns The public URL
 */
export function getPublicUrl(filename: string): string {
  return `${STORAGE_URL}/${filename}`;
}

/**
 * Delete an image from storage
 * @param filename - The filename to delete
 */
export async function deleteProductImage(filename: string): Promise<void> {
  const { error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .remove([filename]);

  if (error) {
    throw new Error(`Failed to delete image: ${error.message}`);
  }
}

/**
 * List all images in the products bucket
 */
export async function listProductImages(): Promise<string[]> {
  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .list();

  if (error) {
    throw new Error(`Failed to list images: ${error.message}`);
  }

  return data.map((file) => file.name);
}

