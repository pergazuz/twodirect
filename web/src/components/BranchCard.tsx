"use client";

import { BranchWithStock } from "@/types";
import { formatDistance } from "@/lib/utils";
import { MapPin, Clock, Navigation, Package } from "lucide-react";
import { PromoBadge } from "./PromoBadge";

interface BranchCardProps {
  branchWithStock: BranchWithStock;
  onNavigate?: (branch: BranchWithStock) => void;
}

export function BranchCard({ branchWithStock, onNavigate }: BranchCardProps) {
  const { branch, quantity, distance_km, promotions } = branchWithStock;

  const handleNavigate = () => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${branch.latitude},${branch.longitude}`;
    window.open(url, "_blank");
    onNavigate?.(branchWithStock);
  };

  const stockStatus = quantity > 10 ? "in-stock" : quantity > 0 ? "low-stock" : "out-of-stock";
  const stockColors = {
    "in-stock": "text-green-600 bg-green-50",
    "low-stock": "text-amber-600 bg-amber-50",
    "out-of-stock": "text-red-600 bg-red-50",
  };

  return (
    <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-gray-900">{branch.name_th}</h3>
            <span className="text-sm text-gray-500">{formatDistance(distance_km)}</span>
          </div>
          <div className="mt-1 flex items-center gap-1 text-sm text-gray-500">
            <MapPin className="h-4 w-4" />
            <span>{branch.address_th}</span>
          </div>
          <div className="mt-1 flex items-center gap-1 text-sm text-gray-500">
            <Clock className="h-4 w-4" />
            <span>{branch.opening_hours}</span>
          </div>
        </div>
        <div className={`rounded-lg px-3 py-1 ${stockColors[stockStatus]}`}>
          <div className="flex items-center gap-1">
            <Package className="h-4 w-4" />
            <span className="font-medium">{quantity}</span>
          </div>
        </div>
      </div>

      {promotions.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {promotions.slice(0, 2).map((promo) => (
            <PromoBadge key={promo.id} promotion={promo} />
          ))}
        </div>
      )}

      <button
        onClick={handleNavigate}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-green-600 py-2.5 font-medium text-white transition-colors hover:bg-green-700"
      >
        <Navigation className="h-5 w-5" />
        นำทาง
      </button>
    </div>
  );
}

