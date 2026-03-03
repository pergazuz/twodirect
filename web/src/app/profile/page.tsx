"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, LogOut, User, Clock, Heart, ShoppingBag, Search, ChevronRight, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase, SearchHistoryRecord, ReservationRecord } from "@/lib/supabase";

export default function ProfilePage() {
  const router = useRouter();
  const { user, profile, isLoading, signOut } = useAuth();
  const [searchHistory, setSearchHistory] = useState<SearchHistoryRecord[]>([]);
  const [reservations, setReservations] = useState<ReservationRecord[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    const loadUserData = async () => {
      if (!user) return;

      try {
        // Load search history
        const { data: searches } = await supabase
          .from("search_history")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(10);

        if (searches) setSearchHistory(searches);

        // Load reservations
        const { data: reservs } = await supabase
          .from("reservations")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(10);

        if (reservs) setReservations(reservs);
      } catch (error) {
        console.error("Error loading user data:", error);
      } finally {
        setLoadingData(false);
      }
    };

    loadUserData();
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="mx-auto max-w-lg px-4 py-4 md:max-w-2xl lg:max-w-4xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/" className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors">
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </Link>
              <h1 className="text-lg font-semibold text-gray-900">โปรไฟล์</h1>
            </div>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-1.5 text-sm text-red-600 hover:text-red-700"
            >
              <LogOut className="h-4 w-4" />
              ออกจากระบบ
            </button>
          </div>
        </div>
      </header>

      {/* Profile Info */}
      <div className="mx-auto max-w-lg px-4 py-6 md:max-w-2xl lg:max-w-4xl">
        <div className="bg-white rounded-2xl p-6 border border-gray-100">
          <div className="flex items-center gap-4">
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={profile.full_name || "Profile"}
                className="h-16 w-16 rounded-full object-cover"
              />
            ) : (
              <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center">
                <User className="h-8 w-8 text-gray-400" />
              </div>
            )}
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {profile?.full_name || "ผู้ใช้"}
              </h2>
              <p className="text-sm text-gray-500">{profile?.email || user.email}</p>
              {profile?.provider && (
                <span className="inline-flex items-center mt-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                  {profile.provider === "google" ? "Google" : profile.provider}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <div className="mt-6 space-y-3">
          <Link
            href="/reservations"
            className="flex items-center justify-between bg-white rounded-2xl p-4 border border-gray-100 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-emerald-50">
                <ShoppingBag className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">รายการจอง</p>
                <p className="text-sm text-gray-500">{reservations.length} รายการ</p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400" />
          </Link>
        </div>

        {/* Search History */}
        <div className="mt-6">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3 px-1">
            ประวัติการค้นหา
          </h3>

          {loadingData ? (
            <div className="bg-white rounded-2xl p-8 border border-gray-100 flex items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
            </div>
          ) : searchHistory.length === 0 ? (
            <div className="bg-white rounded-2xl p-6 border border-gray-100 text-center">
              <Search className="h-8 w-8 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500 text-sm">ยังไม่มีประวัติการค้นหา</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-100">
              {searchHistory.map((item) => (
                <Link
                  key={item.id}
                  href={`/search?q=${encodeURIComponent(item.query)}`}
                  className="flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors"
                >
                  <Search className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  <span className="text-gray-700 flex-1 truncate">{item.query}</span>
                  <span className="text-xs text-gray-400">
                    {new Date(item.created_at).toLocaleDateString("th-TH")}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
