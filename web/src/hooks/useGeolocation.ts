"use client";

import { useState, useEffect, useCallback } from "react";

interface Location {
  lat: number;
  lng: number;
  name: string;
}

interface GeolocationState {
  location: Location;
  loading: boolean;
  error: string | null;
  permissionDenied: boolean;
}

const DEFAULT_LOCATION: Location = {
  lat: 13.7563,
  lng: 100.5018,
  name: "กรุงเทพมหานคร",
};

export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({
    location: DEFAULT_LOCATION,
    loading: true,
    error: null,
    permissionDenied: false,
  });

  const getLocationName = useCallback(async (lat: number, lng: number): Promise<string> => {
    // Round coordinates to reduce cache variations (about 100m accuracy)
    const cacheKey = `geo_${lat.toFixed(3)}_${lng.toFixed(3)}`;

    // Check localStorage cache first
    if (typeof window !== "undefined") {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        return cached;
      }
    }

    try {
      // Use our API route for location lookup
      const response = await fetch(`/api/geocode?lat=${lat}&lng=${lng}`);

      if (!response.ok) return "ตำแหน่งปัจจุบัน";

      const data = await response.json();
      const name = data.name || "ตำแหน่งปัจจุบัน";

      // Cache the result in localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem(cacheKey, name);
      }

      return name;
    } catch {
      return "ตำแหน่งปัจจุบัน";
    }
  }, []);

  const requestLocation = useCallback(async () => {
    if (!navigator.geolocation) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: "เบราว์เซอร์ไม่รองรับการระบุตำแหน่ง",
      }));
      return;
    }

    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000, // Cache for 5 minutes
        });
      });

      const { latitude: lat, longitude: lng } = position.coords;
      const name = await getLocationName(lat, lng);

      setState({
        location: { lat, lng, name },
        loading: false,
        error: null,
        permissionDenied: false,
      });
    } catch (err) {
      const geoError = err as GeolocationPositionError;
      let error = "ไม่สามารถระบุตำแหน่งได้";
      let permissionDenied = false;

      if (geoError.code === geoError.PERMISSION_DENIED) {
        error = "กรุณาอนุญาตการเข้าถึงตำแหน่ง";
        permissionDenied = true;
      } else if (geoError.code === geoError.TIMEOUT) {
        error = "หมดเวลาในการระบุตำแหน่ง";
      }

      setState((prev) => ({
        ...prev,
        loading: false,
        error,
        permissionDenied,
      }));
    }
  }, [getLocationName]);

  // Request location on mount
  useEffect(() => {
    requestLocation();
  }, [requestLocation]);

  return {
    ...state,
    requestLocation,
    isDefault: state.location.lat === DEFAULT_LOCATION.lat && state.location.lng === DEFAULT_LOCATION.lng,
  };
}

