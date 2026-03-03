"use client";

import { useState } from "react";
import { Upload, Check, X, Loader2, Image as ImageIcon, ArrowLeft } from "lucide-react";
import { uploadProductImage, getPublicUrl, STORAGE_URL } from "@/lib/storage";
import Link from "next/link";

interface Product {
  id: string;
  name_th: string;
  image_url: string | null;
}

const PRODUCTS: Product[] = [
  { id: "11111111-1111-1111-1111-111111111111", name_th: "โค้ก ซีโร่ 500ml", image_url: "coke-zero.jpg" },
  { id: "22222222-2222-2222-2222-222222222222", name_th: "เลย์ รสดั้งเดิม 75g", image_url: "lays.jpg" },
  { id: "33333333-3333-3333-3333-333333333333", name_th: "มาม่า รสต้มยำกุ้ง", image_url: "mama.jpg" },
  { id: "44444444-4444-4444-4444-444444444444", name_th: "ออลคาเฟ่ ลาเต้", image_url: "allcafe.jpg" },
  { id: "55555555-5555-5555-5555-555555555555", name_th: "ข้าวมันไก่", image_url: "chicken-rice.jpg" },
  { id: "66666666-6666-6666-6666-666666666666", name_th: "โอนิกิริ แซลมอน", image_url: "onigiri.jpg" },
  { id: "77777777-7777-7777-7777-777777777777", name_th: "เมจิ นมสด 450ml", image_url: "meiji-milk.jpg" },
  { id: "88888888-8888-8888-8888-888888888888", name_th: "คุกกี้ดัส ไวท์", image_url: "couque.jpg" },
  { id: "99999999-9999-9999-9999-999999999999", name_th: "กระทิงแดง 250ml", image_url: "redbull.jpg" },
  { id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa", name_th: "ขนมปังไส้กรอก", image_url: "sausage-bun.jpg" },
];

export default function AdminPage() {
  const [uploading, setUploading] = useState<string | null>(null);
  const [uploaded, setUploaded] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);

  const handleUpload = async (product: Product, file: File) => {
    if (!product.image_url) return;
    
    setUploading(product.id);
    setError(null);

    try {
      await uploadProductImage(file, product.image_url);
      setUploaded((prev) => ({ ...prev, [product.id]: true }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(null);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          <Link href="/" className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </Link>
          <h1 className="text-lg font-medium text-gray-900">Upload Product Images</h1>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {error && (
          <div className="mb-4 p-4 rounded-xl bg-red-50 text-red-700 text-sm flex items-center gap-2">
            <X className="h-4 w-4" />
            {error}
          </div>
        )}

        <p className="text-sm text-gray-500 mb-6">
          Upload images to Supabase Storage. Images will be stored at:<br />
          <code className="text-xs bg-gray-100 px-2 py-1 rounded mt-1 inline-block">
            {STORAGE_URL}/[filename]
          </code>
        </p>

        <div className="space-y-3">
          {PRODUCTS.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-2xl p-4 border border-gray-100 flex items-center gap-4"
            >
              <div className="relative h-14 w-14 rounded-xl bg-gray-50 overflow-hidden flex-shrink-0">
                {uploaded[product.id] && product.image_url ? (
                  <img
                    src={getPublicUrl(product.image_url)}
                    alt={product.name_th}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <ImageIcon className="h-6 w-6 text-gray-300" />
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 text-sm">{product.name_th}</p>
                <p className="text-xs text-gray-400 mt-0.5">{product.image_url}</p>
              </div>

              <label className="flex-shrink-0">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleUpload(product, file);
                    e.target.value = "";
                  }}
                  disabled={uploading !== null}
                />
                <span
                  className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer min-h-[44px] ${
                    uploaded[product.id]
                      ? "bg-green-50 text-green-600"
                      : uploading === product.id
                      ? "bg-gray-100 text-gray-400"
                      : "bg-gray-900 text-white hover:bg-gray-800"
                  }`}
                >
                  {uploading === product.id ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : uploaded[product.id] ? (
                    <>
                      <Check className="h-4 w-4" />
                      Done
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4" />
                      Upload
                    </>
                  )}
                </span>
              </label>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

