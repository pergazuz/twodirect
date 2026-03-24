"use client";

import { useState } from "react";
import { StorePrice, Product } from "@/types";
import { formatPrice } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { MapPin, ChevronRight, Tag, TrendingDown, Store, Check } from "lucide-react";

interface PriceComparisonProps {
  product: Product;
  storePrices: StorePrice[];
  onStoreClick?: (storeId: string) => void;
  showHeader?: boolean;
  maxItems?: number;
  selectedStoreId?: string;
}

export function PriceComparison({
  product,
  storePrices,
  onStoreClick,
  showHeader = true,
  maxItems,
  selectedStoreId,
}: PriceComparisonProps) {
  const router = useRouter();
  const sorted = [...storePrices].sort((a, b) => a.price - b.price);
  const displayed = maxItems ? sorted.slice(0, maxItems) : sorted;
  const cheapest = sorted.find((s) => s.in_stock)?.price;
  const inStockPrices = sorted.filter((s) => s.in_stock).map((s) => s.price);
  const priceMin = inStockPrices.length > 0 ? Math.min(...inStockPrices) : null;
  const priceMax = inStockPrices.length > 0 ? Math.max(...inStockPrices) : null;

  const handleStoreClick = (storeId: string) => {
    if (onStoreClick) {
      onStoreClick(storeId);
    } else {
      router.push(
        `/search?q=${encodeURIComponent(product.name_th)}&store=${storeId}`
      );
    }
  };

  return (
    <div className="space-y-3">
      {showHeader && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingDown className="h-4 w-4 text-gray-900" strokeWidth={2} />
            <h3 className="font-semibold text-gray-900 text-sm sm:text-base">
              เปรียบเทียบราคา
            </h3>
          </div>
          {priceMin !== null && priceMax !== null && priceMin !== priceMax && (
            <span className="text-sm font-semibold text-gray-900">
              {formatPrice(priceMin)} - {formatPrice(priceMax)}
            </span>
          )}
        </div>
      )}

      <div className="rounded-2xl bg-white border border-gray-100 overflow-hidden divide-y divide-gray-100">
        {/* Recommended store (cheapest) header */}
        {sorted.length > 0 && sorted[0].in_stock && (
          <div className="px-4 py-2 bg-gray-900">
            <p className="text-xs font-medium text-white">
              ร้านค้าแนะนำ
            </p>
          </div>
        )}

        {displayed.map((sp, idx) => {
          const isCheapest = sp.price === cheapest && sp.in_stock;
          const isSelected = selectedStoreId === sp.store_id;
          return (
            <button
              key={sp.store_id}
              onClick={() => handleStoreClick(sp.store_id)}
              disabled={!sp.in_stock}
              className={`w-full flex items-center gap-3 px-4 py-3.5 sm:py-4 transition-colors ${
                sp.in_stock
                  ? "hover:bg-gray-50 active:bg-gray-100"
                  : "opacity-40 cursor-not-allowed"
              } ${isSelected ? "bg-gray-50 ring-1 ring-inset ring-gray-900/10" : ""}`}
            >
              {/* Store Logo */}
              <div className="relative h-10 w-10 flex-shrink-0 rounded-xl bg-gray-50 overflow-hidden sm:h-12 sm:w-12">
                {sp.logo_url ? (
                  <img
                    src={sp.logo_url}
                    alt={sp.store_name}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                      e.currentTarget.nextElementSibling?.classList.remove("hidden");
                    }}
                  />
                ) : null}
                <div
                  className={`flex h-full w-full items-center justify-center absolute inset-0 ${
                    sp.logo_url ? "hidden" : ""
                  }`}
                >
                  <Store className="h-5 w-5 text-gray-300" strokeWidth={1.5} />
                </div>
              </div>

              {/* Store Info */}
              <div className="flex-1 min-w-0 text-left">
                <div className="flex items-center gap-1.5">
                  <p className="font-medium text-gray-900 text-sm sm:text-base">
                    {sp.store_name_th}
                  </p>
                  {isCheapest && idx === 0 && (
                    <span className="text-[10px] font-medium text-white bg-gray-900 px-1.5 py-0.5 rounded-full">
                      ถูกที่สุด
                    </span>
                  )}
                </div>
                {sp.in_stock ? (
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <MapPin className="h-3 w-3 text-gray-400" strokeWidth={1.5} />
                    <span className="text-xs text-gray-400">
                      {sp.branch_count} สาขาใกล้คุณ
                    </span>
                  </div>
                ) : (
                  <span className="text-xs text-red-400 mt-0.5 block">
                    สินค้าหมด
                  </span>
                )}
                {sp.unit && sp.in_stock && (
                  <span className="text-[10px] text-gray-400 mt-0.5 block">
                    {sp.unit}
                  </span>
                )}
              </div>

              {/* Price + Action */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <p
                  className={`text-base font-bold sm:text-lg ${
                    isCheapest
                      ? "text-gray-900"
                      : sp.in_stock
                      ? "text-gray-900"
                      : "text-gray-300 line-through"
                  }`}
                >
                  {formatPrice(sp.price)}
                </p>

                {sp.in_stock && (
                  <div className={`flex items-center justify-center rounded-xl px-3 py-2 text-xs font-medium sm:px-4 sm:py-2.5 sm:text-sm whitespace-nowrap transition-colors ${
                    isSelected
                      ? "bg-gray-100 text-gray-900"
                      : "bg-gray-900 text-white hover:bg-gray-800"
                  }`}>
                    {isSelected ? (
                      <>
                        <Check className="h-3.5 w-3.5 mr-1" strokeWidth={2} />
                        เลือกอยู่
                      </>
                    ) : (
                      <>
                        ไปยังร้านค้า
                        <ChevronRight className="h-3.5 w-3.5 ml-0.5" strokeWidth={2} />
                      </>
                    )}
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Show "see all stores" if truncated */}
      {maxItems && sorted.length > maxItems && (
        <button
          onClick={() =>
            router.push(`/compare/${product.id}`)
          }
          className="w-full text-center py-2.5 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
        >
          ดูราคาทุกร้านค้า ({sorted.length})
          <ChevronRight className="h-4 w-4 inline ml-0.5" strokeWidth={2} />
        </button>
      )}
    </div>
  );
}

// Compact version for ProductCard - shows price range badge
interface PriceRangeBadgeProps {
  min: number;
  max: number;
  storeCount: number;
}

export function PriceRangeBadge({ min, max, storeCount }: PriceRangeBadgeProps) {
  if (min === max) return null;
  return (
    <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-gray-100 text-gray-700">
      <Tag className="h-3 w-3" strokeWidth={2} />
      <span className="text-[10px] font-medium sm:text-xs">
        {formatPrice(min)} - {formatPrice(max)} ({storeCount} ร้าน)
      </span>
    </div>
  );
}
