"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { SavedAddress, ActiveLocation } from "@/types";
import { useGeolocation } from "@/hooks/useGeolocation";

const SAVED_ADDRESSES_KEY = "twodirect_saved_addresses";
const ACTIVE_LOCATION_KEY = "twodirect_active_location";
const MAX_SAVED_ADDRESSES = 10;

interface LocationContextType {
  activeLocation: ActiveLocation;
  gpsLocation: { lat: number; lng: number; name: string };
  gpsLoading: boolean;
  gpsError: string | null;
  permissionDenied: boolean;
  savedAddresses: SavedAddress[];
  isPickerOpen: boolean;
  openPicker: () => void;
  closePicker: () => void;
  setActiveToGps: () => void;
  setActiveToSaved: (id: string) => void;
  setActiveToCustom: (lat: number, lng: number, name: string) => void;
  addSavedAddress: (address: Omit<SavedAddress, "id">) => boolean;
  removeSavedAddress: (id: string) => void;
  requestGps: () => void;
}

const DEFAULT_ACTIVE: ActiveLocation = {
  lat: 13.7563,
  lng: 100.5018,
  name: "กรุงเทพมหานคร",
  source: "gps",
};

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export function LocationProvider({ children }: { children: ReactNode }) {
  const { location: gpsLocation, loading: gpsLoading, error: gpsError, permissionDenied, requestLocation } = useGeolocation();

  const [activeLocation, setActiveLocation] = useState<ActiveLocation>(DEFAULT_ACTIVE);
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [initialized, setInitialized] = useState(false);

  // Load saved data from localStorage on mount
  useEffect(() => {
    try {
      const savedAddr = localStorage.getItem(SAVED_ADDRESSES_KEY);
      if (savedAddr) {
        setSavedAddresses(JSON.parse(savedAddr));
      }

      const savedActive = localStorage.getItem(ACTIVE_LOCATION_KEY);
      if (savedActive) {
        setActiveLocation(JSON.parse(savedActive));
      }
    } catch {
      // ignore parse errors
    }
    setInitialized(true);
  }, []);

  // When GPS resolves and user hasn't picked a saved/search location, update active
  useEffect(() => {
    if (!gpsLoading && initialized) {
      const savedActive = localStorage.getItem(ACTIVE_LOCATION_KEY);
      if (!savedActive) {
        // No saved preference — use GPS
        const loc: ActiveLocation = {
          lat: gpsLocation.lat,
          lng: gpsLocation.lng,
          name: gpsLocation.name,
          source: "gps",
        };
        setActiveLocation(loc);
      }
    }
  }, [gpsLoading, gpsLocation, initialized]);

  // Persist saved addresses
  useEffect(() => {
    if (initialized) {
      localStorage.setItem(SAVED_ADDRESSES_KEY, JSON.stringify(savedAddresses));
    }
  }, [savedAddresses, initialized]);

  // Persist active location
  useEffect(() => {
    if (initialized) {
      localStorage.setItem(ACTIVE_LOCATION_KEY, JSON.stringify(activeLocation));
    }
  }, [activeLocation, initialized]);

  const openPicker = useCallback(() => setIsPickerOpen(true), []);
  const closePicker = useCallback(() => setIsPickerOpen(false), []);

  const setActiveToGps = useCallback(() => {
    requestLocation();
    const loc: ActiveLocation = {
      lat: gpsLocation.lat,
      lng: gpsLocation.lng,
      name: gpsLocation.name,
      source: "gps",
    };
    setActiveLocation(loc);
    setIsPickerOpen(false);
  }, [gpsLocation, requestLocation]);

  const setActiveToSaved = useCallback((id: string) => {
    const addr = savedAddresses.find((a) => a.id === id);
    if (addr) {
      setActiveLocation({
        lat: addr.lat,
        lng: addr.lng,
        name: addr.name,
        source: "saved",
        savedAddressId: id,
      });
      setIsPickerOpen(false);
    }
  }, [savedAddresses]);

  const setActiveToCustom = useCallback((lat: number, lng: number, name: string) => {
    setActiveLocation({ lat, lng, name, source: "search" });
    setIsPickerOpen(false);
  }, []);

  const addSavedAddress = useCallback((address: Omit<SavedAddress, "id">): boolean => {
    if (savedAddresses.length >= MAX_SAVED_ADDRESSES) {
      return false;
    }
    // Check for duplicate (within ~100m)
    const isDuplicate = savedAddresses.some(
      (a) => Math.abs(a.lat - address.lat) < 0.001 && Math.abs(a.lng - address.lng) < 0.001
    );
    if (isDuplicate) return false;

    const newAddress: SavedAddress = {
      ...address,
      id: crypto.randomUUID(),
    };
    setSavedAddresses((prev) => [...prev, newAddress]);
    return true;
  }, [savedAddresses]);

  const removeSavedAddress = useCallback((id: string) => {
    setSavedAddresses((prev) => prev.filter((a) => a.id !== id));
    // If removing the active saved address, switch to GPS
    setActiveLocation((prev) => {
      if (prev.savedAddressId === id) {
        return {
          lat: gpsLocation.lat,
          lng: gpsLocation.lng,
          name: gpsLocation.name,
          source: "gps",
        };
      }
      return prev;
    });
  }, [gpsLocation]);

  return (
    <LocationContext.Provider
      value={{
        activeLocation,
        gpsLocation,
        gpsLoading,
        gpsError,
        permissionDenied,
        savedAddresses,
        isPickerOpen,
        openPicker,
        closePicker,
        setActiveToGps,
        setActiveToSaved,
        setActiveToCustom,
        addSavedAddress,
        removeSavedAddress,
        requestGps: requestLocation,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error("useLocation must be used within a LocationProvider");
  }
  return context;
}
