"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { Coupon, UserCoupon } from "@/types";

export function useCoupons() {
  const { user } = useAuth();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [userCoupons, setUserCoupons] = useState<UserCoupon[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load all active coupons and user's collected coupons
  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setIsLoading(true);
      try {
        // Fetch active coupons
        const { data: couponData } = await supabase
          .from("coupons")
          .select("*")
          .eq("is_active", true)
          .gte("valid_until", new Date().toISOString())
          .order("valid_until", { ascending: true });

        if (!cancelled && couponData) {
          setCoupons(couponData);
        }

        // Fetch user's collected coupons
        if (user) {
          const { data: userCouponData } = await supabase
            .from("user_coupons")
            .select("*, coupon:coupons(*)")
            .eq("user_id", user.id)
            .order("collected_at", { ascending: false });

          if (!cancelled && userCouponData) {
            setUserCoupons(
              userCouponData.map((uc: any) => ({
                ...uc,
                coupon: uc.coupon || undefined,
              }))
            );
          }
        } else {
          setUserCoupons([]);
        }
      } catch (err) {
        console.error("Error loading coupons:", err);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    load();
    return () => { cancelled = true; };
  }, [user]);

  const collectCoupon = useCallback(
    async (couponId: string): Promise<{ success: boolean; error?: string }> => {
      if (!user) {
        return { success: false, error: "กรุณาเข้าสู่ระบบก่อนเก็บคูปอง" };
      }

      // Check if already collected
      const alreadyCollected = userCoupons.some((uc) => uc.coupon_id === couponId);
      if (alreadyCollected) {
        return { success: false, error: "คุณเก็บคูปองนี้แล้ว" };
      }

      // Check coupon validity
      const coupon = coupons.find((c) => c.id === couponId);
      if (!coupon) {
        return { success: false, error: "ไม่พบคูปองนี้" };
      }
      if (coupon.usage_limit && coupon.usage_count >= coupon.usage_limit) {
        return { success: false, error: "คูปองนี้ถูกใช้หมดแล้ว" };
      }

      try {
        const { data, error } = await supabase
          .from("user_coupons")
          .insert({
            user_id: user.id,
            coupon_id: couponId,
          })
          .select("*, coupon:coupons(*)")
          .single();

        if (error) {
          if (error.code === "23505") {
            return { success: false, error: "คุณเก็บคูปองนี้แล้ว" };
          }
          throw error;
        }

        setUserCoupons((prev) => [
          { ...data, coupon: data.coupon || undefined },
          ...prev,
        ]);

        // Update usage count locally
        setCoupons((prev) =>
          prev.map((c) =>
            c.id === couponId ? { ...c, usage_count: c.usage_count + 1 } : c
          )
        );

        return { success: true };
      } catch (err) {
        console.error("Error collecting coupon:", err);
        return { success: false, error: "เกิดข้อผิดพลาด กรุณาลองใหม่" };
      }
    },
    [user, userCoupons, coupons]
  );

  const useCoupon = useCallback(
    async (
      userCouponId: string,
      reservationId?: string
    ): Promise<{ success: boolean; error?: string }> => {
      if (!user) {
        return { success: false, error: "กรุณาเข้าสู่ระบบ" };
      }

      try {
        const { error } = await supabase
          .from("user_coupons")
          .update({
            is_used: true,
            used_at: new Date().toISOString(),
            reservation_id: reservationId,
          })
          .eq("id", userCouponId)
          .eq("user_id", user.id);

        if (error) throw error;

        setUserCoupons((prev) =>
          prev.map((uc) =>
            uc.id === userCouponId
              ? { ...uc, is_used: true, used_at: new Date().toISOString(), reservation_id: reservationId }
              : uc
          )
        );

        return { success: true };
      } catch (err) {
        console.error("Error using coupon:", err);
        return { success: false, error: "เกิดข้อผิดพลาด กรุณาลองใหม่" };
      }
    },
    [user]
  );

  // Calculate discount for a given price
  const calculateDiscount = useCallback(
    (coupon: Coupon, price: number): number => {
      if (price < coupon.min_purchase) return 0;

      let discount = 0;
      if (coupon.discount_type === "percent") {
        discount = (price * coupon.discount_value) / 100;
        if (coupon.max_discount) {
          discount = Math.min(discount, coupon.max_discount);
        }
      } else {
        discount = coupon.discount_value;
      }

      return Math.min(discount, price);
    },
    []
  );

  const isCollected = useCallback(
    (couponId: string) => userCoupons.some((uc) => uc.coupon_id === couponId),
    [userCoupons]
  );

  // Available (collected but not used, not expired) coupons
  const availableCoupons = userCoupons.filter(
    (uc) =>
      !uc.is_used &&
      uc.coupon &&
      new Date(uc.coupon.valid_until) > new Date()
  );

  return {
    coupons,
    userCoupons,
    availableCoupons,
    isLoading,
    collectCoupon,
    useCoupon,
    calculateDiscount,
    isCollected,
  };
}
