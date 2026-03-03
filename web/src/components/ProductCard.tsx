"use client";

import { SearchResult } from "@/types";
import { formatPrice } from "@/lib/utils";
import { Store, ChevronRight } from "lucide-react";
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
      className="cursor-pointer rounded-xl border border-gray-100 bg-white p-4 shadow-sm transition-all hover:border-green-200 hover:shadow-md"
    >
      <div className="flex gap-4">
        {/* Product Image Placeholder */}
        <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-lg bg-gray-100">
          <span className="text-3xl">📦</span>
        </div>

        <div className="flex-1">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold text-gray-900">{product.name_th}</h3>
              <p className="text-sm text-gray-500">{product.name}</p>
            </div>
            <span className="text-lg font-bold text-green-600">
              {formatPrice(product.price)}
            </span>
          </div>

          <div className="mt-2 flex items-center gap-2 text-sm text-gray-600">
            <Store className="h-4 w-4" />
            <span>
              มีใน <span className="font-medium text-green-600">{branches.length}</span> สาขา
              ({totalStock} ชิ้น)
            </span>
          </div>

          {nearestBranch && (
            <p className="mt-1 text-sm text-gray-500">
              ใกล้สุด: {nearestBranch.branch.name_th} ({nearestBranch.distance_km} km)
            </p>
          )}

          {hasExclusivePromo && (
            <div className="mt-2">
              <PromoBadge
                promotion={{
                  id: "exclusive",
                  title: "twodirect Exclusive",
                  title_th: "ส่วนลดพิเศษ twodirect",
                  is_twodirect_exclusive: true,
                }}
              />
            </div>
          )}
        </div>

        <ChevronRight className="h-5 w-5 flex-shrink-0 self-center text-gray-400" />
      </div>
    </div>
  );
}

