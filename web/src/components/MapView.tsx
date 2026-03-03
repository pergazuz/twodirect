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

interface MapViewProps {
  branches: BranchWithStock[];
  userLocation?: { lat: number; lng: number };
  onBranchClick?: (branch: BranchWithStock) => void;
  className?: string;
}

export function MapView({ branches, userLocation, onBranchClick, className }: MapViewProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

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

  return (
    <div className={`w-full min-h-[250px] sm:min-h-[300px] md:min-h-[400px] lg:min-h-[500px] ${className || ""}`}>
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
      />
      <MapContainer
        center={[center.lat, center.lng]}
        zoom={13}
        style={{ height: "100%", width: "100%", minHeight: "inherit" }}
        className="rounded-lg sm:rounded-xl"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {branches.map((b) => (
          <Marker
            key={b.branch.id}
            position={[b.branch.latitude, b.branch.longitude]}
            eventHandlers={{
              click: () => onBranchClick?.(b),
            }}
          >
            <Popup>
              <div className="p-1 min-w-[150px] sm:min-w-[200px]">
                <h3 className="font-semibold text-sm sm:text-base">{b.branch.name_th}</h3>
                <p className="text-xs sm:text-sm text-gray-600 mt-0.5">{b.branch.address_th}</p>
                <p className="mt-1.5 text-xs sm:text-sm">
                  สต็อก: <span className="font-medium text-green-600">{b.quantity}</span> ชิ้น
                </p>
                <p className="text-xs sm:text-sm">ระยะทาง: {b.distance_km} km</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}

