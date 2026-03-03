"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ShoppingBag, Clock, CheckCircle, XCircle } from "lucide-react";
import { useReservations, ReservationStatus } from "@/hooks/useReservations";
import { ReservationCard } from "@/components/ReservationCard";

type FilterTab = "all" | "pending" | "completed" | "expired";

const tabs: { id: FilterTab; label: string; icon: typeof Clock }[] = [
  { id: "all", label: "ทั้งหมด", icon: ShoppingBag },
  { id: "pending", label: "รอรับ", icon: Clock },
  { id: "completed", label: "สำเร็จ", icon: CheckCircle },
  { id: "expired", label: "หมดเวลา", icon: XCircle },
];

export default function ReservationsPage() {
  const { reservations, isLoaded, cancelReservation, completeReservation } = useReservations();
  const [activeTab, setActiveTab] = useState<FilterTab>("all");

  const filteredReservations = reservations.filter((r) => {
    if (activeTab === "all") return true;
    if (activeTab === "expired") return r.status === "expired" || r.status === "cancelled";
    return r.status === activeTab;
  });

  const pendingCount = reservations.filter((r) => r.status === "pending").length;

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="mx-auto max-w-lg px-4 py-4 md:max-w-2xl lg:max-w-4xl">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </Link>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">รายการจองของฉัน</h1>
              {pendingCount > 0 && (
                <p className="text-sm text-gray-500">
                  {pendingCount} รายการรอรับสินค้า
                </p>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-100">
        <div className="mx-auto max-w-lg px-4 md:max-w-2xl lg:max-w-4xl">
          <div className="flex gap-1 overflow-x-auto py-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              const count = tab.id === "all" 
                ? reservations.length 
                : reservations.filter((r) => 
                    tab.id === "expired" 
                      ? r.status === "expired" || r.status === "cancelled"
                      : r.status === tab.id
                  ).length;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                    isActive
                      ? "bg-gray-900 text-white"
                      : "text-gray-500 hover:bg-gray-100"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                  {count > 0 && (
                    <span className={`text-xs ${isActive ? "text-gray-300" : "text-gray-400"}`}>
                      ({count})
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-lg px-4 py-4 md:max-w-2xl lg:max-w-4xl">
        {!isLoaded ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        ) : filteredReservations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <ShoppingBag className="h-8 w-8 text-gray-300" />
            </div>
            <h3 className="text-base font-medium text-gray-900">ไม่มีรายการจอง</h3>
            <p className="text-sm text-gray-400 mt-1">
              {activeTab === "all" 
                ? "เริ่มค้นหาและจองสินค้าเลย" 
                : "ไม่พบรายการในหมวดนี้"}
            </p>
            <Link
              href="/"
              className="mt-4 px-6 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors"
            >
              ค้นหาสินค้า
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredReservations.map((reservation) => (
              <ReservationCard
                key={reservation.id}
                reservation={reservation}
                onCancel={cancelReservation}
                onComplete={completeReservation}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

