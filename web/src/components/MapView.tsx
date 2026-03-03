"use client";

import { useEffect, useState } from "react";
import { BranchWithStock } from "@/types";
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
}

export function MapView({ branches, userLocation, onBranchClick }: MapViewProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className="flex h-full items-center justify-center bg-gray-100">
        <p className="text-gray-500">กำลังโหลดแผนที่...</p>
      </div>
    );
  }

  const center = userLocation || { lat: 13.7563, lng: 100.5018 };

  return (
    <div className="h-full w-full">
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
      />
      <MapContainer
        center={[center.lat, center.lng]}
        zoom={13}
        style={{ height: "100%", width: "100%" }}
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
              <div className="p-1">
                <h3 className="font-semibold">{b.branch.name_th}</h3>
                <p className="text-sm text-gray-600">{b.branch.address_th}</p>
                <p className="mt-1 text-sm">
                  สต็อก: <span className="font-medium text-green-600">{b.quantity}</span> ชิ้น
                </p>
                <p className="text-sm">ระยะทาง: {b.distance_km} km</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}

