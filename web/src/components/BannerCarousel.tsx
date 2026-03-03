"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const STORAGE_URL = "https://ncjszzjzluhbqavalnty.supabase.co/storage/v1/object/public/banners";

// Default banner images for home page (from Supabase Storage)
const DEFAULT_BANNERS = [
  { id: "1", url: `${STORAGE_URL}/banner1.jpg`, alt: "โปรโมชั่นพิเศษ" },
  { id: "2", url: `${STORAGE_URL}/banner2.jpg`, alt: "ส่วนลดสุดคุ้ม" },
  { id: "3", url: `${STORAGE_URL}/banner3.jpg`, alt: "สินค้าใหม่" },
];

// Store-specific banners (from Supabase Storage)
const STORE_BANNERS: Record<string, { id: string; url: string; alt: string }[]> = {
  "7-eleven": [
    { id: "7e-1", url: `${STORAGE_URL}/7eleven-banner1.jpg`, alt: "7-Eleven โปรโมชั่น" },
    { id: "7e-2", url: `${STORAGE_URL}/7eleven-banner2.jpg`, alt: "7-Eleven ส่วนลด" },
  ],
  "makro": [
    { id: "mk-1", url: `${STORAGE_URL}/makro-banner1.jpg`, alt: "Makro โปรโมชั่น" },
    { id: "mk-2", url: `${STORAGE_URL}/makro-banner2.jpg`, alt: "Makro ส่วนลด" },
  ],
  "lotus": [
    { id: "lt-1", url: `${STORAGE_URL}/lotus-banner1.jpg`, alt: "Lotus's โปรโมชั่น" },
    { id: "lt-2", url: `${STORAGE_URL}/lotus-banner2.jpg`, alt: "Lotus's ส่วนลด" },
  ],
  "cj": [
    { id: "cj-1", url: `${STORAGE_URL}/cj-banner1.jpg`, alt: "CJ Express โปรโมชั่น" },
    { id: "cj-2", url: `${STORAGE_URL}/cj-banner2.jpg`, alt: "CJ Express ส่วนลด" },
  ],
  "maxvalue": [
    { id: "mv-1", url: `${STORAGE_URL}/maxvalue-banner1.jpg`, alt: "MaxValu โปรโมชั่น" },
    { id: "mv-2", url: `${STORAGE_URL}/maxvalue-banner2.jpg`, alt: "MaxValu ส่วนลด" },
  ],
  "tops": [
    { id: "tp-1", url: `${STORAGE_URL}/tops-banner1.jpg`, alt: "Tops โปรโมชั่น" },
    { id: "tp-2", url: `${STORAGE_URL}/tops-banner2.jpg`, alt: "Tops ส่วนลด" },
  ],
};

// Get banners for a specific store or default banners
export function getBannersForStore(storeId?: string) {
  if (storeId && STORE_BANNERS[storeId]) {
    return STORE_BANNERS[storeId];
  }
  return DEFAULT_BANNERS;
}

interface BannerCarouselProps {
  banners?: { id: string; url: string; alt: string }[];
  storeId?: string;
  autoSlideInterval?: number;
  className?: string;
}

export function BannerCarousel({
  banners,
  storeId,
  autoSlideInterval = 4000,
  className,
}: BannerCarouselProps) {
  // Use provided banners, or get store-specific banners, or default
  const activeBanners = banners || getBannersForStore(storeId);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);

  // Reset to first slide when store changes
  useEffect(() => {
    setCurrentIndex(0);
    setFailedImages({});
  }, [storeId]);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % activeBanners.length);
  }, [activeBanners.length]);

  const goToPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + activeBanners.length) % activeBanners.length);
  }, [activeBanners.length]);

  const goToSlide = useCallback((index: number) => {
    setCurrentIndex(index);
  }, []);

  // Auto-slide effect
  useEffect(() => {
    if (isPaused || activeBanners.length <= 1) return;

    const interval = setInterval(goToNext, autoSlideInterval);
    return () => clearInterval(interval);
  }, [isPaused, goToNext, autoSlideInterval, activeBanners.length]);

  // Touch handlers for swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    setIsPaused(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current;
    const threshold = 50;

    if (diff > threshold) {
      goToNext();
    } else if (diff < -threshold) {
      goToPrev();
    }
    setIsPaused(false);
  };

  const handleImageError = (id: string) => {
    setFailedImages((prev) => ({ ...prev, [id]: true }));
  };

  if (activeBanners.length === 0) return null;

  return (
    <div
      className={cn("relative overflow-hidden rounded-2xl", className)}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Slides Container */}
      <div
        className="flex transition-transform duration-500 ease-out"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {activeBanners.map((banner, index) => (
          <div key={banner.id} className="w-full flex-shrink-0 relative">
            <div className="relative h-[150px] sm:h-[180px] md:h-[200px] bg-gradient-to-r from-gray-200 to-gray-300">
              {!failedImages[banner.id] && (
                <img
                  src={banner.url}
                  alt={banner.alt}
                  className="w-full h-full object-cover"
                  loading={index === 0 ? "eager" : "lazy"}
                  onError={() => handleImageError(banner.id)}
                />
              )}
              {failedImages[banner.id] && (
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-600 flex items-center justify-center">
                  <span className="text-white font-medium">{banner.alt}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      {activeBanners.length > 1 && (
        <>
          <button
            onClick={goToPrev}
            className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/30 text-white backdrop-blur-sm hover:bg-black/50 transition-colors"
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/30 text-white backdrop-blur-sm hover:bg-black/50 transition-colors"
            aria-label="Next slide"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </>
      )}

      {/* Dot Indicators */}
      {activeBanners.length > 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
          {activeBanners.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={cn(
                "w-2 h-2 rounded-full transition-all",
                index === currentIndex
                  ? "bg-white w-4"
                  : "bg-white/50 hover:bg-white/75"
              )}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

