"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useLocation } from "@/contexts/LocationContext";
import dynamic from "next/dynamic";
import {
  MapPin,
  Navigation,
  Search,
  X,
  Home,
  Briefcase,
  Check,
  Loader2,
  Map as MapIcon,
  ChevronLeft,
  Crosshair,
} from "lucide-react";

// Dynamically import Leaflet components (no SSR)
const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);

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

// Helper component to track map center changes
function MapCenterTracker({ onCenterChange }: { onCenterChange: (lat: number, lng: number) => void }) {
  const { useMapEvents } = require("react-leaflet");
  useMapEvents({
    moveend: (e: any) => {
      const center = e.target.getCenter();
      onCenterChange(center.lat, center.lng);
    },
  });
  return null;
}

// Helper component to programmatically move the map
function MapController({ center, zoom }: { center: [number, number]; zoom?: number }) {
  const { useMap } = require("react-leaflet");
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, zoom || map.getZoom(), { animate: true });
    }
  }, [center, zoom, map]);
  return null;
}

type PickerView = "list" | "map" | "save";

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

  const [view, setView] = useState<PickerView>("list");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<GeoSearchResult[]>([]);
  const [searching, setSearching] = useState(false);

  // Map state
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number }>({
    lat: activeLocation.lat,
    lng: activeLocation.lng,
  });
  const [mapLocationName, setMapLocationName] = useState<string>("");
  const [mapFullAddress, setMapFullAddress] = useState<string>("");
  const [reverseGeocoding, setReverseGeocoding] = useState(false);
  const [mapMoveTarget, setMapMoveTarget] = useState<[number, number] | null>(null);
  const [isClient, setIsClient] = useState(false);

  // Save state
  const [savingLocation, setSavingLocation] = useState<{ lat: number; lng: number; name: string; fullAddress?: string } | null>(null);
  const [saveLabel, setSaveLabel] = useState("");
  const [saveIcon, setSaveIcon] = useState<"home" | "briefcase" | "map-pin">("map-pin");

  const searchInputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const reverseDebounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Reset state when picker closes, set map to active location when opening
  useEffect(() => {
    if (!isPickerOpen) {
      setView("list");
      setSearchQuery("");
      setSearchResults([]);
      setSavingLocation(null);
      setSaveLabel("");
      setSaveIcon("map-pin");
      setMapLocationName("");
      setMapFullAddress("");
      setMapMoveTarget(null);
    } else {
      setMapCenter({ lat: activeLocation.lat, lng: activeLocation.lng });
      setMapMoveTarget([activeLocation.lat, activeLocation.lng]);
    }
  }, [isPickerOpen]);

  // Debounced text search
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

  // Reverse geocode when map center changes
  const handleMapCenterChange = useCallback((lat: number, lng: number) => {
    setMapCenter({ lat, lng });
    setMapLocationName("");
    setMapFullAddress("");
    setReverseGeocoding(true);

    if (reverseDebounceRef.current) clearTimeout(reverseDebounceRef.current);
    reverseDebounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/geocode?lat=${lat}&lng=${lng}`);
        const data = await res.json();
        setMapLocationName(data.name || "ตำแหน่งที่เลือก");
        setMapFullAddress(data.fullAddress || "");
      } catch {
        setMapLocationName("ตำแหน่งที่เลือก");
        setMapFullAddress("");
      } finally {
        setReverseGeocoding(false);
      }
    }, 500);
  }, []);

  const handleUseMapLocation = () => {
    const name = mapFullAddress || mapLocationName || "ตำแหน่งที่เลือก";
    setActiveToCustom(mapCenter.lat, mapCenter.lng, name);
  };

  const handleSaveMapLocation = () => {
    setSavingLocation({
      lat: mapCenter.lat,
      lng: mapCenter.lng,
      name: mapLocationName || "ตำแหน่งที่เลือก",
      fullAddress: mapFullAddress,
    });
    setView("save");
    // Pre-select label
    const hasHome = savedAddresses.some((a) => a.label === "บ้าน");
    const hasWork = savedAddresses.some((a) => a.label === "ที่ทำงาน");
    if (!hasHome) { setSaveLabel("บ้าน"); setSaveIcon("home"); }
    else if (!hasWork) { setSaveLabel("ที่ทำงาน"); setSaveIcon("briefcase"); }
    else { setSaveLabel(""); setSaveIcon("map-pin"); }
  };

  const handleUseSearchResult = (result: GeoSearchResult) => {
    setActiveToCustom(result.lat, result.lng, result.name);
  };

  const handleSearchResultOnMap = (result: GeoSearchResult) => {
    setMapCenter({ lat: result.lat, lng: result.lng });
    setMapMoveTarget([result.lat, result.lng]);
    setMapLocationName(result.name);
    setMapFullAddress(result.fullAddress);
    setReverseGeocoding(false);
    setSearchQuery("");
    setSearchResults([]);
    setView("map");
  };

  const handleStartSaveFromSearch = (result: GeoSearchResult) => {
    setSavingLocation({
      lat: result.lat,
      lng: result.lng,
      name: result.name,
      fullAddress: result.fullAddress,
    });
    setView("save");
    const hasHome = savedAddresses.some((a) => a.label === "บ้าน");
    const hasWork = savedAddresses.some((a) => a.label === "ที่ทำงาน");
    if (!hasHome) { setSaveLabel("บ้าน"); setSaveIcon("home"); }
    else if (!hasWork) { setSaveLabel("ที่ทำงาน"); setSaveIcon("briefcase"); }
    else { setSaveLabel(""); setSaveIcon("map-pin"); }
  };

  const handleConfirmSave = () => {
    if (!savingLocation || !saveLabel.trim()) return;
    const success = addSavedAddress({
      label: saveLabel.trim(),
      name: savingLocation.name,
      fullAddress: savingLocation.fullAddress,
      lat: savingLocation.lat,
      lng: savingLocation.lng,
      icon: saveIcon,
    });
    if (success) {
      setSavingLocation(null);
      setView("list");
      setSearchQuery("");
      setSearchResults([]);
    }
  };

  const handleGpsOnMap = () => {
    requestGps();
    setMapCenter({ lat: gpsLocation.lat, lng: gpsLocation.lng });
    setMapMoveTarget([gpsLocation.lat, gpsLocation.lng]);
  };

  if (!isPickerOpen) return null;

  // ===== SAVE VIEW =====
  if (view === "save" && savingLocation) {
    return (
      <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center" onClick={closePicker}>
        <div
          className="w-full max-w-md rounded-t-3xl bg-white pb-8 sm:rounded-3xl sm:pb-5 max-h-[70vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="sticky top-0 bg-white rounded-t-3xl px-5 pt-4 pb-3 border-b border-gray-100">
            <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-gray-200 sm:hidden" />
            <div className="flex items-center justify-between">
              <button onClick={() => setView("list")} className="text-sm text-gray-500 hover:text-gray-700">
                ย้อนกลับ
              </button>
              <h3 className="text-base font-medium text-gray-900">บันทึกที่อยู่</h3>
              <div className="w-12" />
            </div>
          </div>

          <div className="px-5 pt-4 space-y-4">
            <div className="rounded-xl bg-gray-50 p-3">
              <p className="text-sm font-medium text-gray-900">{savingLocation.name}</p>
              {savingLocation.fullAddress && (
                <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{savingLocation.fullAddress}</p>
              )}
            </div>

            <div>
              <p className="text-sm text-gray-500 mb-2">เลือกป้ายกำกับ</p>
              <div className="flex gap-2 flex-wrap">
                {LABEL_PRESETS.map((preset) => {
                  const isUsed = savedAddresses.some((a) => a.label === preset.label);
                  const isSelected = saveLabel === preset.label;
                  const Icon = ICON_MAP[preset.icon];
                  return (
                    <button
                      key={preset.label}
                      onClick={() => { if (!isUsed) { setSaveLabel(preset.label); setSaveIcon(preset.icon); } }}
                      disabled={isUsed}
                      className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm border transition-colors ${
                        isSelected ? "border-gray-900 bg-gray-900 text-white"
                          : isUsed ? "border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed"
                          : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <Icon className="h-4 w-4" strokeWidth={1.5} />
                      {preset.label}
                    </button>
                  );
                })}
                <button
                  onClick={() => { setSaveLabel(""); setSaveIcon("map-pin"); }}
                  className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm border transition-colors ${
                    saveIcon === "map-pin" ? "border-gray-900 bg-gray-900 text-white"
                      : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <MapPin className="h-4 w-4" strokeWidth={1.5} />
                  อื่นๆ
                </button>
              </div>
            </div>

            {saveIcon === "map-pin" && (
              <input
                type="text"
                value={saveLabel}
                onChange={(e) => setSaveLabel(e.target.value)}
                placeholder="ชื่อสถานที่ เช่น คอนโด, ยิม..."
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm placeholder:text-gray-400 focus:border-gray-300 focus:outline-none"
                maxLength={20}
                autoFocus
              />
            )}

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

  // ===== MAP VIEW =====
  if (view === "map") {
    return (
      <div className="fixed inset-0 z-50 bg-white flex flex-col">
        {/* Leaflet CSS */}
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />

        {/* Top bar */}
        <div className="absolute top-0 left-0 right-0 z-[1000] bg-white/95 backdrop-blur-sm border-b border-gray-100 px-4 py-3 safe-area-top">
          <div className="flex items-center gap-3 max-w-md mx-auto">
            <button
              onClick={() => setView("list")}
              className="rounded-xl p-2 text-gray-600 hover:bg-gray-100 transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center"
            >
              <ChevronLeft className="h-5 w-5" strokeWidth={1.5} />
            </button>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {reverseGeocoding ? "กำลังค้นหา..." : mapLocationName || "เลื่อนแผนที่เพื่อเลือกตำแหน่ง"}
              </p>
              <p className="text-xs text-gray-400 mt-0.5 truncate">
                {reverseGeocoding ? "" : mapFullAddress || `${mapCenter.lat.toFixed(4)}, ${mapCenter.lng.toFixed(4)}`}
              </p>
            </div>
          </div>
        </div>

        {/* Map */}
        <div className="flex-1 relative">
          {isClient && (
            <MapContainer
              center={[mapCenter.lat, mapCenter.lng]}
              zoom={16}
              style={{ height: "100%", width: "100%" }}
              zoomControl={false}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <MapCenterTracker onCenterChange={handleMapCenterChange} />
              {mapMoveTarget && <MapController center={mapMoveTarget} zoom={16} />}
            </MapContainer>
          )}

          {/* Center pin (fixed in the middle of the map) */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-[1000]">
            <div className="flex flex-col items-center -mt-8">
              <MapPin className="h-10 w-10 text-gray-900 drop-shadow-lg" strokeWidth={1.5} fill="currentColor" />
              <div className="w-2 h-2 rounded-full bg-gray-900/30 mt-0.5" />
            </div>
          </div>

          {/* GPS button */}
          <button
            onClick={handleGpsOnMap}
            className="absolute bottom-28 right-4 z-[1000] bg-white rounded-full p-3 shadow-lg border border-gray-200 hover:bg-gray-50 transition-colors min-h-[48px] min-w-[48px] flex items-center justify-center"
            title="ตำแหน่งปัจจุบัน"
          >
            <Crosshair className="h-5 w-5 text-gray-700" strokeWidth={1.5} />
          </button>
        </div>

        {/* Bottom panel */}
        <div className="bg-white border-t border-gray-100 px-5 py-4 safe-area-bottom">
          <div className="max-w-md mx-auto space-y-3">
            <div className="flex items-center gap-3">
              <div className="rounded-xl p-2.5 bg-gray-100 text-gray-600 flex-shrink-0">
                <MapPin className="h-5 w-5" strokeWidth={1.5} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {reverseGeocoding ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-3.5 w-3.5 animate-spin" strokeWidth={1.5} />
                      กำลังค้นหาที่อยู่...
                    </span>
                  ) : (
                    mapLocationName || "เลื่อนแผนที่เพื่อเลือกตำแหน่ง"
                  )}
                </p>
                {!reverseGeocoding && mapFullAddress && (
                  <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{mapFullAddress}</p>
                )}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleSaveMapLocation}
                className="flex-1 rounded-2xl border border-gray-200 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
              >
                บันทึก
              </button>
              <button
                onClick={handleUseMapLocation}
                disabled={reverseGeocoding}
                className="flex-1 rounded-2xl bg-gray-900 py-3 text-sm font-medium text-white transition-colors hover:bg-gray-800 disabled:bg-gray-300"
              >
                ใช้ตำแหน่งนี้
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ===== LIST VIEW (default) =====
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
              <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2">
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
                  <div key={`${result.lat}-${result.lng}-${i}`} className="rounded-xl p-3 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" strokeWidth={1.5} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">{result.name}</p>
                        <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{result.fullAddress}</p>
                        <div className="flex gap-2 mt-2">
                          <button
                            onClick={() => handleUseSearchResult(result)}
                            className="text-xs font-medium text-gray-900 bg-gray-100 rounded-lg px-3 py-1.5 hover:bg-gray-200 transition-colors"
                          >
                            ใช้ตำแหน่งนี้
                          </button>
                          <button
                            onClick={() => handleSearchResultOnMap(result)}
                            className="text-xs font-medium text-gray-500 bg-white border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-50 transition-colors"
                          >
                            ดูบนแผนที่
                          </button>
                          <button
                            onClick={() => handleStartSaveFromSearch(result)}
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
              {/* Select on Map button */}
              <button
                onClick={() => setView("map")}
                className="flex w-full items-center gap-3 rounded-xl p-3 text-left transition-colors hover:bg-gray-50 mb-1"
              >
                <div className="rounded-xl p-2.5 bg-gray-100 text-gray-600">
                  <MapIcon className="h-5 w-5" strokeWidth={1.5} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">เลือกจากแผนที่</p>
                  <p className="text-xs text-gray-400 mt-0.5">แตะบนแผนที่เพื่อปักหมุด</p>
                </div>
                <ChevronLeft className="h-4 w-4 text-gray-300 rotate-180" strokeWidth={1.5} />
              </button>

              {/* Current Location */}
              <button
                onClick={() => { requestGps(); setActiveToGps(); }}
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

              {/* Saved Addresses */}
              <div className="mt-3">
                <div className="flex items-center justify-between mb-2 px-1">
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">สถานที่ที่บันทึก</p>
                </div>

                {savedAddresses.length === 0 ? (
                  <div className="rounded-xl bg-gray-50 p-4 text-center">
                    <p className="text-sm text-gray-400">ยังไม่มีสถานที่ที่บันทึก</p>
                    <p className="text-xs text-gray-300 mt-1">ค้นหาหรือเลือกจากแผนที่แล้วกด "บันทึก"</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {savedAddresses.map((addr) => {
                      const Icon = ICON_MAP[addr.icon];
                      const isActive = activeLocation.source === "saved" && activeLocation.savedAddressId === addr.id;
                      return (
                        <div
                          key={addr.id}
                          className={`flex items-center gap-3 rounded-xl p-3 transition-colors hover:bg-gray-50 ${isActive ? "bg-gray-50" : ""}`}
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

              {/* Active search location */}
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
