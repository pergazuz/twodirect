"use client";

import { useState } from "react";
import { Search, Camera, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  className?: string;
}

export function SearchBar({ onSearch, placeholder = "ค้นหาสินค้า...", className }: SearchBarProps) {
  const [query, setQuery] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  const handleClear = () => {
    setQuery("");
  };

  return (
    <form onSubmit={handleSubmit} className={cn("relative", className)}>
      <div className="relative flex items-center">
        <Search className="absolute left-4 h-5 w-5 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-full border border-gray-200 bg-white py-3 pl-12 pr-24 text-base shadow-sm transition-shadow focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20"
        />
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-16 p-1 text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        )}
        <button
          type="button"
          className="absolute right-3 rounded-full bg-gray-100 p-2 text-gray-600 transition-colors hover:bg-gray-200"
          title="ค้นหาด้วยรูปภาพ"
        >
          <Camera className="h-5 w-5" />
        </button>
      </div>
    </form>
  );
}

