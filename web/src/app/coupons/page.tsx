"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Ticket,
  Tag,
  Clock,
  Check,
  Loader2,
  Gift,
  Percent,
  Sparkles,
  ShoppingBag,
} from "lucide-react";
import { useCoupons } from "@/hooks/useCoupons";
import { useAuth } from "@/contexts/AuthContext";
import { Coupon } from "@/types";

type Tab = "all" | "collected" | "used";

function formatDaysLeft(validUntil: string): string {
  const now = new Date();
  const end = new Date(validUntil);
  const diff = end.getTime() - now.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days <= 0) return "วันสุดท้าย";
  if (days === 1) return "เหลือ 1 วัน";
  if (days <= 7) return `เหลือ ${days} วัน`;
  return `หมดอายุ ${end.toLocaleDateString("th-TH", { day: "numeric", month: "short" })}`;
}

function getCategoryIcon(category?: string) {
  switch (category) {
    case "beverages":
      return <Tag className="h-5 w-5" />;
    case "snacks":
      return <Gift className="h-5 w-5" />;
    case "ready-meals":
      return <ShoppingBag className="h-5 w-5" />;
    case "exclusive":
      return <Sparkles className="h-5 w-5" />;
    default:
      return <Percent className="h-5 w-5" />;
  }
}

function getCategoryColor(category?: string) {
  switch (category) {
    case "beverages":
      return "from-blue-500 to-blue-600";
    case "snacks":
      return "from-orange-500 to-orange-600";
    case "ready-meals":
      return "from-green-500 to-green-600";
    case "exclusive":
      return "from-purple-500 to-purple-600";
    case "new_user":
      return "from-pink-500 to-pink-600";
    default:
      return "from-gray-700 to-gray-900";
  }
}

function CouponCard({
  coupon,
  collected,
  used,
  onCollect,
  collecting,
}: {
  coupon: Coupon;
  collected: boolean;
  used: boolean;
  onCollect: () => void;
  collecting: boolean;
}) {
  const isExpiringSoon =
    new Date(coupon.valid_until).getTime() - Date.now() < 3 * 24 * 60 * 60 * 1000;
  const isFull = coupon.usage_limit ? coupon.usage_count >= coupon.usage_limit : false;
  const gradientColor = getCategoryColor(coupon.category);

  return (
    <div
      className={`relative overflow-hidden rounded-2xl bg-white border transition-all ${
        used ? "opacity-60 border-gray-200" : "border-gray-100 shadow-sm hover:shadow-md"
      }`}
    >
      {/* Coupon notch decoration */}
      <div className="absolute left-[88px] sm:left-[104px] top-0 bottom-0 w-0 border-l-2 border-dashed border-gray-200" />
      <div className="absolute left-[80px] sm:left-[96px] -top-3 w-6 h-6 bg-gray-50 rounded-full border border-gray-200" />
      <div className="absolute left-[80px] sm:left-[96px] -bottom-3 w-6 h-6 bg-gray-50 rounded-full border border-gray-200" />

      <div className="flex">
        {/* Left - Discount Badge */}
        <div
          className={`flex-shrink-0 w-[88px] sm:w-[104px] flex flex-col items-center justify-center p-3 bg-gradient-to-br ${gradientColor} text-white`}
        >
          <div className="mb-1">{getCategoryIcon(coupon.category)}</div>
          <div className="text-center">
            {coupon.discount_type === "percent" ? (
              <>
                <span className="text-2xl sm:text-3xl font-bold leading-none">
                  {coupon.discount_value}
                </span>
                <span className="text-sm font-semibold">%</span>
              </>
            ) : (
              <>
                <span className="text-lg sm:text-2xl font-bold leading-none">
                  ฿{coupon.discount_value}
                </span>
              </>
            )}
          </div>
          <span className="text-[10px] mt-0.5 opacity-80">ส่วนลด</span>
        </div>

        {/* Right - Details */}
        <div className="flex-1 p-3 sm:p-4 pl-6 sm:pl-8 flex flex-col justify-between min-w-0">
          <div>
            <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">
              {coupon.title_th}
            </h3>
            <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
              {coupon.description_th}
            </p>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              {coupon.min_purchase > 0 && (
                <span className="text-[10px] text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full">
                  ขั้นต่ำ ฿{coupon.min_purchase}
                </span>
              )}
              {coupon.max_discount && coupon.discount_type === "percent" && (
                <span className="text-[10px] text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full">
                  สูงสุด ฿{coupon.max_discount}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between mt-3 gap-2">
            <div className="flex items-center gap-1 min-w-0">
              <Clock className="h-3 w-3 text-gray-400 flex-shrink-0" />
              <span
                className={`text-[11px] truncate ${
                  isExpiringSoon ? "text-red-500 font-medium" : "text-gray-400"
                }`}
              >
                {formatDaysLeft(coupon.valid_until)}
              </span>
            </div>

            {used ? (
              <span className="text-xs text-gray-400 bg-gray-100 px-3 py-1.5 rounded-full font-medium flex-shrink-0">
                ใช้แล้ว
              </span>
            ) : collected ? (
              <span className="text-xs text-green-600 bg-green-50 px-3 py-1.5 rounded-full font-medium flex items-center gap-1 flex-shrink-0">
                <Check className="h-3 w-3" />
                เก็บแล้ว
              </span>
            ) : isFull ? (
              <span className="text-xs text-gray-400 bg-gray-100 px-3 py-1.5 rounded-full font-medium flex-shrink-0">
                หมดแล้ว
              </span>
            ) : (
              <button
                onClick={onCollect}
                disabled={collecting}
                className="text-xs text-white bg-red-500 hover:bg-red-600 active:bg-red-700 px-4 py-1.5 rounded-full font-medium transition-colors flex items-center gap-1 flex-shrink-0 disabled:opacity-50"
              >
                {collecting ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <Ticket className="h-3 w-3" />
                )}
                เก็บ
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CouponsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const {
    coupons,
    userCoupons,
    availableCoupons,
    isLoading,
    collectCoupon,
    isCollected,
  } = useCoupons();
  const [activeTab, setActiveTab] = useState<Tab>("all");
  const [collectingId, setCollectingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const handleCollect = async (couponId: string) => {
    if (!user) {
      router.push(`/login?redirect=${encodeURIComponent("/coupons")}`);
      return;
    }

    setCollectingId(couponId);
    const result = await collectCoupon(couponId);
    setCollectingId(null);

    setToast({
      message: result.success ? "เก็บคูปองสำเร็จ!" : result.error || "เกิดข้อผิดพลาด",
      type: result.success ? "success" : "error",
    });
    setTimeout(() => setToast(null), 2000);
  };

  const tabs: { id: Tab; label: string; count?: number }[] = [
    { id: "all", label: "คูปองทั้งหมด", count: coupons.length },
    { id: "collected", label: "คูปองของฉัน", count: availableCoupons.length },
    { id: "used", label: "ใช้แล้ว", count: userCoupons.filter((uc) => uc.is_used).length },
  ];

  const getFilteredCoupons = () => {
    if (activeTab === "all") return coupons;

    if (activeTab === "collected") {
      return availableCoupons
        .map((uc) => uc.coupon)
        .filter((c): c is Coupon => !!c);
    }

    if (activeTab === "used") {
      return userCoupons
        .filter((uc) => uc.is_used)
        .map((uc) => uc.coupon)
        .filter((c): c is Coupon => !!c);
    }

    return [];
  };

  const filteredCoupons = getFilteredCoupons();

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
            <div className="flex-1">
              <h1 className="text-lg font-semibold text-gray-900">คูปองส่วนลด</h1>
              <p className="text-xs text-gray-500">
                เก็บคูปองและใช้เมื่อจองสินค้า
              </p>
            </div>
            {availableCoupons.length > 0 && (
              <div className="flex items-center gap-1.5 bg-red-50 text-red-600 px-3 py-1.5 rounded-full">
                <Ticket className="h-4 w-4" />
                <span className="text-sm font-semibold">{availableCoupons.length}</span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-100">
        <div className="mx-auto max-w-lg px-4 md:max-w-2xl lg:max-w-4xl">
          <div className="flex gap-1 overflow-x-auto py-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? "bg-gray-900 text-white"
                    : "text-gray-500 hover:bg-gray-100"
                }`}
              >
                {tab.label}
                {tab.count !== undefined && tab.count > 0 && (
                  <span
                    className={`text-xs ${
                      activeTab === tab.id ? "text-gray-300" : "text-gray-400"
                    }`}
                  >
                    ({tab.count})
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-lg px-4 py-4 md:max-w-2xl lg:max-w-4xl">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : filteredCoupons.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Ticket className="h-8 w-8 text-gray-300" />
            </div>
            <h3 className="text-base font-medium text-gray-900">
              {activeTab === "all"
                ? "ยังไม่มีคูปอง"
                : activeTab === "collected"
                ? "คุณยังไม่ได้เก็บคูปอง"
                : "ยังไม่มีคูปองที่ใช้แล้ว"}
            </h3>
            <p className="text-sm text-gray-400 mt-1">
              {activeTab === "all"
                ? "คูปองใหม่จะปรากฏที่นี่"
                : "เก็บคูปองจากแท็บ 'คูปองทั้งหมด'"}
            </p>
            {activeTab !== "all" && (
              <button
                onClick={() => setActiveTab("all")}
                className="mt-4 px-6 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors"
              >
                ดูคูปองทั้งหมด
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredCoupons.map((coupon) => {
              const userCoupon = userCoupons.find(
                (uc) => uc.coupon_id === coupon.id
              );
              return (
                <CouponCard
                  key={coupon.id}
                  coupon={coupon}
                  collected={isCollected(coupon.id)}
                  used={userCoupon?.is_used || false}
                  onCollect={() => handleCollect(coupon.id)}
                  collecting={collectingId === coupon.id}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-4">
          <div
            className={`px-5 py-3 rounded-full shadow-lg text-sm font-medium ${
              toast.type === "success"
                ? "bg-green-600 text-white"
                : "bg-red-600 text-white"
            }`}
          >
            {toast.message}
          </div>
        </div>
      )}
    </main>
  );
}
