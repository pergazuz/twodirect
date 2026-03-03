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

