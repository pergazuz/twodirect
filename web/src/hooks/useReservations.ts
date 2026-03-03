"use client";

import { useState, useEffect, useCallback } from "react";

export type ReservationStatus = "pending" | "completed" | "expired" | "cancelled";

export interface Reservation {
  id: string;
  code: string;
  productId: string;
  productName: string;
  productNameTh: string;
  productPrice: number;
  productImage?: string;
  branchId: string;
  branchName: string;
  branchNameTh: string;
  branchAddress: string;
  branchLat: number;
  branchLng: number;
  quantity: number;
  status: ReservationStatus;
  createdAt: string;
  pickupDeadline: string;
  completedAt?: string;
  cancelledAt?: string;
}

const STORAGE_KEY = "twodirect_reservations";

function generateReservationCode(): string {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `TD${timestamp}${random}`;
}

export function useReservations() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load reservations from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          const parsed = JSON.parse(stored) as Reservation[];
          // Update expired reservations
          const updated = parsed.map((r) => {
            if (r.status === "pending" && new Date(r.pickupDeadline) < new Date()) {
              return { ...r, status: "expired" as ReservationStatus };
            }
            return r;
          });
          setReservations(updated);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        } catch {
          setReservations([]);
        }
      }
      setIsLoaded(true);
    }
  }, []);

  // Save to localStorage whenever reservations change
  const saveReservations = useCallback((newReservations: Reservation[]) => {
    setReservations(newReservations);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newReservations));
    }
  }, []);

  const addReservation = useCallback(
    (data: {
      productId: string;
      productName: string;
      productNameTh: string;
      productPrice: number;
      productImage?: string;
      branchId: string;
      branchName: string;
      branchNameTh: string;
      branchAddress: string;
      branchLat: number;
      branchLng: number;
      quantity: number;
      pickupHours: number;
    }): Reservation => {
      const now = new Date();
      const deadline = new Date(now.getTime() + data.pickupHours * 60 * 60 * 1000);

      const reservation: Reservation = {
        id: `res_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        code: generateReservationCode(),
        ...data,
        status: "pending",
        createdAt: now.toISOString(),
        pickupDeadline: deadline.toISOString(),
      };

      saveReservations([reservation, ...reservations]);
      return reservation;
    },
    [reservations, saveReservations]
  );

  const updateStatus = useCallback(
    (id: string, status: ReservationStatus) => {
      const updated = reservations.map((r) => {
        if (r.id === id) {
          return {
            ...r,
            status,
            ...(status === "completed" ? { completedAt: new Date().toISOString() } : {}),
            ...(status === "cancelled" ? { cancelledAt: new Date().toISOString() } : {}),
          };
        }
        return r;
      });
      saveReservations(updated);
    },
    [reservations, saveReservations]
  );

  const cancelReservation = useCallback(
    (id: string) => {
      updateStatus(id, "cancelled");
    },
    [updateStatus]
  );

  const completeReservation = useCallback(
    (id: string) => {
      updateStatus(id, "completed");
    },
    [updateStatus]
  );

  const pendingReservations = reservations.filter((r) => r.status === "pending");
  const pendingCount = pendingReservations.length;

  return {
    reservations,
    pendingReservations,
    pendingCount,
    isLoaded,
    addReservation,
    cancelReservation,
    completeReservation,
    updateStatus,
  };
}

