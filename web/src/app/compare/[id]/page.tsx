"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { mockProducts, getStorePrices, getPriceRange } from "@/lib/mock-data";
import { PriceComparison } from "@/components/PriceComparison";
import { formatPrice } from "@/lib/utils";
import { ArrowLeft, Package, Share2 } from "lucide-react";

export default function ComparePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const product = mockProducts.find((p) => p.id === id);
  const storePrices = getStorePrices(id);
  const priceRange = getPriceRange(id);

  if (!product) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">ไม่พบสินค้า</p>
          <button
            onClick={() => router.push("/")}
            className="mt-4 px-5 py-2.5 rounded-xl bg-gray-900 text-white text-sm font-medium"
          >
            กลับหน้าหลัก
          </button>
        </div>
      </main>
    );
  }

  const inStockStores = storePrices.filter((s) => s.in_stock);
  const totalBranches = storePrices.reduce((sum, s) => sum + s.branch_count, 0);

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white border-b border-gray-100">
        <div className="mx-auto max-w-lg px-3 py-3 sm:px-4 sm:py-4 md:max-w-2xl lg:max-w-4xl">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.back()}
              className="rounded-xl p-2.5 hover:bg-gray-50 active:bg-gray-100 min-h-[44px] min-w-[44px] flex items-center justify-center transition-colors"
              aria-label="Go back"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600" strokeWidth={1.5} />
            </button>
            <h1 className="text-sm font-semibold text-gray-900 sm:text-base">
              เปรียบเทียบราคา
            </h1>
            <button
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: `${product.name_th} - เปรียบเทียบราคา`,
                    text: `เปรียบเทียบราคา ${product.name_th} จาก ${inStockStores.length} ร้านค้า`,
                    url: window.location.href,
                  });
                }
              }}
              className="rounded-xl p-2.5 hover:bg-gray-50 active:bg-gray-100 min-h-[44px] min-w-[44px] flex items-center justify-center transition-colors"
              aria-label="Share"
            >
              <Share2 className="h-5 w-5 text-gray-600" strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-lg px-3 py-4 sm:px-4 sm:py-5 md:max-w-2xl lg:max-w-4xl">
        {/* Product Info Card */}
        <div className="rounded-2xl bg-white p-5 border border-gray-100 sm:p-6">
          <div className="flex gap-4 items-start">
            <div className="relative h-20 w-20 flex-shrink-0 rounded-2xl bg-gray-50 overflow-hidden sm:h-28 sm:w-28">
              {product.image_url ? (
                <img
                  src={product.image_url}
                  alt={product.name_th}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                    e.currentTarget.nextElementSibling?.classList.remove("hidden");
                  }}
                />
              ) : null}
              <div
                className={`flex h-full w-full items-center justify-center absolute inset-0 ${
                  product.image_url ? "hidden" : ""
                }`}
              >
                <Package className="h-8 w-8 text-gray-300" strokeWidth={1.5} />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-semibold text-gray-900 sm:text-xl">
                {product.name_th}
              </h2>
              <p className="text-sm text-gray-400 mt-0.5">{product.name}</p>

              {priceRange && priceRange.min !== priceRange.max ? (
                <p className="mt-3 text-xl font-bold text-gray-900 sm:text-2xl">
                  {formatPrice(priceRange.min)} - {formatPrice(priceRange.max)}
                </p>
              ) : (
                <p className="mt-3 text-xl font-bold text-gray-900 sm:text-2xl">
                  {formatPrice(product.price)}
                </p>
              )}

              <div className="mt-1.5 flex items-center gap-2 text-xs text-gray-400 sm:text-sm flex-wrap">
                <span>ขายที่ร้านค้า {inStockStores.length} ร้าน</span>
                <span className="text-gray-200">|</span>
                <span>สินค้า {totalBranches} สาขา</span>
              </div>
            </div>
          </div>
        </div>

        {/* CTA button */}
        <div className="mt-4">
          <button
            onClick={() => {
              document.getElementById("store-prices")?.scrollIntoView({ behavior: "smooth" });
            }}
            className="w-full rounded-2xl bg-gray-900 text-white py-3.5 px-5 font-semibold text-sm sm:text-base hover:bg-gray-800 active:bg-gray-700 transition-colors"
          >
            ดูราคาทุกร้านค้า
          </button>
        </div>

        {/* Price Comparison */}
        <div id="store-prices" className="mt-6">
          <PriceComparison
            product={product}
            storePrices={storePrices}
            showHeader={true}
          />
        </div>

        {/* Footer hint */}
        <div className="mt-8 text-center pb-4">
          <p className="text-xs text-gray-400">
            ราคาอัปเดตล่าสุด: สำรวจจากหน้าร้าน (ราคาอาจเปลี่ยนแปลง)
          </p>
          <button
            onClick={() => router.push(`/search?q=${encodeURIComponent(product.name_th)}`)}
            className="mt-3 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
          >
            ค้นหาสินค้าใกล้เคียง
          </button>
        </div>
      </div>
    </main>
  );
}
