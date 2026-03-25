"use client";

import Link from "next/link";
import { MapPin, Loader2, Navigation, ShoppingBag, User, LogIn, Search, Ticket } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useReservations } from "@/hooks/useReservations";
import { useCoupons } from "@/hooks/useCoupons";
import { useLocation } from "@/contexts/LocationContext";

// Helper function to get user display name
function getUserDisplayName(fullName: string | null | undefined, email: string | null | undefined): string {
  if (fullName) return fullName;
  if (email) {
    const username = email.split('@')[0];
    return username;
  }
  return "บัญชี";
}

export function Header() {
  const { user, profile, isLoading: authLoading } = useAuth();
  const { pendingCount } = useReservations();
  const { availableCoupons } = useCoupons();
  const { activeLocation: location, gpsLoading: loading, gpsError: error, permissionDenied, openPicker } = useLocation();
  const isDefault = location.source === "gps" && location.lat === 13.7563;

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
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      {/* Top Bar */}
      <div className="bg-gray-900 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-10 text-xs sm:text-sm">
            <div className="flex items-center gap-4">
              <span className="hidden sm:inline text-gray-300">ยินดีต้อนรับสู่ TwoDirect</span>
              <span className="text-gray-400">|</span>
              <span className="text-gray-300">ค้นหาสินค้า ตรงไปหยิบ</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={openPicker}
                className="flex items-center gap-1.5 text-gray-300 hover:text-white transition-colors"
                title={error || `ตำแหน่ง: ${location.name}`}
              >
                {loading ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : isDefault || permissionDenied ? (
                  <Navigation className="h-3.5 w-3.5" />
                ) : (
                  <MapPin className="h-3.5 w-3.5" />
                )}
                <span className="hidden xs:inline">{getDisplayName()}</span>
                <span className="xs:hidden">{getShortName()}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center">
              <img
                src="/logo_twodirect.png"
                alt="TwoDirect"
                className="h-8 sm:h-10 w-auto hover:opacity-90 transition-opacity"
              />
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              <Link href="/" className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors">
                หน้าแรก
              </Link>
              <Link href="/search" className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors">
                ค้นหาสินค้า
              </Link>
              {/* TODO: Re-enable when coupon system is ready */}
              {/* <Link href="/coupons" className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors">
                คูปอง
              </Link> */}
              {/* TODO: Re-enable when reservation system is ready */}
              {/* <Link href="/reservations" className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors">
                รายการจอง
              </Link> */}
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Search Icon (Mobile) */}
              <Link
                href="/search"
                className="md:hidden p-2 rounded-full hover:bg-gray-100 transition-colors"
                title="ค้นหา"
              >
                <Search className="h-5 w-5 text-gray-600" />
              </Link>

              {/* TODO: Re-enable coupon icon when coupon system is ready */}
              {/* <Link
                href="/coupons"
                className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
                title="คูปอง"
              >
                <Ticket className="h-5 w-5 text-gray-600" />
                {availableCoupons.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                    {availableCoupons.length > 9 ? "9+" : availableCoupons.length}
                  </span>
                )}
              </Link> */}

              {/* TODO: Re-enable reservations icon when reservation system is ready */}
              {/* <Link
                href="/reservations"
                className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
                title="รายการจอง"
              >
                <ShoppingBag className="h-5 w-5 text-gray-600" />
                {pendingCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                    {pendingCount > 9 ? "9+" : pendingCount}
                  </span>
                )}
              </Link> */}

              {/* Auth */}
              {authLoading ? (
                <div className="flex items-center justify-center p-2">
                  <Loader2 className="h-5 w-5 text-gray-400 animate-spin" />
                </div>
              ) : user ? (
                <Link
                  href="/profile"
                  className="flex items-center gap-2 p-2 rounded-full hover:bg-gray-100 transition-colors"
                  title="โปรไฟล์"
                >
                  {profile?.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt={profile.full_name || "Profile"}
                      className="h-8 w-8 rounded-full object-cover border-2 border-gray-200"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                        e.currentTarget.nextElementSibling?.classList.remove("hidden");
                      }}
                    />
                  ) : null}
                  <div className={`h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center ${profile?.avatar_url ? "hidden" : ""}`}>
                    <User className="h-4 w-4 text-gray-600" />
                  </div>
                  <span className="hidden lg:inline text-sm font-medium text-gray-700">
                    {getUserDisplayName(profile?.full_name, profile?.email || user?.email)}
                  </span>
                </Link>
              ) : (
                <Link
                  href="/login"
                  className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-full hover:bg-gray-800 transition-colors text-sm font-medium"
                >
                  <LogIn className="h-4 w-4" />
                  <span className="hidden sm:inline">เข้าสู่ระบบ</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

