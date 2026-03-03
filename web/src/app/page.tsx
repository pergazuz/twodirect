"use client";

import { useRouter } from "next/navigation";
import { SearchBar, StoreSelector, BannerCarousel } from "@/components";
import { MapPin, Loader2, Navigation, Percent, Gift, Clock } from "lucide-react";
import { useGeolocation } from "@/hooks/useGeolocation";

export default function Home() {
  const router = useRouter();
  const { location, loading, error, permissionDenied, requestLocation, isDefault } = useGeolocation();

  const handleSearch = (query: string) => {
    router.push(`/search?q=${encodeURIComponent(query)}&lat=${location.lat}&lng=${location.lng}`);
  };

  const handleStoreClick = (storeId: string) => {
    router.push(`/search?store=${storeId}&lat=${location.lat}&lng=${location.lng}`);
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
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gray-900 px-4 pb-12 pt-6 sm:pb-14 sm:pt-8">
        <div className="mx-auto max-w-lg md:max-w-2xl lg:max-w-4xl">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h1 className="text-xl font-semibold text-white sm:text-2xl">TwoDirect</h1>
              <p className="text-sm text-gray-400 mt-0.5">ค้นหาสินค้า ตรงไปหยิบ</p>
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

      {/* Banner Carousel */}
      <section className="mx-auto mt-6 max-w-lg px-4 sm:mt-8 md:max-w-2xl lg:max-w-4xl">
        <BannerCarousel />
      </section>

      {/* Store Selector */}
      <section className="mx-auto mt-6 max-w-lg sm:mt-8 md:max-w-2xl lg:max-w-4xl">
        <h2 className="mb-3 px-4 text-sm font-medium text-gray-500 uppercase tracking-wide sm:mb-4">
          ร้านค้า
        </h2>
        <StoreSelector onStoreClick={handleStoreClick} className="px-0" />
      </section>

      {/* Promotions */}
      <section className="mx-auto mt-6 max-w-lg px-4 sm:mt-8 md:max-w-2xl lg:max-w-4xl">
        <h2 className="mb-3 text-sm font-medium text-gray-500 uppercase tracking-wide sm:mb-4">
          โปรโมชั่น
        </h2>
        <div className="space-y-3">
          {/* Main Promo Card */}
          <button
            onClick={() => handleSearch("โปรโมชั่น")}
            className="w-full rounded-2xl bg-white border border-gray-100 p-4 sm:p-5 text-left transition-all hover:bg-gray-50 active:scale-[0.99]"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-gray-900 text-white text-xs font-medium px-2.5 py-1 rounded-full">
                    ดีลพิเศษ
                  </span>
                </div>
                <p className="text-gray-900 font-semibold text-lg sm:text-xl">ลด 10% ทุกออเดอร์</p>
                <p className="text-gray-400 text-sm mt-1">สำหรับผู้ใช้ TwoDirect เท่านั้น</p>
              </div>
              <div className="flex-shrink-0 ml-4">
                <div className="bg-gray-100 rounded-2xl p-3 sm:p-4">
                  <Percent className="h-7 w-7 sm:h-8 sm:w-8 text-gray-600" strokeWidth={1.5} />
                </div>
              </div>
            </div>
          </button>

          {/* Secondary Promos */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleSearch("ซื้อ 1 แถม 1")}
              className="rounded-xl bg-white border border-gray-100 p-4 text-left transition-all hover:bg-gray-50 active:scale-[0.98]"
            >
              <Gift className="h-5 w-5 text-gray-500 mb-2" strokeWidth={1.5} />
              <p className="font-medium text-gray-900 text-sm">ซื้อ 1 แถม 1</p>
              <p className="text-xs text-gray-400 mt-0.5">สินค้าที่ร่วมรายการ</p>
            </button>
            <button
              onClick={() => handleSearch("flash sale")}
              className="rounded-xl bg-white border border-gray-100 p-4 text-left transition-all hover:bg-gray-50 active:scale-[0.98]"
            >
              <Clock className="h-5 w-5 text-gray-500 mb-2" strokeWidth={1.5} />
              <p className="font-medium text-gray-900 text-sm">Flash Sale</p>
              <p className="text-xs text-gray-400 mt-0.5">เหลือเวลาอีก 2 ชม.</p>
            </button>
          </div>
        </div>
      </section>

      {/* Popular Searches */}
      <section className="mx-auto mt-6 max-w-lg px-4 pb-8 sm:mt-8 sm:pb-10 md:max-w-2xl lg:max-w-4xl">
        <h2 className="mb-3 text-sm font-medium text-gray-500 uppercase tracking-wide sm:mb-4">ยอดนิยม</h2>
        <div className="flex flex-wrap gap-2 sm:gap-3">
          {["โค้ก ซีโร่", "มาม่า", "ออลคาเฟ่", "ข้าวมันไก่", "นมเมจิ", "กระทิงแดง"].map((term) => (
            <button
              key={term}
              onClick={() => handleSearch(term)}
              className="rounded-full bg-white border border-gray-200 px-4 py-2.5 text-sm text-gray-700 transition-colors hover:border-gray-300 hover:bg-gray-50 active:bg-gray-100 min-h-[44px]"
            >
              {term}
            </button>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-6 sm:py-8">
        <div className="mx-auto max-w-lg px-4 text-center md:max-w-2xl">
          <p className="text-sm text-gray-400">© 2026 TwoDirect</p>
        </div>
      </footer>
    </main>
  );
}
