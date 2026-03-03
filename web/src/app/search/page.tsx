"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import { SearchBar, ProductCard, BranchCard } from "@/components";
import { SearchResult } from "@/types";
import { searchProducts } from "@/lib/api";
import { searchMockProducts, mockProducts } from "@/lib/mock-data";
import { ArrowLeft, Map, List, Loader2 } from "lucide-react";
import Link from "next/link";

// Set to true to use Rust backend, false for mock data
const USE_BACKEND = true;

// Category to search term mapping
const categorySearchTerms: Record<string, string> = {
  beverages: "เครื่องดื่ม",
  snacks: "ขนม",
  "ready-meals": "อาหาร",
  "instant-food": "มาม่า",
  dairy: "นม",
  bakery: "ขนมปัง",
};

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Support both ?q= and ?category= parameters
  const queryParam = searchParams.get("q") || "";
  const categoryParam = searchParams.get("category") || "";
  const searchQuery = queryParam || categorySearchTerms[categoryParam] || categoryParam;

  const lat = parseFloat(searchParams.get("lat") || "13.7563");
  const lng = parseFloat(searchParams.get("lng") || "100.5018");

  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "map">("list");

  useEffect(() => {
    // Search if we have a query or category
    if (searchQuery || categoryParam) {
      setLoading(true);
      setError(null);

      if (USE_BACKEND && searchQuery) {
        // Use Rust backend API → Supabase
        searchProducts(searchQuery, lat, lng, 10)
          .then((data) => {
            setResults(data);
            setLoading(false);
          })
          .catch((err) => {
            console.error("API Error, falling back to mock data:", err);
            // Fallback to mock data if backend is not running
            const mockResults = searchMockProducts(searchQuery, lat, lng, 10);
            setResults(mockResults);
            setError("Backend ไม่พร้อมใช้งาน - ใช้ข้อมูลจำลอง");
            setLoading(false);
          });
      } else {
        // Use mock data - filter by category if provided
        let mockResults: SearchResult[];
        if (categoryParam && !searchQuery) {
          // Filter mock products by category
          const filteredProducts = mockProducts.filter(p => p.category === categoryParam);
          mockResults = filteredProducts.map(product => ({
            product,
            branches: [] // No branch data for category browse
          }));
        } else {
          mockResults = searchMockProducts(searchQuery, lat, lng, 10);
        }
        setResults(mockResults);
        setLoading(false);
      }
    } else {
      setLoading(false);
      setResults([]);
    }
  }, [searchQuery, categoryParam, lat, lng]);

  const handleSearch = (newQuery: string) => {
    router.push(`/search?q=${encodeURIComponent(newQuery)}&lat=${lat}&lng=${lng}`);
  };

  const handleProductClick = (result: SearchResult) => {
    setSelectedProduct(result);
  };

  const handleBack = () => {
    if (selectedProduct) {
      setSelectedProduct(null);
    } else {
      router.push("/");
    }
  };

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white shadow-sm">
        <div className="mx-auto max-w-lg px-4 py-3">
          <div className="flex items-center gap-3">
            <button onClick={handleBack} className="rounded-full p-2 hover:bg-gray-100">
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </button>
            <SearchBar onSearch={handleSearch} placeholder={searchQuery || "ค้นหาสินค้า..."} className="flex-1" />
          </div>
        </div>
      </header>

      {/* Error Banner */}
      {error && (
        <div className="mx-auto max-w-lg px-4 pt-4">
          <div className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-2 text-sm text-amber-700">
            ⚠️ {error}
          </div>
        </div>
      )}

      {/* Results Header */}
      {!selectedProduct && (
        <div className="mx-auto max-w-lg px-4 py-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              {loading ? "กำลังค้นหา..." : `พบ ${results.length} รายการ สำหรับ "${searchQuery || categoryParam}"`}
            </p>
            <div className="flex gap-1 rounded-lg bg-gray-100 p-1">
              <button
                onClick={() => setViewMode("list")}
                className={`rounded-md p-2 ${viewMode === "list" ? "bg-white shadow-sm" : ""}`}
              >
                <List className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode("map")}
                className={`rounded-md p-2 ${viewMode === "map" ? "bg-white shadow-sm" : ""}`}
              >
                <Map className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="mx-auto max-w-lg px-4 pb-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-green-600" />
            <p className="mt-4 text-gray-500">กำลังค้นหาสินค้า...</p>
          </div>
        ) : selectedProduct ? (
          // Product Detail with Branch List
          <div className="space-y-4">
            <div className="rounded-xl bg-white p-4 shadow-sm">
              <div className="flex gap-4">
                <div className="flex h-20 w-20 items-center justify-center rounded-lg bg-gray-100">
                  <span className="text-3xl">📦</span>
                </div>
                <div>
                  <h2 className="text-lg font-semibold">{selectedProduct.product.name_th}</h2>
                  <p className="text-sm text-gray-500">{selectedProduct.product.name}</p>
                  <p className="mt-1 text-lg font-bold text-green-600">฿{selectedProduct.product.price}</p>
                </div>
              </div>
            </div>
            <h3 className="font-semibold text-gray-900">สาขาที่มีสินค้า ({selectedProduct.branches.length} สาขา)</h3>
            {selectedProduct.branches.map((b) => (
              <BranchCard key={b.branch.id} branchWithStock={b} />
            ))}
          </div>
        ) : results.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <span className="text-6xl">🔍</span>
            <h3 className="mt-4 text-lg font-semibold text-gray-900">ไม่พบสินค้า</h3>
            <p className="mt-2 text-gray-500">ลองค้นหาด้วยคำอื่น หรือตรวจสอบการสะกด</p>
            <Link href="/" className="mt-4 text-green-600 hover:underline">กลับหน้าหลัก</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {results.map((result) => (
              <ProductCard key={result.product.id} result={result} onClick={() => handleProductClick(result)} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-green-600" /></div>}>
      <SearchContent />
    </Suspense>
  );
}

