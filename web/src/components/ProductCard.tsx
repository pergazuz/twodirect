"use client";

import { SearchResult } from "@/types";
import { formatPrice } from "@/lib/utils";
import { Store, ChevronRight, Package } from "lucide-react";
import { PromoBadge } from "./PromoBadge";

interface ProductCardProps {
  result: SearchResult;
  onClick?: () => void;
}

export function ProductCard({ result, onClick }: ProductCardProps) {
  const { product, branches } = result;
  const totalStock = branches.reduce((sum, b) => sum + b.quantity, 0);
  const nearestBranch = branches[0];
  const hasExclusivePromo = branches.some((b) =>
    b.promotions.some((p) => p.is_twodirect_exclusive)
  );

  return (
    <div
      onClick={onClick}
      className="cursor-pointer rounded-2xl bg-white p-4 transition-all hover:bg-gray-50 active:bg-gray-100 border border-gray-100 sm:p-5"
    >
      <div className="flex gap-4">
        {/* Product Image */}
        <div className="relative h-14 w-14 flex-shrink-0 rounded-xl bg-gray-50 overflow-hidden sm:h-16 sm:w-16">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name_th}
              className="h-full w-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.nextElementSibling?.classList.remove('hidden');
              }}
            />
          ) : null}
          <div className={`flex h-full w-full items-center justify-center absolute inset-0 ${product.image_url ? 'hidden' : ''}`}>
            <Package className="h-6 w-6 text-gray-300 sm:h-7 sm:w-7" strokeWidth={1.5} />
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <h3 className="font-medium text-gray-900 text-sm leading-snug sm:text-base">
                {product.name_th}
              </h3>
              <p className="text-xs text-gray-400 mt-0.5 sm:text-sm">{product.name}</p>
            </div>
            <span className="text-sm font-semibold text-gray-900 flex-shrink-0 sm:text-base">
              {formatPrice(product.price)}
            </span>
          </div>

          <div className="mt-3 flex items-center gap-4 text-xs text-gray-500 sm:text-sm">
            <div className="flex items-center gap-1.5">
              <Store className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span>
                <span className="font-medium text-gray-700">{branches.length}</span> สาขา
              </span>
            </div>
            {nearestBranch && (
              <span className="text-gray-400">
                {nearestBranch.distance_km} km
              </span>
            )}
          </div>

          {hasExclusivePromo && (
            <div className="mt-2.5">
              <PromoBadge
                promotion={{
                  id: "exclusive",
                  title: "twodirect Exclusive",
                  title_th: "ส่วนลด twodirect",
                  is_twodirect_exclusive: true,
                }}
              />
            </div>
          )}
        </div>

        <ChevronRight className="h-5 w-5 flex-shrink-0 self-center text-gray-300" />
      </div>
    </div>
  );
}

