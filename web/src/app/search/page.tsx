"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import { SearchBar, ProductCard, BranchCard, MapView, getStoreName, BannerCarousel } from "@/components";
import { PriceComparison } from "@/components/PriceComparison";
import { SearchResult, StorePrice, BranchWithStock } from "@/types";
import { searchProducts, searchProductsHybrid, searchProductsByImage } from "@/lib/api";
import { searchMockProducts, mockProducts, getStorePrices, getPriceRange } from "@/lib/mock-data";
import { formatPrice } from "@/lib/utils";
import { ArrowLeft, Map, List, Loader2, Search, Package, AlertCircle, X, Store, TrendingDown } from "lucide-react";
import Link from "next/link";
import { useLocation } from "@/contexts/LocationContext";

// Build StorePrice[] from real branch data (instead of relying on mock data)
// Build store prices from branch data, using mock pricing when available
function getEffectiveStorePrices(productId: string, branches: BranchWithStock[], productPrice: number): StorePrice[] {
  const STORE_LOGO_URL = "https://ncjszzjzluhbqavalnty.supabase.co/storage/v1/object/public/stores";
  const STORE_META: Record<string, { name: string; name_th: string; logo: string }> = {
    "7-eleven": { name: "7-Eleven", name_th: "7-Eleven", logo: `${STORE_LOGO_URL}/7eleven.jpg` },
    "lotus": { name: "Lotus's", name_th: "Lotus's", logo: `${STORE_LOGO_URL}/lotus.jpg` },
    "makro": { name: "Makro", name_th: "Makro", logo: `${STORE_LOGO_URL}/makro.jpg` },
    "tops": { name: "Tops", name_th: "Tops", logo: `${STORE_LOGO_URL}/tops.jpg` },
    "cj": { name: "CJ Express", name_th: "CJ Express", logo: `${STORE_LOGO_URL}/cj.jpg` },
    "maxvalue": { name: "MaxValu", name_th: "MaxValu", logo: `${STORE_LOGO_URL}/maxvalue.jpg` },
  };

  // Count real branches per chain
  const chainBranchCounts: Record<string, number> = {};
  for (const b of branches) {
    const chain = (b.branch as any).chain as string | undefined;
    if (!chain) continue;
    chainBranchCounts[chain] = (chainBranchCounts[chain] || 0) + 1;
  }

  const mockPrices = getStorePrices(productId);
  const hasRealBranches = Object.keys(chainBranchCounts).length > 0;

  // Case 1: Mock pricing exists — merge with real branch counts
  if (mockPrices.length > 0 && hasRealBranches) {
    return mockPrices
      .map((sp) => ({
        ...sp,
        branch_count: chainBranchCounts[sp.store_id] || 0,
        in_stock: (chainBranchCounts[sp.store_id] || 0) > 0,
      }))
      .filter((sp) => sp.in_stock);
  }

  // Case 2: No mock pricing (real backend product) — build from branch data
  if (hasRealBranches) {
    const result: StorePrice[] = [];
    for (const chain of Object.keys(chainBranchCounts)) {
      const meta = STORE_META[chain] || { name: chain, name_th: chain, logo: "" };
      result.push({
        store_id: chain,
        store_name: meta.name,
        store_name_th: meta.name_th,
        price: productPrice,
        in_stock: true,
        branch_count: chainBranchCounts[chain],
        logo_url: meta.logo,
      });
    }
    return result;
  }

  // Case 3: No real branches — return mock data as-is
  return mockPrices;
}

// Store online shopping URLs
const STORE_ONLINE_URLS: Record<string, { name: string; getUrl: (query: string) => string }> = {
  "7-eleven": {
    name: "All Online 7-Eleven",
    getUrl: (q) => `https://www.allonline.7eleven.co.th/search/?q=${encodeURIComponent(q)}&qc=&ms=true`,
  },
  "makro": {
    name: "Makro Online",
    getUrl: (q) => `https://www.makro.pro/c/search?q=${encodeURIComponent(q)}`,
  },
  "lotus": {
    name: "Lotus's Online",
    getUrl: (q) => `https://www.lotuss.com/th/search/${encodeURIComponent(q)}?sort=relevance:DESC`,
  },
  "tops": {
    name: "Tops Online",
    getUrl: (q) => `https://www.tops.co.th/th/search/${encodeURIComponent(q)}`,
  },
};

function getOnlineStoreUrl(storeId: string, productName: string): string | null {
  const store = STORE_ONLINE_URLS[storeId];
  if (!store) return null;
  return store.getUrl(productName);
}

function getOnlineStoreName(storeId: string): string {
  return STORE_ONLINE_URLS[storeId]?.name || "Online Store";
}

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
  const storeParam = searchParams.get("store") || "";
  const imageParam = searchParams.get("image") || "";
  const productParam = searchParams.get("product") || "";
  const searchQuery = queryParam || categorySearchTerms[categoryParam] || categoryParam;

  const { activeLocation } = useLocation();
  const lat = activeLocation.lat;
  const lng = activeLocation.lng;

  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const [searchedImage, setSearchedImage] = useState<string | null>(null);
  // null = use URL storeParam, "" = explicitly show all, "tops" = specific store
  const [selectedStoreFilter, setSelectedStoreFilter] = useState<string | null>(null);
  const [allBranches, setAllBranches] = useState<SearchResult | null>(null);
  const [loadingBranches, setLoadingBranches] = useState(false);

  const handleImageSearch = async (imageFile: File) => {
    setLoading(true);
    setError(null);
    // Show the searched image as preview
    const imageUrl = URL.createObjectURL(imageFile);
    setSearchedImage(imageUrl);
    try {
      const data = await searchProductsByImage(imageFile, lat, lng, 50);
      let filteredData = data;
      if (storeParam) {
        filteredData = data
          .map((result) => ({
            ...result,
            branches: result.branches.filter((b) => (b.branch as any).chain === storeParam),
          }))
          .filter((result) => result.branches.length > 0);
      }
      setResults(filteredData);
    } catch (err) {
      console.error("Image search error:", err);
      setError("ค้นหาด้วยรูปภาพไม่สำเร็จ - ลองใช้คำค้นหาแทน");
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle pending image search from home page
  useEffect(() => {
    if (imageParam === "pending") {
      const dataUrl = sessionStorage.getItem("pendingImageSearch");
      if (dataUrl) {
        sessionStorage.removeItem("pendingImageSearch");
        fetch(dataUrl)
          .then((res) => res.blob())
          .then((blob) => {
            const file = new File([blob], "search-image.jpg", { type: blob.type });
            handleImageSearch(file);
          });
      }
    }
  }, [imageParam]);

  useEffect(() => {
    // Search if we have a query, category, or store filter
    if (searchQuery || categoryParam || storeParam) {
      setLoading(true);
      setError(null);

      // If only store is selected (no search query), show all products from that store
      const effectiveQuery = searchQuery || "";

      if (USE_BACKEND && effectiveQuery) {
        // Use hybrid search: text-first, embedding fallback
        searchProductsHybrid(effectiveQuery, lat, lng, 50, storeParam || undefined)
          .catch(() => {
            // Fallback to basic text search if hybrid endpoint unavailable
            return searchProducts(effectiveQuery, lat, lng, 50, storeParam || undefined);
          })
          .then((data) => {
            // Filter by store if specified
            let filteredData = data;
            if (storeParam) {
              filteredData = data.map(result => ({
                ...result,
                branches: result.branches.filter(b =>
                  (b.branch as any).chain === storeParam
                )
              })).filter(result => result.branches.length > 0);
            }
            setResults(filteredData);
            setLoading(false);
          })
          .catch((err) => {
            console.error("API Error, falling back to mock data:", err);
            // Fallback to mock data if backend is not running
            const mockResults = searchMockProducts(effectiveQuery, lat, lng, 50, storeParam || undefined);
            setResults(mockResults);
            setError("Backend ไม่พร้อมใช้งาน - ใช้ข้อมูลจำลอง");
            setLoading(false);
          });
      } else {
        // Use mock data
        let mockResults: SearchResult[];
        if (categoryParam && !searchQuery) {
          // Filter mock products by category
          const filteredProducts = mockProducts.filter(p => p.category === categoryParam);
          mockResults = filteredProducts.map(product => ({
            product,
            branches: [] // No branch data for category browse
          }));
        } else {
          // Use larger radius (50km) to ensure results are found
          mockResults = searchMockProducts(effectiveQuery, lat, lng, 50, storeParam || undefined);
        }
        setResults(mockResults);
        setLoading(false);
      }
    } else {
      setLoading(false);
      setResults([]);
    }
  }, [searchQuery, categoryParam, storeParam, lat, lng]);

  // Auto-select product from URL param (e.g. after login redirect)
  useEffect(() => {
    if (productParam && results.length > 0 && !selectedProduct) {
      const match = results.find((r) => r.product.id === productParam);
      if (match) {
        setSelectedProduct(match);
      }
    }
  }, [productParam, results]);

  // Fetch ALL branches (no store filter) for the selected product so price comparison can filter by any store
  useEffect(() => {
    if (!selectedProduct) {
      setAllBranches(null);
      return;
    }
    const productName = selectedProduct.product.name_th;
    // Fetch without store filter to get branches from all chains
    setLoadingBranches(true);
    searchProductsHybrid(productName, lat, lng, 50)
      .catch(() => searchProducts(productName, lat, lng, 50))
      .then((data) => {
        const match = data.find(r => r.product.id === selectedProduct.product.id);
        if (match) {
          setAllBranches(match);
        } else if (data.length > 0) {
          setAllBranches(data[0]);
        }
      })
      .catch(() => {
        // Fallback to mock data
        const mockResults = searchMockProducts(productName, lat, lng, 50);
        const match = mockResults.find(r => r.product.id === selectedProduct.product.id);
        if (match) setAllBranches(match);
      })
      .finally(() => setLoadingBranches(false));
  }, [selectedProduct?.product.id]);

  const handleSearch = (newQuery: string) => {
    setSearchedImage(null);
    const storeQuery = storeParam ? `&store=${storeParam}` : "";
    router.push(`/search?q=${encodeURIComponent(newQuery)}&lat=${lat}&lng=${lng}${storeQuery}`);
  };

  const handleClearStore = () => {
    const params = new URLSearchParams();
    if (queryParam) params.set("q", queryParam);
    if (categoryParam) params.set("category", categoryParam);
    params.set("lat", lat.toString());
    params.set("lng", lng.toString());
    router.push(`/search?${params.toString()}`);
  };

  const handleProductClick = (result: SearchResult) => {
    setSelectedProduct(result);
    setSelectedStoreFilter(null);
    // Add product ID to URL so it persists across navigation (e.g. login redirect)
    const params = new URLSearchParams(window.location.search);
    params.set("product", result.product.id);
    router.replace(`/search?${params.toString()}`, { scroll: false });
  };

  const handleBack = () => {
    if (selectedProduct) {
      setSelectedProduct(null);
      // Remove product param from URL
      const params = new URLSearchParams(window.location.search);
      params.delete("product");
      router.replace(`/search?${params.toString()}`, { scroll: false });
    } else {
      router.push("/");
    }
  };

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white border-b border-gray-100">
        <div className="mx-auto max-w-lg px-3 py-3 sm:px-4 sm:py-4 md:max-w-2xl lg:max-w-4xl">
          <div className="flex items-center gap-3">
            <button
              onClick={handleBack}
              className="rounded-xl p-2.5 hover:bg-gray-50 active:bg-gray-100 min-h-[44px] min-w-[44px] flex items-center justify-center transition-colors"
              aria-label="Go back"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600" strokeWidth={1.5} />
            </button>
            <SearchBar onSearch={handleSearch} onImageSearch={handleImageSearch} searchedImageUrl={searchedImage} onClearImageSearch={() => setSearchedImage(null)} placeholder={searchQuery || "ค้นหาสินค้า..."} className="flex-1" />
          </div>
        </div>
      </header>

      {/* Error Banner */}
      {error && (
        <div className="mx-auto max-w-lg px-3 pt-3 sm:px-4 sm:pt-4 md:max-w-2xl lg:max-w-4xl">
          <div className="rounded-xl bg-amber-50 px-4 py-3 text-xs text-amber-700 flex items-center gap-2 sm:text-sm">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Store Banner */}
      {storeParam && !selectedProduct && (
        <div className="mx-auto max-w-lg px-3 pt-3 sm:px-4 sm:pt-4 md:max-w-2xl lg:max-w-4xl">
          <BannerCarousel storeId={storeParam} className="mb-3" />
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">กำลังช้อปที่:</span>
            <button
              onClick={handleClearStore}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 transition-colors"
            >
              <Store className="h-3.5 w-3.5" strokeWidth={1.5} />
              <span>{getStoreName(storeParam)}</span>
              <X className="h-3.5 w-3.5 ml-0.5" strokeWidth={2} />
            </button>
          </div>
        </div>
      )}

      {/* Results Header */}
      {!selectedProduct && (
        <div className="mx-auto max-w-lg px-3 py-4 sm:px-4 sm:py-5 md:max-w-2xl lg:max-w-4xl">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-gray-500 truncate">
              {loading ? "กำลังค้นหา..." : `${results.length} รายการ`}
            </p>
            <div className="flex gap-1 rounded-xl bg-gray-100 p-1 flex-shrink-0">
              <button
                onClick={() => setViewMode("list")}
                className={`rounded-lg p-2.5 min-h-[40px] min-w-[40px] flex items-center justify-center transition-all ${
                  viewMode === "list"
                    ? "bg-white shadow-sm text-gray-900"
                    : "text-gray-400 hover:text-gray-600"
                }`}
                aria-label="List view"
              >
                <List className="h-4 w-4" strokeWidth={viewMode === "list" ? 2 : 1.5} />
              </button>
              <button
                onClick={() => setViewMode("map")}
                className={`rounded-lg p-2.5 min-h-[40px] min-w-[40px] flex items-center justify-center transition-all ${
                  viewMode === "map"
                    ? "bg-white shadow-sm text-gray-900"
                    : "text-gray-400 hover:text-gray-600"
                }`}
                aria-label="Map view"
              >
                <Map className="h-4 w-4" strokeWidth={viewMode === "map" ? 2 : 1.5} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="mx-auto max-w-lg px-3 pb-8 sm:px-4 sm:pb-10 md:max-w-2xl lg:max-w-4xl">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 sm:py-20">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" strokeWidth={1.5} />
            <p className="mt-4 text-sm text-gray-400">กำลังค้นหา...</p>
          </div>
        ) : selectedProduct ? (
          // Product Detail with Branch List
          <div className="space-y-4 sm:space-y-5">
            <div className="rounded-2xl bg-white border border-gray-100 p-5 sm:p-6">
              <div className="flex gap-5 sm:gap-6">
                {/* Product Image */}
                <div className="relative flex-shrink-0 w-28 h-28 sm:w-40 sm:h-40 rounded-2xl bg-gray-50 overflow-hidden flex items-center justify-center p-3 sm:p-4">
                  {selectedProduct.product.image_url ? (
                    <img
                      src={selectedProduct.product.image_url}
                      alt={selectedProduct.product.name_th}
                      className="max-h-full max-w-full object-contain"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                  ) : null}
                  <div className={`flex items-center justify-center absolute inset-0 ${selectedProduct.product.image_url ? 'hidden' : ''}`}>
                    <Package className="h-10 w-10 text-gray-300 sm:h-12 sm:w-12" strokeWidth={1} />
                  </div>
                </div>

                {/* Product Info */}
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg font-semibold text-gray-900 sm:text-xl leading-snug">
                    {selectedProduct.product.name_th}
                  </h2>
                  <p className="text-sm text-gray-400 mt-1">{selectedProduct.product.name}</p>

                  {(() => {
                    const sourceBranches = allBranches?.branches || selectedProduct.branches;
                    const prices = getEffectiveStorePrices(selectedProduct.product.id, sourceBranches, selectedProduct.product.price);
                    const inStockPrices = prices.filter(s => s.in_stock);
                    const priceMin = inStockPrices.length > 0 ? Math.min(...inStockPrices.map(s => s.price)) : null;
                    const priceMax = inStockPrices.length > 0 ? Math.max(...inStockPrices.map(s => s.price)) : null;
                    const inStockCount = inStockPrices.length;
                    const totalBranches = prices.reduce((sum, s) => sum + s.branch_count, 0);

                    return (
                      <>
                        <p className="mt-4 text-2xl font-bold text-gray-900 sm:text-3xl">
                          {priceMin && priceMax && priceMin !== priceMax
                            ? `${formatPrice(priceMin)} - ${formatPrice(priceMax)}`
                            : formatPrice(selectedProduct.product.price)
                          }
                        </p>
                        {inStockCount > 0 && (
                          <div className="mt-2 flex items-center gap-2 text-sm text-gray-400 flex-wrap">
                            <span>ขายออฟไลน์ {inStockCount} ร้านค้า</span>
                            <span className="text-gray-200">|</span>
                            <span>สินค้า {totalBranches} สาขา</span>
                          </div>
                        )}
                      </>
                    );
                  })()}

                  {/* CTA Button */}
                  <button
                    onClick={() => {
                      setSelectedStoreFilter("");
                      setTimeout(() => {
                        document.getElementById("store-prices")?.scrollIntoView({ behavior: "smooth" });
                      }, 100);
                    }}
                    className="mt-5 inline-flex items-center gap-2 rounded-xl border border-gray-900 px-5 py-2.5 text-sm font-semibold text-gray-900 hover:bg-gray-900 hover:text-white active:bg-gray-800 transition-colors"
                  >
                    <TrendingDown className="h-4 w-4" strokeWidth={2} />
                    ดูราคาทุกร้านค้า
                  </button>
                </div>
              </div>
            </div>

            {/* Price Comparison Section */}
            {(() => {
              // Use real branch data when available, fall back to mock data
              const sourceBranches = allBranches?.branches || selectedProduct.branches;
              const storePrices = getEffectiveStorePrices(selectedProduct.product.id, sourceBranches, selectedProduct.product.price);
              if (storePrices.length > 1) {
                return (
                  <div id="store-prices">
                  <PriceComparison
                    product={selectedProduct.product}
                    storePrices={storePrices}
                    selectedStoreId={selectedStoreFilter !== null ? (selectedStoreFilter || undefined) : (storeParam || undefined)}
                    onStoreClick={(storeId) => {
                      // Toggle: if already selected, clear filter; otherwise set it
                      setSelectedStoreFilter(prev => prev === storeId ? "" : storeId);
                    }}
                  />
                  </div>
                );
              }
              return null;
            })()}

            {/* TODO: Re-enable Online Shopping when connected to modern trade backend */}
            {/* {(() => {
              const activeStore = selectedStoreFilter !== null ? selectedStoreFilter : storeParam;
              if (activeStore && STORE_ONLINE_URLS[activeStore]) {
                return (
                  <a
                    href={getOnlineStoreUrl(activeStore, selectedProduct.product.name_th) || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 rounded-2xl bg-white border border-gray-100 p-4 sm:p-5 transition-all hover:bg-gray-50 active:scale-[0.99]"
                  >
                    <div className="flex-shrink-0 bg-gray-900 rounded-xl p-3">
                      <ShoppingCart className="h-6 w-6 text-white" strokeWidth={1.5} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 text-sm sm:text-base">สั่งซื้อออนไลน์</p>
                      <p className="text-xs sm:text-sm text-gray-400 mt-0.5">{getOnlineStoreName(activeStore)}</p>
                    </div>
                    <ExternalLink className="h-5 w-5 text-gray-300 flex-shrink-0" strokeWidth={1.5} />
                  </a>
                );
              }
              if (!activeStore) {
                return (
                  <a
                    href={`https://www.allonline.7eleven.co.th/search/?q=${encodeURIComponent(selectedProduct.product.name_th)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 rounded-2xl bg-white border border-gray-100 p-4 sm:p-5 transition-all hover:bg-gray-50 active:scale-[0.99]"
                  >
                    <div className="flex-shrink-0 bg-gray-900 rounded-xl p-3">
                      <ShoppingCart className="h-6 w-6 text-white" strokeWidth={1.5} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 text-sm sm:text-base">สั่งซื้อออนไลน์</p>
                      <p className="text-xs sm:text-sm text-gray-400 mt-0.5">ดูราคาและสั่งซื้อทางออนไลน์</p>
                    </div>
                    <ExternalLink className="h-5 w-5 text-gray-300 flex-shrink-0" strokeWidth={1.5} />
                  </a>
                );
              }
              return null;
            })()} */}

            {/* Branch List - filtered by selected store */}
            {(() => {
              const activeStore = selectedStoreFilter !== null ? selectedStoreFilter : storeParam;
              // Use allBranches (fetched without store filter) so we have data for all chains
              const sourceBranches = allBranches?.branches || selectedProduct.branches;
              const filteredBranches = activeStore
                ? sourceBranches.filter(b => (b.branch as any).chain === activeStore)
                : sourceBranches;
              const storeName = activeStore ? getStoreName(activeStore) : null;

              return (
                <>
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-gray-900 text-sm sm:text-base">
                      {storeName ? `สาขา ${storeName} ที่มีสินค้า` : "สาขาที่มีสินค้า"}
                    </h3>
                    <div className="flex items-center gap-2">
                      {activeStore && (
                        <button
                          onClick={() => setSelectedStoreFilter("")}
                          className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          ดูทั้งหมด
                        </button>
                      )}
                      <span className="text-sm text-gray-400">{filteredBranches.length} สาขา</span>
                    </div>
                  </div>
                  {loadingBranches ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-gray-400" strokeWidth={1.5} />
                    </div>
                  ) : filteredBranches.length > 0 ? (
                    <div className="grid gap-3 sm:gap-4 md:grid-cols-2">
                      {filteredBranches.map((b) => (
                        <BranchCard
                          key={b.branch.id}
                          branchWithStock={b}
                          product={selectedProduct.product}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-2xl bg-white border border-gray-100 p-6 text-center">
                      <Store className="h-8 w-8 text-gray-200 mx-auto mb-2" strokeWidth={1.5} />
                      <p className="text-sm text-gray-400">ไม่พบสาขา {storeName} ที่มีสินค้าใกล้คุณ</p>
                      <button
                        onClick={() => setSelectedStoreFilter("")}
                        className="mt-3 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
                      >
                        ดูสาขาทุกร้านค้า
                      </button>
                    </div>
                  )}
                </>
              );
            })()}
          </div>
        ) : results.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center sm:py-20">
            <div className="rounded-2xl bg-gray-50 p-5 mb-4">
              <Search className="h-10 w-10 text-gray-300" strokeWidth={1.5} />
            </div>
            <h3 className="text-base font-medium text-gray-900 sm:text-lg">ไม่พบสินค้า</h3>
            <p className="mt-2 text-sm text-gray-400 max-w-[240px]">ลองค้นหาด้วยคำอื่น หรือตรวจสอบการสะกด</p>
            <Link
              href="/"
              className="mt-5 px-5 py-2.5 rounded-xl bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 transition-colors min-h-[44px] flex items-center"
            >
              กลับหน้าหลัก
            </Link>
          </div>
        ) : viewMode === "map" ? (
          // Map View - show all branches from all results
          <div className="space-y-4">
            <MapView
              branches={results.flatMap((r) => r.branches)}
              userLocation={{ lat, lng }}
              className="h-[400px] sm:h-[500px] rounded-2xl overflow-hidden"
              onBranchClick={(branch) => {
                // Find the product that has this branch and select it
                const product = results.find((r) =>
                  r.branches.some((b) => b.branch.id === branch.branch.id)
                );
                if (product) {
                  handleProductClick(product);
                }
              }}
            />
            <p className="text-sm text-gray-500 text-center">
              แตะที่หมุดเพื่อดูรายละเอียดสาขา
            </p>
          </div>
        ) : (
          // List View
          <div className="space-y-3 md:grid md:grid-cols-2 md:gap-4 md:space-y-0">
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

