"use client";

import { Promotion } from "@/types";
import { cn } from "@/lib/utils";
import { Sparkles, Percent } from "lucide-react";

interface PromoBadgeProps {
  promotion: Promotion;
  size?: "sm" | "md";
  className?: string;
}

export function PromoBadge({ promotion, size = "sm", className }: PromoBadgeProps) {
  const isExclusive = promotion.is_twodirect_exclusive;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full font-medium",
        isExclusive
          ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white"
          : "bg-green-100 text-green-700",
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm",
        className
      )}
    >
      {isExclusive ? (
        <Sparkles className={cn(size === "sm" ? "h-3 w-3" : "h-4 w-4")} />
      ) : (
        <Percent className={cn(size === "sm" ? "h-3 w-3" : "h-4 w-4")} />
      )}
      {promotion.title_th}
    </span>
  );
}

