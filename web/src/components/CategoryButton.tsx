"use client";

import { cn } from "@/lib/utils";
import { Coffee, Cookie, UtensilsCrossed, Soup, Milk, Croissant, LucideIcon } from "lucide-react";

interface CategoryButtonProps {
  icon: LucideIcon;
  label: string;
  active?: boolean;
  onClick?: () => void;
}

export function CategoryButton({ icon: Icon, label, active, onClick }: CategoryButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col items-center justify-center gap-1.5 rounded-2xl p-3 transition-all min-h-[76px]",
        "sm:p-4 sm:min-h-[88px] sm:gap-2",
        "md:p-5 md:min-h-[100px]",
        "active:scale-[0.98] touch-manipulation",
        active
          ? "bg-green-50 text-green-600 ring-1 ring-green-200"
          : "bg-white text-gray-500 hover:bg-gray-50 hover:text-gray-700 border border-gray-100"
      )}
    >
      <Icon className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8" strokeWidth={1.5} />
      <span className="text-[11px] font-medium leading-tight sm:text-xs md:text-sm">{label}</span>
    </button>
  );
}

export const categories = [
  { id: "beverages", icon: Coffee, label: "เครื่องดื่ม" },
  { id: "snacks", icon: Cookie, label: "ขนม" },
  { id: "ready-meals", icon: UtensilsCrossed, label: "อาหาร" },
  { id: "instant-food", icon: Soup, label: "บะหมี่" },
  { id: "dairy", icon: Milk, label: "นม" },
  { id: "bakery", icon: Croissant, label: "เบเกอรี่" },
];

