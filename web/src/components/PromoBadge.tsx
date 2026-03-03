"use client";

import { Promotion } from "@/types";
import { cn } from "@/lib/utils";
import { Tag } from "lucide-react";

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
        "inline-flex items-center gap-1 rounded-lg font-medium whitespace-nowrap",
        isExclusive
          ? "bg-gray-900 text-white"
          : "bg-gray-100 text-gray-600",
        size === "sm"
          ? "px-2 py-1 text-[11px]"
          : "px-2.5 py-1 text-xs",
        className
      )}
    >
      <Tag className={cn(size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5")} strokeWidth={1.5} />
      <span className="truncate max-w-[100px]">{promotion.title_th}</span>
    </span>
  );
}

