"use client";

import { useState, useEffect, useRef } from "react";
import { useLocation } from "@/contexts/LocationContext";
import {
  MapPin,
  Navigation,
  Search,
  X,
  Home,
  Briefcase,
  Plus,
  Check,
  Loader2,
  ChevronRight,
} from "lucide-react";

interface GeoSearchResult {
  name: string;
  fullAddress: string;
  lat: number;
  lng: number;
}

const ICON_MAP = {
  home: Home,
  briefcase: Briefcase,
  "map-pin": MapPin,
} as const;

const LABEL_PRESETS = [
  { label: "บ้าน", icon: "home" as const },
  { label: "ที่ทำงาน", icon: "briefcase" as const },
];

export function LocationPicker() {
  const {
    activeLocation,
    gpsLocation,
    gpsLoading,
    permissionDenied,
    savedAddresses,
    isPickerOpen,
    closePicker,
    setActiveToGps,
    setActiveToSaved,
    setActiveToCustom,
    addSavedAddress,
    removeSavedAddress,
    requestGps,
  } = useLocation();

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<GeoSearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [savingResult, setSavingResult] = useState<GeoSearchResult | null>(null);
  const [saveLabel, setSaveLabel] = useState("");
  const [saveIcon, setSaveIcon] = useState<"home" | "briefcase" | "map-pin">("map-pin");
  const searchInputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Reset state when picker closes
  useEffect(() => {
    if (!isPickerOpen) {
      setSearchQuery("");
      setSearchResults([]);
      setSavingResult(null);
      setSaveLabel("");
      setSaveIcon("map-pin");
    }
  }, [isPickerOpen]);

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (searchQuery.trim().length < 2) {
      setSearchResults([]);
      setSearching(false);
      return;
    }

    setSearching(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/geocode/search?q=${encodeURIComponent(searchQuery.trim())}`);
        const data = await res.json();
        setSearchResults(data);
      } catch {
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, 400);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchQuery]);

  const handleUseResult = (result: GeoSearchResult) => {
    setActiveToCustom(result.lat, result.lng, result.name);
  };

  const handleStartSave = (result: GeoSearchResult) => {
    setSavingResult(result);
    // Pre-select label if home/work not yet saved
    const hasHome = savedAddresses.some((a) => a.label === "บ้าน");
    const hasWork = savedAddresses.some((a) => a.label === "ที่ทำงาน");
    if (!hasHome) {
      setSaveLabel("บ้าน");
      setSaveIcon("home");
    } else if (!hasWork) {
      setSaveLabel("ที่ทำงาน");
      setSaveIcon("briefcase");
    } else {
      setSaveLabel("");
      setSaveIcon("map-pin");
    }
  };

  const handleConfirmSave = () => {
    if (!savingResult || !saveLabel.trim()) return;
    const success = addSavedAddress({
      label: saveLabel.trim(),
      name: savingResult.name,
      fullAddress: savingResult.fullAddress,
      lat: savingResult.lat,
      lng: savingResult.lng,
      icon: saveIcon,
    });
    if (success) {
      setSavingResult(null);
      setSearchQuery("");
      setSearchResults([]);
    }
  };

  if (!isPickerOpen) return null;

  // Save address sub-view
  if (savingResult) {
    return (
      <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center" onClick={closePicker}>
        <div
          className="w-full max-w-md rounded-t-3xl bg-white pb-8 sm:rounded-3xl sm:pb-5 max-h-[70vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="sticky top-0 bg-white rounded-t-3xl px-5 pt-4 pb-3 border-b border-gray-100">
            <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-gray-200 sm:hidden" />
            <div className="flex items-center justify-between">
              <button onClick={() => setSavingResult(null)} className="text-sm text-gray-500 hover:text-gray-700">
                ย้อนกลับ
              </button>
              <h3 className="text-base font-medium text-gray-900">บันทึกที่อยู่</h3>
              <div className="w-12" />
            </div>
          </div>

          <div className="px-5 pt-4 space-y-4">
            {/* Selected location */}
            <div className="rounded-xl bg-gray-50 p-3">
              <p className="text-sm font-medium text-gray-900">{savingResult.name}</p>
              <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{savingResult.fullAddress}</p>
            </div>

            {/* Label presets */}
            <div>
              <p className="text-sm text-gray-500 mb-2">เลือกป้ายกำกับ</p>
              <div className="flex gap-2">
                {LABEL_PRESETS.map((preset) => {
                  const isUsed = savedAddresses.some((a) => a.label === preset.label);
                  const isSelected = saveLabel === preset.label;
                  const Icon = ICON_MAP[preset.icon];
                  return (
                    <button
                      key={preset.label}
                      onClick={() => {
                        if (!isUsed) {
                          setSaveLabel(preset.label);
                          setSaveIcon(preset.icon);
                        }
                      }}
                      disabled={isUsed}
                      className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm border transition-colors ${
                        isSelected
                          ? "border-gray-900 bg-gray-900 text-white"
                          : isUsed
                          ? "border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed"
                          : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <Icon className="h-4 w-4" strokeWidth={1.5} />
                      {preset.label}
                    </button>
                  );
                })}
                <button
                  onClick={() => {
                    setSaveLabel("");
                    setSaveIcon("map-pin");
                  }}
                  className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm border transition-colors ${
                    saveIcon === "map-pin"
                      ? "border-gray-900 bg-gray-900 text-white"
                      : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <MapPin className="h-4 w-4" strokeWidth={1.5} />
                  อื่นๆ
                </button>
              </div>
            </div>

            {/* Custom label input */}
            {saveIcon === "map-pin" && (
              <div>
                <input
                  type="text"
                  value={saveLabel}
                  onChange={(e) => setSaveLabel(e.target.value)}
                  placeholder="ชื่อสถานที่ เช่น คอนโด, ยิม..."
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm placeholder:text-gray-400 focus:border-gray-300 focus:outline-none"
                  maxLength={20}
                  autoFocus
                />
              </div>
            )}

            {/* Confirm */}
            <button
              onClick={handleConfirmSave}
              disabled={!saveLabel.trim()}
              className="w-full rounded-2xl bg-gray-900 py-3.5 text-sm font-medium text-white transition-colors hover:bg-gray-800 disabled:bg-gray-200 disabled:text-gray-400"
            >
              บันทึกที่อยู่
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center" onClick={closePicker}>
      <div
        className="w-full max-w-md rounded-t-3xl bg-white pb-8 sm:rounded-3xl sm:pb-5 max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white rounded-t-3xl px-5 pt-4 pb-3 border-b border-gray-100 flex-shrink-0">
          <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-gray-200 sm:hidden" />
          <div className="flex items-center justify-between">
            <h3 className="text-base font-medium text-gray-900">เลือกตำแหน่ง</h3>
            <button
              onClick={closePicker}
              className="rounded-xl p-2 text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-colors"
            >
              <X className="h-5 w-5" strokeWidth={1.5} />
            </button>
          </div>

          {/* Search input */}
          <div className="relative mt-3">
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ค้นหาสถานที่..."
              className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-10 pr-4 text-sm placeholder:text-gray-400 focus:border-gray-300 focus:bg-white focus:outline-none transition-colors"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" strokeWidth={1.5} />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                <X className="h-4 w-4 text-gray-300 hover:text-gray-500" strokeWidth={1.5} />
              </button>
            )}
          </div>
        </div>

        {/* Scrollable content */}
        <div className="overflow-y-auto flex-1 px-5 pt-3 pb-2">
          {/* Search Results */}
          {searchQuery.trim().length >= 2 ? (
            <div className="space-y-1">
              {searching ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-5 w-5 animate-spin text-gray-400" strokeWidth={1.5} />
                  <span className="ml-2 text-sm text-gray-400">กำลังค้นหา...</span>
                </div>
              ) : searchResults.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-sm text-gray-400">ไม่พบสถานที่</p>
                </div>
              ) : (
                searchResults.map((result, i) => (
                  <div
                    key={`${result.lat}-${result.lng}-${i}`}
                    className="rounded-xl p-3 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" strokeWidth={1.5} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">{result.name}</p>
                        <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{result.fullAddress}</p>
                        <div className="flex gap-2 mt-2">
                          <button
                            onClick={() => handleUseResult(result)}
                            className="text-xs font-medium text-gray-900 bg-gray-100 rounded-lg px-3 py-1.5 hover:bg-gray-200 transition-colors"
                          >
                            ใช้ตำแหน่งนี้
                          </button>
                          <button
                            onClick={() => handleStartSave(result)}
                            className="text-xs font-medium text-gray-500 bg-white border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-50 transition-colors"
                          >
                            บันทึก
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            <>
              {/* Current Location */}
              <div className="mb-3">
                <button
                  onClick={() => {
                    requestGps();
                    setActiveToGps();
                  }}
                  className={`flex w-full items-center gap-3 rounded-xl p-3 text-left transition-colors hover:bg-gray-50 ${
                    activeLocation.source === "gps" ? "bg-gray-50" : ""
                  }`}
                >
                  <div className={`rounded-xl p-2.5 ${activeLocation.source === "gps" ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600"}`}>
                    <Navigation className="h-5 w-5" strokeWidth={1.5} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">ตำแหน่งปัจจุบัน</p>
                    <p className="text-xs text-gray-400 mt-0.5 truncate">
                      {gpsLoading ? "กำลังหาตำแหน่ง..." : permissionDenied ? "กรุณาเปิด GPS" : gpsLocation.name}
                    </p>
                  </div>
                  {activeLocation.source === "gps" && (
                    <Check className="h-5 w-5 text-gray-900 flex-shrink-0" strokeWidth={2} />
                  )}
                  {gpsLoading && (
                    <Loader2 className="h-4 w-4 animate-spin text-gray-400 flex-shrink-0" strokeWidth={1.5} />
                  )}
                </button>
              </div>

              {/* Saved Addresses */}
              <div>
                <div className="flex items-center justify-between mb-2 px-1">
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">สถานที่ที่บันทึก</p>
                </div>

                {savedAddresses.length === 0 ? (
                  <div className="rounded-xl bg-gray-50 p-4 text-center">
                    <p className="text-sm text-gray-400">ยังไม่มีสถานที่ที่บันทึก</p>
                    <p className="text-xs text-gray-300 mt-1">ค้นหาสถานที่แล้วกด "บันทึก" เพื่อเพิ่ม</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {savedAddresses.map((addr) => {
                      const Icon = ICON_MAP[addr.icon];
                      const isActive = activeLocation.source === "saved" && activeLocation.savedAddressId === addr.id;
                      return (
                        <div
                          key={addr.id}
                          className={`flex items-center gap-3 rounded-xl p-3 transition-colors hover:bg-gray-50 ${
                            isActive ? "bg-gray-50" : ""
                          }`}
                        >
                          <button
                            onClick={() => setActiveToSaved(addr.id)}
                            className="flex items-center gap-3 flex-1 min-w-0 text-left"
                          >
                            <div className={`rounded-xl p-2.5 flex-shrink-0 ${isActive ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600"}`}>
                              <Icon className="h-5 w-5" strokeWidth={1.5} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900">{addr.label}</p>
                              <p className="text-xs text-gray-400 mt-0.5 truncate">{addr.name}</p>
                            </div>
                          </button>
                          {isActive ? (
                            <Check className="h-5 w-5 text-gray-900 flex-shrink-0" strokeWidth={2} />
                          ) : (
                            <button
                              onClick={() => removeSavedAddress(addr.id)}
                              className="rounded-lg p-1.5 text-gray-300 hover:text-red-400 hover:bg-red-50 transition-colors flex-shrink-0"
                            >
                              <X className="h-4 w-4" strokeWidth={1.5} />
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Recent search location */}
              {activeLocation.source === "search" && (
                <div className="mt-3">
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2 px-1">ตำแหน่งที่ใช้อยู่</p>
                  <div className="flex items-center gap-3 rounded-xl p-3 bg-gray-50">
                    <div className="rounded-xl p-2.5 bg-gray-900 text-white flex-shrink-0">
                      <MapPin className="h-5 w-5" strokeWidth={1.5} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{activeLocation.name}</p>
                    </div>
                    <Check className="h-5 w-5 text-gray-900 flex-shrink-0" strokeWidth={2} />
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
