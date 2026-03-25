"use client";

import { useEffect, useState } from "react";
import { BranchWithStock } from "@/types";
import { Map as MapIcon } from "lucide-react";
import dynamic from "next/dynamic";

// Dynamically import Leaflet components to avoid SSR issues
const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import("react-leaflet").then((mod) => mod.Popup),
  { ssr: false }
);

// Chain color mapping
const CHAIN_COLORS: Record<string, string> = {
  "7-eleven": "#00845E",
  "lotus": "#003DA5",
  "makro": "#ED1C24",
  "tops": "#E31837",
  "cj": "#FF6B00",
  "maxvalue": "#8B5CF6",
};

const CHAIN_LABELS: Record<string, string> = {
  "7-eleven": "7-11",
  "lotus": "Lotus's",
  "makro": "Makro",
  "tops": "Tops",
  "cj": "CJ",
  "maxvalue": "MaxV",
};

function createChainIcon(chain: string) {
  if (typeof window === "undefined") return undefined;
  const L = require("leaflet");
  const color = CHAIN_COLORS[chain] || "#6B7280";
  const label = CHAIN_LABELS[chain] || chain.substring(0, 4);

  return L.divIcon({
    className: "",
    html: `
      <div style="
        display: flex;
        flex-direction: column;
        align-items: center;
        transform: translate(-50%, -100%);
      ">
        <div style="
          background: ${color};
          color: white;
          font-size: 10px;
          font-weight: 700;
          padding: 4px 8px;
          border-radius: 8px;
          white-space: nowrap;
          box-shadow: 0 2px 8px rgba(0,0,0,0.25);
          border: 2px solid white;
        ">${label}</div>
        <div style="
          width: 0;
          height: 0;
          border-left: 6px solid transparent;
          border-right: 6px solid transparent;
          border-top: 8px solid ${color};
          margin-top: -1px;
        "></div>
      </div>
    `,
    iconSize: [60, 40],
    iconAnchor: [30, 40],
    popupAnchor: [0, -40],
  });
}

function createUserIcon() {
  if (typeof window === "undefined") return undefined;
  const L = require("leaflet");
  return L.divIcon({
    className: "",
    html: `
      <div style="
        display: flex;
        align-items: center;
        justify-content: center;
        transform: translate(-50%, -50%);
      ">
        <div style="
          width: 18px;
          height: 18px;
          background: #3B82F6;
          border-radius: 50%;
          border: 3px solid white;
          box-shadow: 0 2px 8px rgba(59,130,246,0.5);
        "></div>
        <div style="
          position: absolute;
          width: 36px;
          height: 36px;
          background: rgba(59,130,246,0.15);
          border-radius: 50%;
        "></div>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  });
}

interface MapViewProps {
  branches: BranchWithStock[];
  userLocation?: { lat: number; lng: number };
  onBranchClick?: (branch: BranchWithStock) => void;
  className?: string;
}

export function MapView({ branches, userLocation, onBranchClick, className }: MapViewProps) {
  const [isClient, setIsClient] = useState(false);
  const [icons, setIcons] = useState<Record<string, any>>({});
  const [userIcon, setUserIcon] = useState<any>(null);

  useEffect(() => {
    setIsClient(true);
    // Create icons on client side
    const chainSet = new Set(branches.map((b) => (b.branch as any).chain as string || "unknown"));
    const iconMap: Record<string, any> = {};
    for (const chain of chainSet) {
      iconMap[chain] = createChainIcon(chain);
    }
    setIcons(iconMap);
    setUserIcon(createUserIcon());
  }, [branches]);

  // Deduplicate branches by branch ID
  const uniqueBranches = branches.reduce((acc, b) => {
    if (!acc.find((existing) => existing.branch.id === b.branch.id)) {
      acc.push(b);
    }
    return acc;
  }, [] as BranchWithStock[]);

  if (!isClient) {
    return (
      <div className={`flex items-center justify-center bg-gray-50 min-h-[250px] sm:min-h-[300px] md:min-h-[400px] rounded-2xl ${className || ""}`}>
        <div className="text-center">
          <div className="animate-pulse mb-3">
            <MapIcon className="h-10 w-10 text-gray-300 mx-auto" strokeWidth={1.5} />
          </div>
          <p className="text-gray-400 text-sm">กำลังโหลดแผนที่...</p>
        </div>
      </div>
    );
  }

  const center = userLocation || { lat: 13.7563, lng: 100.5018 };

  // Build legend from unique chains present
  const chainsPresent = [...new Set(uniqueBranches.map((b) => (b.branch as any).chain as string || "unknown"))];

  return (
    <div className={`w-full ${className || ""}`}>
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
      />
      {/* Legend */}
      <div className="flex flex-wrap items-center gap-3 mb-3 px-1">
        {userLocation && (
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-blue-500 border-2 border-white shadow" />
            <span className="text-xs text-gray-500">ตำแหน่งคุณ</span>
          </div>
        )}
        {chainsPresent.map((chain) => (
          <div key={chain} className="flex items-center gap-1.5">
            <div
              className="w-3 h-3 rounded-sm"
              style={{ backgroundColor: CHAIN_COLORS[chain] || "#6B7280" }}
            />
            <span className="text-xs text-gray-500">{CHAIN_LABELS[chain] || chain}</span>
          </div>
        ))}
      </div>
      <div className="min-h-[250px] sm:min-h-[300px] md:min-h-[400px] lg:min-h-[500px] rounded-2xl overflow-hidden">
        <MapContainer
          center={[center.lat, center.lng]}
          zoom={13}
          style={{ height: "100%", width: "100%", minHeight: "inherit" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {/* User location marker */}
          {userLocation && userIcon && (
            <Marker
              position={[userLocation.lat, userLocation.lng]}
              icon={userIcon}
            >
              <Popup>
                <div className="p-1">
                  <h3 className="font-semibold text-sm">ตำแหน่งของคุณ</h3>
                </div>
              </Popup>
            </Marker>
          )}
          {/* Branch markers */}
          {uniqueBranches.map((b) => {
            const chain = (b.branch as any).chain as string || "unknown";
            return (
              <Marker
                key={b.branch.id}
                position={[b.branch.latitude, b.branch.longitude]}
                icon={icons[chain]}
                eventHandlers={{
                  click: () => onBranchClick?.(b),
                }}
              >
                <Popup>
                  <div className="p-1 min-w-[150px] sm:min-w-[200px]">
                    <h3 className="font-semibold text-sm sm:text-base">{b.branch.name_th}</h3>
                    <p className="text-xs sm:text-sm text-gray-600 mt-0.5">{b.branch.address_th}</p>
                    <p className="text-xs sm:text-sm mt-1">ระยะทาง: {b.distance_km} km</p>
                    {b.branch.phone && (
                      <p className="text-xs sm:text-sm mt-0.5">
                        โทร: <a href={`tel:${b.branch.phone}`} className="text-blue-600 underline">{b.branch.phone}</a>
                      </p>
                    )}
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>
    </div>
  );
}
