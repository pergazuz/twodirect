"use client";

import { cn } from "@/lib/utils";

interface CategoryButtonProps {
  icon: string;
  label: string;
  active?: boolean;
  onClick?: () => void;
}

export function CategoryButton({ icon, label, active, onClick }: CategoryButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-1 rounded-xl p-3 transition-all",
        active
          ? "bg-green-100 text-green-700"
          : "bg-gray-50 text-gray-600 hover:bg-gray-100"
      )}
    >
      <span className="text-2xl">{icon}</span>
      <span className="text-xs font-medium">{label}</span>
    </button>
  );
}

export const categories = [
  { id: "beverages", icon: "🥤", label: "เครื่องดื่ม" },
  { id: "snacks", icon: "🍿", label: "ขนม" },
  { id: "ready-meals", icon: "🍱", label: "อาหาร" },
  { id: "instant-food", icon: "🍜", label: "บะหมี่" },
  { id: "dairy", icon: "🥛", label: "นม" },
  { id: "bakery", icon: "🥐", label: "เบเกอรี่" },
];

