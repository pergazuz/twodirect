"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SearchBar, CategoryButton, categories } from "@/components";
import { MapPin, Sparkles } from "lucide-react";

export default function Home() {
  const router = useRouter();
  const [location] = useState({ name: "กรุงเทพมหานคร", lat: 13.7563, lng: 100.5018 });

  const handleSearch = (query: string) => {
    router.push(`/search?q=${encodeURIComponent(query)}&lat=${location.lat}&lng=${location.lng}`);
  };

  const handleCategoryClick = (categoryId: string) => {
    router.push(`/search?category=${categoryId}&lat=${location.lat}&lng=${location.lng}`);
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      {/* Header */}
      <header className="bg-green-600 px-4 pb-8 pt-6 text-white">
        <div className="mx-auto max-w-lg">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">twodirect</h1>
              <p className="text-sm text-green-100">ค้นหาสินค้า → ตรงไปหยิบ</p>
            </div>
            <div className="flex items-center gap-1 rounded-full bg-green-700/50 px-3 py-1.5 text-sm">
              <MapPin className="h-4 w-4" />
              <span>{location.name}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Search Section */}
      <section className="mx-auto -mt-5 max-w-lg px-4">
        <SearchBar
          onSearch={handleSearch}
          placeholder="ค้นหาสินค้า เช่น โค้กซีโร่, มาม่า..."
          className="shadow-lg"
        />
      </section>

      {/* Categories */}
      <section className="mx-auto mt-8 max-w-lg px-4">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">หมวดหมู่สินค้า</h2>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
          {categories.map((cat) => (
            <CategoryButton
              key={cat.id}
              icon={cat.icon}
              label={cat.label}
              onClick={() => handleCategoryClick(cat.id)}
            />
          ))}
        </div>
      </section>

      {/* Promo Banner */}
      <section className="mx-auto mt-8 max-w-lg px-4">
        <div className="rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 p-4 text-white shadow-lg">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            <span className="font-semibold">สิทธิพิเศษ twodirect</span>
          </div>
          <p className="mt-2 text-sm text-orange-100">
            รับส่วนลด 10% เมื่อค้นหาและไปรับสินค้าผ่านแอป twodirect
          </p>
        </div>
      </section>

      {/* Popular Searches */}
      <section className="mx-auto mt-8 max-w-lg px-4 pb-8">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">ค้นหายอดนิยม</h2>
        <div className="flex flex-wrap gap-2">
          {["โค้ก ซีโร่", "มาม่า", "ออลคาเฟ่", "ข้าวมันไก่", "นมเมจิ", "กระทิงแดง"].map((term) => (
            <button
              key={term}
              onClick={() => handleSearch(term)}
              className="rounded-full bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-green-50 hover:text-green-700"
            >
              {term}
            </button>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 bg-white py-6">
        <div className="mx-auto max-w-lg px-4 text-center text-sm text-gray-500">
          <p>© 2026 twodirect — หาของเจอ ตรงถึงร้าน ไม่เสียเวลา</p>
          <p className="mt-1">MVP Demo • Powered by Rust + Next.js + Supabase</p>
        </div>
      </footer>
    </main>
  );
}
