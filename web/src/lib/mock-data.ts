import { Product, Promotion, BranchWithStock, SearchResult } from "@/types";

// Extended Branch type with chain
export interface BranchWithChain {
  id: string;
  name: string;
  name_th: string;
  address: string;
  address_th: string;
  latitude: number;
  longitude: number;
  opening_hours: string;
  phone: string;
  chain: string;
}

const STORAGE_URL = "https://ncjszzjzluhbqavalnty.supabase.co/storage/v1/object/public/products";

export const mockProducts: Product[] = [
  { id: "1", name: "Coke Zero 500ml", name_th: "โค้ก ซีโร่ 500ml", category: "beverages", price: 25, image_url: `${STORAGE_URL}/coke-zero.jpg`, tags: ["โปรโมชั่น", "ซื้อ 1 แถม 1"] },
  { id: "2", name: "Lay's Original 75g", name_th: "เลย์ รสดั้งเดิม 75g", category: "snacks", price: 35, image_url: `${STORAGE_URL}/lays.jpg`, tags: ["โปรโมชั่น", "flash sale"] },
  { id: "3", name: "Mama Shrimp Tom Yum", name_th: "มาม่า รสต้มยำกุ้ง", category: "instant-food", price: 8, image_url: `${STORAGE_URL}/mama.jpg`, tags: ["โปรโมชั่น"] },
  { id: "4", name: "All Cafe Latte", name_th: "ออลคาเฟ่ ลาเต้", category: "beverages", price: 45, image_url: `${STORAGE_URL}/allcafe.jpg`, tags: ["flash sale"] },
  { id: "5", name: "Chicken Rice", name_th: "ข้าวมันไก่", category: "ready-meals", price: 59, image_url: `${STORAGE_URL}/chicken-rice.jpg`, tags: ["โปรโมชั่น"] },
  { id: "6", name: "Onigiri Salmon", name_th: "โอนิกิริ แซลมอน", category: "ready-meals", price: 39, image_url: `${STORAGE_URL}/onigiri.jpg`, tags: ["ซื้อ 1 แถม 1"] },
  { id: "7", name: "Meiji Milk 450ml", name_th: "เมจิ นมสด 450ml", category: "dairy", price: 32, image_url: `${STORAGE_URL}/meiji-milk.jpg`, tags: ["โปรโมชั่น", "flash sale"] },
  { id: "8", name: "Red Bull 250ml", name_th: "กระทิงแดง 250ml", category: "beverages", price: 15, image_url: `${STORAGE_URL}/redbull.jpg`, tags: ["ซื้อ 1 แถม 1"] },
];

export const mockBranches: BranchWithChain[] = [
  // 7-Eleven branches
  { id: "b1", name: "7-Eleven Silom Soi 4", name_th: "7-Eleven สีลม ซอย 4", address: "Silom Soi 4, Bangrak", address_th: "สีลม ซอย 4 บางรัก", latitude: 13.7262, longitude: 100.5318, opening_hours: "24 ชั่วโมง", phone: "02-234-5678", chain: "7-eleven" },
  { id: "b8", name: "7-Eleven Ekkamai", name_th: "7-Eleven เอกมัย", address: "Ekkamai Soi 5", address_th: "เอกมัย ซอย 5", latitude: 13.7230, longitude: 100.5850, opening_hours: "24 ชั่วโมง", phone: "02-391-7777", chain: "7-eleven" },
  { id: "b9", name: "7-Eleven Rat Burana", name_th: "7-Eleven ราษฎร์บูรณะ", address: "Rat Burana Road", address_th: "ถนนราษฎร์บูรณะ", latitude: 13.6795, longitude: 100.5015, opening_hours: "24 ชั่วโมง", phone: "02-427-1111", chain: "7-eleven" },
  { id: "b10", name: "7-Eleven Suksawat 30", name_th: "7-Eleven สุขสวัสดิ์ 30", address: "Suksawat Road Soi 30", address_th: "สุขสวัสดิ์ ซอย 30", latitude: 13.6720, longitude: 100.5085, opening_hours: "24 ชั่วโมง", phone: "02-427-2222", chain: "7-eleven" },
  { id: "b11", name: "7-Eleven Pracha Uthit", name_th: "7-Eleven ประชาอุทิศ", address: "Pracha Uthit Road", address_th: "ถนนประชาอุทิศ", latitude: 13.6850, longitude: 100.5120, opening_hours: "24 ชั่วโมง", phone: "02-427-3333", chain: "7-eleven" },
  { id: "b12", name: "7-Eleven Rama 2 Soi 33", name_th: "7-Eleven พระราม 2 ซอย 33", address: "Rama 2 Road Soi 33", address_th: "พระราม 2 ซอย 33", latitude: 13.6680, longitude: 100.4950, opening_hours: "24 ชั่วโมง", phone: "02-427-4444", chain: "7-eleven" },
  // Lotus's branches
  { id: "b2", name: "Lotus's Siam Square", name_th: "โลตัส สยามสแควร์", address: "Siam Square Soi 3", address_th: "สยามสแควร์ ซอย 3", latitude: 13.7450, longitude: 100.5341, opening_hours: "08:00-22:00", phone: "02-251-1234", chain: "lotus" },
  { id: "b5", name: "Lotus's Chatuchak", name_th: "โลตัส จตุจักร", address: "Phahonyothin Road", address_th: "ถนนพหลโยธิน", latitude: 13.7990, longitude: 100.5500, opening_hours: "08:00-22:00", phone: "02-272-1111", chain: "lotus" },
  // Makro branches
  { id: "b3", name: "Makro Sukhumvit", name_th: "แม็คโคร สุขุมวิท", address: "Sukhumvit Soi 21 (Asoke)", address_th: "สุขุมวิท ซอย 21 อโศก", latitude: 13.7380, longitude: 100.5610, opening_hours: "06:00-22:00", phone: "02-259-9876", chain: "makro" },
  { id: "b6", name: "Makro Ratchada", name_th: "แม็คโคร รัชดา", address: "Ratchadaphisek Soi 3", address_th: "รัชดาภิเษก ซอย 3", latitude: 13.7610, longitude: 100.5740, opening_hours: "06:00-22:00", phone: "02-276-3333", chain: "makro" },
  // Tops branches
  { id: "b4", name: "Tops Thonglor", name_th: "ท็อปส์ ทองหล่อ", address: "Thonglor Soi 10", address_th: "ทองหล่อ ซอย 10", latitude: 13.7320, longitude: 100.5780, opening_hours: "08:00-23:00", phone: "02-381-5555", chain: "tops" },
  { id: "b7", name: "Tops Ari", name_th: "ท็อปส์ อารีย์", address: "Phahonyothin Soi 7", address_th: "พหลโยธิน ซอย 7", latitude: 13.7790, longitude: 100.5440, opening_hours: "08:00-23:00", phone: "02-279-8888", chain: "tops" },
];

export const mockPromotions: Promotion[] = [
  { id: "p1", title: "10% off via twodirect", title_th: "ลด 10% ผ่าน twodirect", discount_percent: 10, is_twodirect_exclusive: true },
  { id: "p2", product_id: "1", title: "Buy 2 Get 1 Free", title_th: "ซื้อ 2 แถม 1", is_twodirect_exclusive: false },
  { id: "p3", product_id: "4", title: "All Cafe 15% off", title_th: "ออลคาเฟ่ ลด 15%", discount_percent: 15, is_twodirect_exclusive: true },
];

// Mock inventory data
const mockInventory: Record<string, Record<string, number>> = {
  "1": { b1: 15, b2: 20, b3: 0, b6: 12, b8: 8, b9: 25, b10: 18, b11: 22, b12: 30 },
  "2": { b1: 8, b3: 10, b6: 15, b9: 18, b11: 14, b12: 20 },
  "3": { b1: 25, b5: 50, b8: 20, b9: 40, b10: 30, b11: 35, b12: 45 },
  "4": { b1: 10, b2: 15, b5: 8, b7: 20, b9: 15, b10: 12, b11: 18, b12: 20 },
  "5": { b1: 5, b3: 7, b6: 3, b8: 4, b9: 12, b10: 8, b12: 15 },
  "6": { b2: 12, b4: 18, b7: 7, b9: 8, b11: 10, b12: 12 },
  "7": { b2: 8, b4: 12, b7: 15, b9: 20, b10: 15, b11: 25, b12: 18 },
  "8": { b3: 30, b5: 25, b8: 18, b9: 35, b11: 28, b12: 40 },
};

export function searchMockProducts(
  query: string,
  userLat: number,
  userLng: number,
  radiusKm: number = 20,
  storeChain?: string
): SearchResult[] {
  const queryLower = query.toLowerCase();
  const results: SearchResult[] = [];

  for (const product of mockProducts) {
    // If no query, include all products (for store browsing)
    // Also match against tags for promotions
    const matchesQuery = !query ||
      product.name.toLowerCase().includes(queryLower) ||
      product.name_th.includes(query) ||
      product.tags?.some(tag => tag.toLowerCase().includes(queryLower));

    if (matchesQuery) {
      const inventory = mockInventory[product.id] || {};
      const branchesWithStock: BranchWithStock[] = [];

      for (const branch of mockBranches) {
        // Filter by store chain if specified
        if (storeChain && branch.chain !== storeChain) {
          continue;
        }

        const qty = inventory[branch.id] || 0;
        if (qty > 0) {
          const distance = calculateDistance(userLat, userLng, branch.latitude, branch.longitude);
          if (distance <= radiusKm) {
            const promos = mockPromotions.filter(p => !p.product_id || p.product_id === product.id);
            branchesWithStock.push({ branch, quantity: qty, distance_km: distance, promotions: promos });
          }
        }
      }

      branchesWithStock.sort((a, b) => a.distance_km - b.distance_km);
      if (branchesWithStock.length > 0) {
        results.push({ product, branches: branchesWithStock });
      }
    }
  }

  return results;
}

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon/2) * Math.sin(dLon/2);
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)) * 100) / 100;
}

