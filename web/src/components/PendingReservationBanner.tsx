"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Clock, ChevronRight, X } from "lucide-react";
import { useReservations } from "@/hooks/useReservations";

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

export function PendingReservationBanner() {
  const { pendingReservations, isLoaded } = useReservations();
  const [isDismissed, setIsDismissed] = useState(false);
  const [timeLeft, setTimeLeft] = useState("");

  const nearestReservation = pendingReservations[0];

  // Update time remaining
  useEffect(() => {
    if (!nearestReservation) return;

    const updateTime = () => {
      setTimeLeft(formatTimeRemaining(nearestReservation.pickupDeadline));
    };

    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, [nearestReservation]);

  if (!isLoaded || pendingReservations.length === 0 || isDismissed) {
    return null;
  }

  const isUrgent = (() => {
    const deadline = new Date(nearestReservation.pickupDeadline);
    const now = new Date();
    const diff = deadline.getTime() - now.getTime();
    return diff < 30 * 60 * 1000; // Less than 30 minutes
  })();

  return (
    <div className={`rounded-2xl p-4 ${isUrgent ? "bg-red-50 border border-red-100" : "bg-amber-50 border border-amber-100"}`}>
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-xl ${isUrgent ? "bg-red-100" : "bg-amber-100"}`}>
          <Clock className={`h-5 w-5 ${isUrgent ? "text-red-600" : "text-amber-600"}`} />
        </div>
        <div className="flex-1 min-w-0">
          <p className={`font-medium text-sm ${isUrgent ? "text-red-900" : "text-amber-900"}`}>
            {pendingReservations.length === 1
              ? "คุณมีสินค้ารอรับ"
              : `คุณมี ${pendingReservations.length} รายการรอรับ`}
          </p>
          <p className={`text-xs mt-0.5 ${isUrgent ? "text-red-700" : "text-amber-700"}`}>
            {nearestReservation.productNameTh} • เหลือ {timeLeft}
          </p>
        </div>
        <div className="flex items-center gap-1">
          <Link
            href="/reservations"
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              isUrgent 
                ? "bg-red-600 text-white hover:bg-red-700" 
                : "bg-amber-600 text-white hover:bg-amber-700"
            }`}
          >
            ดูรายการ
          </Link>
          <button
            onClick={() => setIsDismissed(true)}
            className={`p-1.5 rounded-lg transition-colors ${
              isUrgent ? "hover:bg-red-100" : "hover:bg-amber-100"
            }`}
          >
            <X className={`h-4 w-4 ${isUrgent ? "text-red-400" : "text-amber-400"}`} />
          </button>
        </div>
      </div>
    </div>
  );
}

