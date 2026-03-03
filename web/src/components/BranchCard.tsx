"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BranchWithStock, Product } from "@/types";
import { formatDistance } from "@/lib/utils";
import { MapPin, Clock, Navigation, ShoppingBag } from "lucide-react";
import { PromoBadge } from "./PromoBadge";
import { ReservationModal } from "./ReservationModal";
import { useAuth } from "@/contexts/AuthContext";

interface BranchCardProps {
  branchWithStock: BranchWithStock;
  product?: Product;
  onNavigate?: (branch: BranchWithStock) => void;
  onReserve?: (branch: BranchWithStock) => void;
}

export function BranchCard({ branchWithStock, product, onNavigate, onReserve }: BranchCardProps) {
  const { branch, quantity, distance_km, promotions } = branchWithStock;
  const [showReservationModal, setShowReservationModal] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  const handleNavigate = () => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${branch.latitude},${branch.longitude}`;
    window.open(url, "_blank");
    onNavigate?.(branchWithStock);
  };

  const handleReserve = () => {
    if (!user) {
      // Redirect to login if not logged in
      router.push("/login");
      return;
    }
    setShowReservationModal(true);
    onReserve?.(branchWithStock);
  };

  return (
    <>
      <div className="rounded-2xl bg-white p-4 border border-gray-100 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-gray-900 text-sm sm:text-base">{branch.name_th}</h3>
            <div className="mt-2 space-y-1.5">
              <div className="flex items-start gap-2 text-xs text-gray-500 sm:text-sm">
                <MapPin className="h-4 w-4 flex-shrink-0 mt-0.5 text-gray-400" strokeWidth={1.5} />
                <span className="line-clamp-2">{branch.address_th}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500 sm:text-sm">
                <Clock className="h-4 w-4 flex-shrink-0 text-gray-400" strokeWidth={1.5} />
                <span>{branch.opening_hours}</span>
              </div>
            </div>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-lg font-semibold text-green-600 sm:text-xl">
              {formatDistance(distance_km)}
            </p>
            <span className="text-[10px] text-gray-400 sm:text-xs">
              {quantity} ชิ้น
            </span>
          </div>
        </div>

        {promotions.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5 sm:gap-2">
            {promotions.slice(0, 2).map((promo) => (
              <PromoBadge key={promo.id} promotion={promo} />
            ))}
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-4 flex gap-2">
          <button
            onClick={handleNavigate}
            className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-gray-200 py-3 font-medium text-gray-700 transition-colors hover:bg-gray-50 active:bg-gray-100 min-h-[48px] text-sm sm:text-base"
          >
            <Navigation className="h-4 w-4 sm:h-5 sm:w-5" />
            นำทาง
          </button>
          <button
            onClick={handleReserve}
            className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-gray-900 py-3 font-medium text-white transition-colors hover:bg-gray-800 active:bg-gray-700 min-h-[48px] text-sm sm:text-base"
          >
            <ShoppingBag className="h-4 w-4 sm:h-5 sm:w-5" />
            จองของ
          </button>
        </div>
      </div>

      {/* Reservation Modal */}
      {product && (
        <ReservationModal
          isOpen={showReservationModal}
          onClose={() => setShowReservationModal(false)}
          product={product}
          branch={branch}
          quantity={quantity}
          pickupHours={2}
        />
      )}
    </>
  );
}

