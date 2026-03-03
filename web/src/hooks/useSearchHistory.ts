"use client";

import { supabase } from "@/lib/supabase";

export async function saveSearchHistory(
  userId: string | undefined,
  query: string,
  storeFilter?: string,
  category?: string
) {
  // Only save if user is logged in and query is not empty
  if (!userId || !query.trim()) return;

  try {
    await supabase.from("search_history").insert({
      user_id: userId,
      query: query.trim(),
      store_filter: storeFilter || null,
      category: category || null,
    });
  } catch (error) {
    console.error("Error saving search history:", error);
  }
}

export async function getSearchHistory(userId: string, limit = 10) {
  if (!userId) return [];

  try {
    const { data, error } = await supabase
      .from("search_history")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching search history:", error);
    return [];
  }
}

export async function clearSearchHistory(userId: string) {
  if (!userId) return;

  try {
    await supabase.from("search_history").delete().eq("user_id", userId);
  } catch (error) {
    console.error("Error clearing search history:", error);
  }
}

