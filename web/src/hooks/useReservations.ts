"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

export type ReservationStatus = "pending" | "completed" | "expired" | "cancelled";
export type PaymentMethod = "credit_card" | "promptpay" | "mobile_banking";

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
  branchChain?: string;
  branchLat?: number;
  branchLng?: number;
  quantity?: number;
  status: ReservationStatus;
  paymentMethod?: PaymentMethod;
  paymentDetails?: string;
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

// Convert DB record to Reservation
function dbToReservation(record: any): Reservation {
  return {
    id: record.id,
    code: record.reservation_code,
    productId: record.product_id,
    productName: record.product_name,
    productNameTh: record.product_name_th,
    productPrice: record.product_price,
    productImage: record.product_image_url,
    branchId: record.branch_id,
    branchName: record.branch_name,
    branchNameTh: record.branch_name_th,
    branchAddress: record.branch_address_th,
    branchChain: record.branch_chain,
    status: record.status,
    paymentMethod: record.payment_method,
    paymentDetails: record.payment_details,
    createdAt: record.created_at,
    pickupDeadline: record.pickup_deadline,
    completedAt: record.completed_at,
    cancelledAt: record.cancelled_at,
  };
}

export function useReservations() {
  const { user, isLoading: authLoading } = useAuth();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load reservations from Supabase (if logged in) or localStorage
  useEffect(() => {
    // Wait for auth to finish loading before deciding where to load from
    if (authLoading) {
      return;
    }

    let isCancelled = false;

    const loadReservations = async () => {
      try {
        if (user) {
          // Load from Supabase
          const { data, error } = await supabase
            .from("reservations")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false });

          if (error) throw error;

          if (!isCancelled && data) {
            // Update expired reservations in DB
            const now = new Date();
            const updated = data.map(dbToReservation).map((r) => {
              if (r.status === "pending" && new Date(r.pickupDeadline) < now) {
                // Update in DB
                supabase.from("reservations").update({ status: "expired" }).eq("id", r.id);
                return { ...r, status: "expired" as ReservationStatus };
              }
              return r;
            });
            setReservations(updated);
          }
        } else if (typeof window !== "undefined") {
          // Not logged in - load from localStorage
          const stored = localStorage.getItem(STORAGE_KEY);
          if (stored) {
            try {
              const parsed = JSON.parse(stored) as Reservation[];
              const updated = parsed.map((r) => {
                if (r.status === "pending" && new Date(r.pickupDeadline) < new Date()) {
                  return { ...r, status: "expired" as ReservationStatus };
                }
                return r;
              });
              if (!isCancelled) {
                setReservations(updated);
                localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
              }
            } catch {
              if (!isCancelled) setReservations([]);
            }
          }
        }
      } catch (error) {
        console.error("Error loading reservations:", error);
      } finally {
        if (!isCancelled) {
          setIsLoaded(true);
        }
      }
    };

    loadReservations();

    return () => {
      isCancelled = true;
    };
  }, [user, authLoading]);

  // Save to localStorage (for non-logged-in users)
  const saveToLocalStorage = useCallback((newReservations: Reservation[]) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newReservations));
    }
  }, []);

  const addReservation = useCallback(
    async (data: {
      productId: string;
      productName: string;
      productNameTh: string;
      productPrice: number;
      productImage?: string;
      branchId: string;
      branchName: string;
      branchNameTh: string;
      branchAddress: string;
      branchChain?: string;
      branchLat?: number;
      branchLng?: number;
      quantity?: number;
      pickupHours: number;
      paymentMethod?: PaymentMethod;
      paymentDetails?: string;
    }): Promise<Reservation> => {
      // Require login to make reservations
      if (!user) {
        throw new Error("กรุณาเข้าสู่ระบบก่อนทำการจอง");
      }

      const now = new Date();
      const deadline = new Date(now.getTime() + data.pickupHours * 60 * 60 * 1000);
      const code = generateReservationCode();

      // Save to Supabase
      const { data: record, error } = await supabase
        .from("reservations")
        .insert({
          user_id: user.id,
            product_id: data.productId,
            product_name: data.productName,
            product_name_th: data.productNameTh,
            product_price: data.productPrice,
            product_image_url: data.productImage,
            branch_id: data.branchId,
            branch_name: data.branchName,
            branch_name_th: data.branchNameTh,
            branch_address_th: data.branchAddress,
            branch_chain: data.branchChain,
            status: "pending",
            reservation_code: code,
            pickup_deadline: deadline.toISOString(),
            payment_method: data.paymentMethod,
            payment_details: data.paymentDetails,
          })
          .select()
          .single();

      if (error) throw error;

      const reservation = dbToReservation(record);
      setReservations([reservation, ...reservations]);
      return reservation;
    },
    [user, reservations]
  );

  const updateStatus = useCallback(
    async (id: string, status: ReservationStatus) => {
      if (user) {
        // Update in Supabase
        await supabase
          .from("reservations")
          .update({ status, updated_at: new Date().toISOString() })
          .eq("id", id);
      }

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
      setReservations(updated);
      if (!user) saveToLocalStorage(updated);
    },
    [user, reservations, saveToLocalStorage]
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

