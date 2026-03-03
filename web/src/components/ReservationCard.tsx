"use client";

import { useState, useEffect } from "react";
import { Clock, MapPin, Navigation, X, Package, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { Reservation, ReservationStatus } from "@/hooks/useReservations";

interface ReservationCardProps {
  reservation: Reservation;
  onCancel?: (id: string) => void;
  onComplete?: (id: string) => void;
}

const statusConfig: Record<ReservationStatus, { label: string; color: string; icon: typeof Clock }> = {
  pending: { label: "รอรับสินค้า", color: "bg-amber-100 text-amber-700", icon: Clock },
  completed: { label: "รับสินค้าแล้ว", color: "bg-green-100 text-green-700", icon: CheckCircle },
  expired: { label: "หมดเวลา", color: "bg-red-100 text-red-700", icon: XCircle },
  cancelled: { label: "ยกเลิก", color: "bg-gray-100 text-gray-500", icon: XCircle },
};

function formatTimeRemaining(deadline: string): string {
  const now = new Date();
  const end = new Date(deadline);
  const diff = end.getTime() - now.getTime();

  if (diff <= 0) return "หมดเวลา";

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (hours > 0) {
    return `${hours} ชม. ${minutes} นาที`;
  }
  return `${minutes} นาที`;
}

export function ReservationCard({ reservation, onCancel, onComplete }: ReservationCardProps) {
  const [timeRemaining, setTimeRemaining] = useState(() => formatTimeRemaining(reservation.pickupDeadline));
  const status = statusConfig[reservation.status];
  const StatusIcon = status.icon;
  const isPending = reservation.status === "pending";

  // Update countdown every minute
  useEffect(() => {
    if (!isPending) return;

    const interval = setInterval(() => {
      setTimeRemaining(formatTimeRemaining(reservation.pickupDeadline));
    }, 60000);

    return () => clearInterval(interval);
  }, [isPending, reservation.pickupDeadline]);

  const handleNavigate = () => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${reservation.branchLat},${reservation.branchLng}`;
    window.open(url, "_blank");
  };

  return (
    <div className="rounded-2xl bg-white border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${status.color}`}>
            <StatusIcon className="h-3 w-3 inline mr-1" />
            {status.label}
          </span>
        </div>
        <span className="text-xs text-gray-400">#{reservation.code}</span>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Product Info */}
        <div className="flex items-start gap-3 mb-4">
          <div className="w-14 h-14 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <Package className="h-6 w-6 text-gray-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-gray-900 text-sm truncate">{reservation.productNameTh}</p>
            <p className="text-xs text-gray-500 mt-0.5">{reservation.productName}</p>
            <p className="text-sm font-semibold text-gray-900 mt-1">฿{reservation.productPrice}</p>
          </div>
        </div>

        {/* Branch Info */}
        <div className="flex items-start gap-2 text-sm text-gray-600 mb-3">
          <MapPin className="h-4 w-4 text-gray-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">{reservation.branchNameTh}</p>
            <p className="text-xs text-gray-400">{reservation.branchAddress}</p>
          </div>
        </div>

        {/* Time Remaining (for pending) */}
        {isPending && (
          <div className="flex items-center gap-2 text-sm mb-4 p-3 bg-amber-50 rounded-xl">
            <Clock className="h-4 w-4 text-amber-600" />
            <span className="text-amber-700">
              เหลือเวลา: <span className="font-semibold">{timeRemaining}</span>
            </span>
          </div>
        )}

        {/* Actions */}
        {isPending && (
          <div className="flex gap-2">
            <button
              onClick={() => onCancel?.(reservation.id)}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              <X className="h-4 w-4" />
              ยกเลิก
            </button>
            <button
              onClick={handleNavigate}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 transition-colors"
            >
              <Navigation className="h-4 w-4" />
              นำทาง
            </button>
          </div>
        )}

        {/* Completed/Expired info */}
        {reservation.status === "completed" && reservation.completedAt && (
          <p className="text-xs text-gray-400 text-center">
            รับสินค้าเมื่อ {new Date(reservation.completedAt).toLocaleString("th-TH")}
          </p>
        )}
      </div>
    </div>
  );
}

