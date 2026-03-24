export interface Product {
  id: string;
  name: string;
  name_th: string;
  description?: string;
  category: string;
  image_url?: string;
  price: number;
  tags?: string[];
}

export interface StorePrice {
  store_id: string;
  store_name: string;
  store_name_th: string;
  price: number;
  unit?: string;
  in_stock: boolean;
  branch_count: number;
  logo_url?: string;
}

export interface Branch {
  id: string;
  name: string;
  name_th: string;
  address: string;
  address_th: string;
  latitude: number;
  longitude: number;
  opening_hours: string;
  phone?: string;
}

export interface Promotion {
  id: string;
  product_id?: string;
  title: string;
  title_th: string;
  description?: string;
  discount_percent?: number;
  discount_amount?: number;
  valid_until?: string;
  is_twodirect_exclusive: boolean;
}

export interface BranchWithStock {
  branch: Branch;
  quantity: number;
  distance_km: number;
  promotions: Promotion[];
}

export interface SearchResult {
  product: Product;
  branches: BranchWithStock[];
}

export interface SavedAddress {
  id: string;
  label: string;
  name: string;
  fullAddress?: string;
  lat: number;
  lng: number;
  icon: "home" | "briefcase" | "map-pin";
}

export interface ActiveLocation {
  lat: number;
  lng: number;
  name: string;
  source: "gps" | "saved" | "search";
  savedAddressId?: string;
}

export interface Coupon {
  id: string;
  code: string;
  title: string;
  title_th: string;
  description?: string;
  description_th?: string;
  discount_type: "percent" | "fixed";
  discount_value: number;
  min_purchase: number;
  max_discount?: number;
  usage_limit?: number;
  usage_count: number;
  per_user_limit: number;
  valid_from: string;
  valid_until: string;
  is_active: boolean;
  category?: string;
  image_url?: string;
}

export interface UserCoupon {
  id: string;
  user_id: string;
  coupon_id: string;
  is_used: boolean;
  used_at?: string;
  reservation_id?: string;
  collected_at: string;
  coupon?: Coupon;
}

