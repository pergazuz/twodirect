"use client";

import { cn } from "@/lib/utils";

export interface StoreOption {
  id: string;
  name: string;
  name_th: string;
  image: string;
}

export const storeOptions: StoreOption[] = [
  { id: "7-eleven", name: "7-Eleven", name_th: "7-Eleven", image: "/stores/7eleven.jpg" },
  { id: "makro", name: "Makro", name_th: "Makro", image: "/stores/makro.png" },
  { id: "lotus", name: "Lotus's", name_th: "Lotus's", image: "/stores/lotus.png" },
  { id: "cj", name: "CJ Express", name_th: "CJ Express", image: "/stores/cj.jpg" },
  { id: "maxvalue", name: "MaxValu", name_th: "MaxValu", image: "/stores/maxvalue.png" },
  { id: "tops", name: "Tops", name_th: "Tops", image: "/stores/tops.png" },
];

interface StoreSelectorProps {
  onStoreClick: (storeId: string) => void;
  className?: string;
}

export function StoreSelector({ onStoreClick, className }: StoreSelectorProps) {
  return (
    <div className={cn("relative", className)}>
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 sm:-mx-0 sm:px-0 snap-x snap-mandatory">
        {storeOptions.map((store) => (
          <button
            key={store.id}
            onClick={() => onStoreClick(store.id)}
            className="flex-shrink-0 relative w-[120px] h-[120px] sm:w-[140px] sm:h-[140px] rounded-2xl overflow-hidden transition-all hover:scale-[1.03] active:scale-[0.98] snap-start shadow-md"
          >
            {/* Background Image */}
            <img
              src={store.image}
              alt={store.name}
              className="absolute inset-0 w-full h-full object-cover"
            />

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

            {/* Store Name */}
            <div className="absolute bottom-0 left-0 right-0 p-3">
              <p className="font-semibold text-white text-sm sm:text-base drop-shadow-md">
                {store.name}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// Get store display name
export function getStoreName(storeId: string): string {
  const store = storeOptions.find((s) => s.id === storeId);
  return store?.name_th || "ทั้งหมด";
}
