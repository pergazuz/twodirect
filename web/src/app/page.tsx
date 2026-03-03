"use client";

import { useRouter } from "next/navigation";
import { SearchBar, CategoryButton, categories } from "@/components";
import { MapPin, Loader2, Navigation, Tag } from "lucide-react";
import { useGeolocation } from "@/hooks/useGeolocation";

export default function Home() {
  const router = useRouter();
  const { location, loading, error, permissionDenied, requestLocation, isDefault } = useGeolocation();

  const handleSearch = (query: string) => {
    router.push(`/search?q=${encodeURIComponent(query)}&lat=${location.lat}&lng=${location.lng}`);
  };

  const handleCategoryClick = (categoryId: string) => {
    router.push(`/search?category=${categoryId}&lat=${location.lat}&lng=${location.lng}`);
  };

  const handleLocationClick = () => {
    requestLocation();
  };

  const getDisplayName = () => {
    if (loading) return "กำลังหา...";
    if (error && permissionDenied) return "เปิด GPS";
    if (location.name.length > 12) {
      return location.name.substring(0, 12) + "...";
    }
    return location.name;
  };

  const getShortName = () => {
    if (loading) return "...";
    if (error && permissionDenied) return "GPS";
    return location.name.substring(0, 6);
  };

  return (
    <main className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-gray-900 px-4 pb-12 pt-6 sm:pb-14 sm:pt-8">
        <div className="mx-auto max-w-lg md:max-w-2xl lg:max-w-4xl">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h1 className="text-xl font-semibold text-white sm:text-2xl">TwoDirect</h1>
            </div>
            <button
              onClick={handleLocationClick}
              className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-2 text-sm text-white transition-colors hover:bg-white/20 active:bg-white/15 min-h-[40px]"
              title={error || `ตำแหน่ง: ${location.name}`}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.5} />
              ) : isDefault || permissionDenied ? (
                <Navigation className="h-4 w-4" strokeWidth={1.5} />
              ) : (
                <MapPin className="h-4 w-4" strokeWidth={1.5} />
              )}
              <span className="hidden xs:inline">{getDisplayName()}</span>
              <span className="xs:hidden">{getShortName()}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Search Section */}
      <section className="mx-auto -mt-6 max-w-lg px-4 md:max-w-2xl lg:max-w-4xl">
        <SearchBar
          onSearch={handleSearch}
          placeholder="ค้นหาสินค้า..."
        />
      </section>

      {/* Categories */}
      <section className="mx-auto mt-8 max-w-lg px-4 sm:mt-10 md:max-w-2xl lg:max-w-4xl">
        <h2 className="mb-4 text-sm font-medium text-gray-500 uppercase tracking-wide sm:mb-5">หมวดหมู่</h2>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-6 sm:gap-4">
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
      <section className="mx-auto mt-8 max-w-lg px-4 sm:mt-10 md:max-w-2xl lg:max-w-4xl">
        <div className="rounded-2xl bg-gray-50 p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-gray-900 p-2.5">
              <Tag className="h-5 w-5 text-white" strokeWidth={1.5} />
            </div>
            <div>
              <p className="font-medium text-gray-900 text-sm sm:text-base">ส่วนลด 10% สำหรับผู้ใช้ twodirect</p>
              <p className="text-sm text-gray-500 mt-0.5">ค้นหาและไปรับสินค้าผ่านแอป</p>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Searches */}
      <section className="mx-auto mt-8 max-w-lg px-4 pb-8 sm:mt-10 sm:pb-10 md:max-w-2xl lg:max-w-4xl">
        <h2 className="mb-4 text-sm font-medium text-gray-500 uppercase tracking-wide sm:mb-5">ยอดนิยม</h2>
        <div className="flex flex-wrap gap-2 sm:gap-3">
          {["โค้ก ซีโร่", "มาม่า", "ออลคาเฟ่", "ข้าวมันไก่", "นมเมจิ", "กระทิงแดง"].map((term) => (
            <button
              key={term}
              onClick={() => handleSearch(term)}
              className="rounded-full border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 transition-colors hover:border-gray-300 hover:bg-gray-50 active:bg-gray-100 min-h-[44px]"
            >
              {term}
            </button>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-6 sm:py-8">
        <div className="mx-auto max-w-lg px-4 text-center md:max-w-2xl">
          <p className="text-sm text-gray-400">© 2026 twodirect</p>
        </div>
      </footer>
    </main>
  );
}
