"use client";

import { useState } from "react";
import { Ticket, Check, Clock, Percent, Tag, Gift, ShoppingBag, Sparkles, ChevronRight, X } from "lucide-react";
import { useCoupons } from "@/hooks/useCoupons";
import { Coupon, UserCoupon } from "@/types";

interface CouponSelectorProps {
  productPrice: number;
  selectedCoupon: UserCoupon | null;
  onSelect: (userCoupon: UserCoupon | null, discount: number) => void;
}

function getCategoryIcon(category?: string) {
  switch (category) {
    case "beverages": return <Tag className="h-4 w-4" />;
    case "snacks": return <Gift className="h-4 w-4" />;
    case "ready-meals": return <ShoppingBag className="h-4 w-4" />;
    case "exclusive": return <Sparkles className="h-4 w-4" />;
    default: return <Percent className="h-4 w-4" />;
  }
}

function getCategoryColor(category?: string) {
  switch (category) {
    case "beverages": return "from-blue-500 to-blue-600";
    case "snacks": return "from-orange-500 to-orange-600";
    case "ready-meals": return "from-green-500 to-green-600";
    case "exclusive": return "from-purple-500 to-purple-600";
    case "new_user": return "from-pink-500 to-pink-600";
    default: return "from-gray-700 to-gray-900";
  }
}

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

export function CouponSelector({ productPrice, selectedCoupon, onSelect }: CouponSelectorProps) {
  const { availableCoupons, calculateDiscount } = useCoupons();
  const [isOpen, setIsOpen] = useState(false);

  const applicableCoupons = availableCoupons.filter((uc) => {
    if (!uc.coupon) return false;
    return productPrice >= uc.coupon.min_purchase;
  });

  const handleSelect = (uc: UserCoupon) => {
    if (!uc.coupon) return;
    const discount = calculateDiscount(uc.coupon, productPrice);
    onSelect(uc, discount);
    setIsOpen(false);
  };

  const handleRemove = () => {
    onSelect(null, 0);
  };

  if (applicableCoupons.length === 0 && !selectedCoupon) {
    return null;
  }

  return (
    <>
      {/* Coupon Trigger */}
      <div
        onClick={() => setIsOpen(true)}
        className="w-full flex items-center gap-3 p-4 bg-gray-50 rounded-xl mb-4 hover:bg-gray-100 transition-colors text-left cursor-pointer"
      >
        <Ticket className="h-5 w-5 text-red-500 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          {selectedCoupon?.coupon ? (
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-green-600 truncate">
                {selectedCoupon.coupon.title_th}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove();
                }}
                className="p-0.5 rounded-full hover:bg-gray-200"
              >
                <X className="h-3.5 w-3.5 text-gray-400" />
              </button>
            </div>
          ) : (
            <span className="text-sm text-gray-500">
              เลือกคูปอง ({applicableCoupons.length} ใบที่ใช้ได้)
            </span>
          )}
        </div>
        <ChevronRight className="h-4 w-4 text-gray-400 flex-shrink-0" />
      </div>

      {/* Coupon Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
          <div className="relative w-full max-w-lg bg-white rounded-t-3xl sm:rounded-2xl max-h-[70vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-100 px-4 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Ticket className="h-5 w-5 text-red-500" />
                <h3 className="text-base font-semibold text-gray-900">
                  เลือกคูปอง
                </h3>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-full hover:bg-gray-100"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            {/* Coupon List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {/* No coupon option */}
              <button
                onClick={() => {
                  onSelect(null, 0);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-colors text-left ${
                  !selectedCoupon
                    ? "border-gray-900 bg-gray-50"
                    : "border-gray-200 hover:bg-gray-50"
                }`}
              >
                <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                  <X className="h-5 w-5 text-gray-400" />
                </div>
                <span className="text-sm text-gray-600">ไม่ใช้คูปอง</span>
                {!selectedCoupon && (
                  <Check className="h-4 w-4 text-gray-900 ml-auto" />
                )}
              </button>

              {applicableCoupons.map((uc) => {
                if (!uc.coupon) return null;
                const coupon = uc.coupon;
                const discount = calculateDiscount(coupon, productPrice);
                const isSelected = selectedCoupon?.id === uc.id;
                const gradientColor = getCategoryColor(coupon.category);
                const isExpiringSoon =
                  new Date(coupon.valid_until).getTime() - Date.now() < 3 * 24 * 60 * 60 * 1000;

                return (
                  <button
                    key={uc.id}
                    onClick={() => handleSelect(uc)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-colors text-left ${
                      isSelected
                        ? "border-gray-900 bg-gray-50"
                        : "border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    {/* Badge */}
                    <div
                      className={`h-10 w-10 rounded-lg bg-gradient-to-br ${gradientColor} flex items-center justify-center text-white flex-shrink-0`}
                    >
                      {getCategoryIcon(coupon.category)}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {coupon.title_th}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-red-500 font-semibold">
                          -฿{discount.toFixed(0)}
                        </span>
                        <span
                          className={`text-[10px] ${
                            isExpiringSoon ? "text-red-400" : "text-gray-400"
                          }`}
                        >
                          {formatDaysLeft(coupon.valid_until)}
                        </span>
                      </div>
                    </div>

                    {isSelected && (
                      <Check className="h-4 w-4 text-gray-900 flex-shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
