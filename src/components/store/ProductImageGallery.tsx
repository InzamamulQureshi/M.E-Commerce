"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

export interface ProductImageGalleryProps {
  images: string[];
  title: string;
  isBestSeller?: boolean;
  isFeatured?: boolean;
  discountPercent?: number | null;
  isOutOfStock?: boolean;
}

export function ProductImageGallery({
  images,
  title,
  isBestSeller = false,
  isFeatured = false,
  discountPercent = null,
  isOutOfStock = false,
}: ProductImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  const imageList =
    images && images.length > 0
      ? images
      : [
          "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=1200&q=85",
        ];

  const currentIndex = Math.min(activeIndex, imageList.length - 1);
  const currentImage = imageList[currentIndex];

  const handlePrev = () => {
    setActiveIndex((prev) => (prev === 0 ? imageList.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev === imageList.length - 1 ? 0 : prev + 1));
  };

  const hasMultiple = imageList.length > 1;
  const validDiscount =
    typeof discountPercent === "number" && discountPercent > 0
      ? discountPercent
      : null;

  return (
    <div className="space-y-4">
      {/* Main Image Stage */}
      <div className="relative aspect-[4/5] bg-[#F2EDE4] dark:bg-[#1A1715] border border-[#DDD5C7] dark:border-[#2E2925] rounded-2xl overflow-hidden shadow-xs group select-none">
        <Image
          key={currentImage}
          src={currentImage}
          alt={`${title} - View ${currentIndex + 1}`}
          fill
          priority
          className="object-cover object-center transition-all duration-300 ease-out"
          sizes="(max-width: 1024px) 100vw, 50vw"
        />

        {/* Status Tags (Bestseller, Sold Out, Discount % OFF) */}
        <div className="absolute top-3 left-3 flex flex-col gap-1 items-start z-10 pointer-events-none">
          {isOutOfStock ? (
            <span className="text-[9px] font-semibold tracking-wider uppercase px-2.5 py-0.5 bg-neutral-900/90 text-neutral-100 dark:bg-neutral-100 dark:text-neutral-900 rounded-full shadow-xs">
              Sold Out
            </span>
          ) : isBestSeller ? (
            <span className="text-[9px] font-semibold tracking-wider uppercase px-2.5 py-0.5 bg-[#181513] text-[#FAF8F5] dark:bg-[#FAF8F5] dark:text-[#181513] rounded-full shadow-xs">
              Bestseller
            </span>
          ) : isFeatured ? (
            <span className="text-[9px] font-semibold tracking-wider uppercase px-2.5 py-0.5 bg-[#FAF8F5] text-[#181513] dark:bg-[#1A1715] dark:text-[#FAF8F5] border border-[#DDD5C7] dark:border-[#2E2925] rounded-full shadow-xs">
              Featured
            </span>
          ) : null}

          {/* Strictly render ONLY when discountPercent > 0 to prevent rogue '0' */}
          {validDiscount !== null && (
            <span className="text-[9px] font-semibold tracking-wider uppercase px-2.5 py-0.5 bg-[#A64732] text-[#FAF8F5] rounded-full shadow-xs">
              {validDiscount}% OFF
            </span>
          )}
        </div>

        {/* Image Counter Badge when multiple images exist */}
        {hasMultiple && (
          <div className="absolute bottom-3 right-3 text-[10px] font-medium tracking-wider text-[#FAF8F5] bg-[#181513]/75 backdrop-blur-xs px-2.5 py-0.5 uppercase rounded-full z-10 pointer-events-none">
            {currentIndex + 1} / {imageList.length}
          </div>
        )}

        {/* Navigation Arrows for Multiple Images */}
        {hasMultiple && (
          <>
            <button
              type="button"
              onClick={handlePrev}
              aria-label="Previous image"
              className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#181513]/70 hover:bg-[#181513] text-[#FAF8F5] backdrop-blur-xs flex items-center justify-center transition-all duration-200 shadow-md hover:scale-105 active:scale-95 focus:outline-none"
            >
              <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
            <button
              type="button"
              onClick={handleNext}
              aria-label="Next image"
              className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#181513]/70 hover:bg-[#181513] text-[#FAF8F5] backdrop-blur-xs flex items-center justify-center transition-all duration-200 shadow-md hover:scale-105 active:scale-95 focus:outline-none"
            >
              <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </>
        )}
      </div>

      {/* Interactive Thumbnail Gallery Strip */}
      {hasMultiple && (
        <div className="grid grid-cols-4 sm:grid-cols-5 gap-2.5">
          {imageList.map((img, idx) => {
            const isActive = idx === currentIndex;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveIndex(idx)}
                aria-label={`View image ${idx + 1}`}
                className={`relative aspect-square bg-[#F2EDE4] dark:bg-[#1A1715] rounded-xl overflow-hidden transition-all duration-200 cursor-pointer ${
                  isActive
                    ? "ring-2 ring-[#181513] dark:ring-[#FAF8F5] opacity-100 scale-[1.02] shadow-xs"
                    : "border border-[#DDD5C7] dark:border-[#2E2925] opacity-60 hover:opacity-100 hover:scale-[1.01]"
                }`}
              >
                <Image
                  src={img}
                  alt={`${title} thumbnail ${idx + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 25vw, 15vw"
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
