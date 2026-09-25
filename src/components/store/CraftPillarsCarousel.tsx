"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export interface CraftPrincipleItem {
  id: string;
  badge: string;
  title: string;
  description: string;
}

interface CraftPillarsCarouselProps {
  pillars: CraftPrincipleItem[];
  badge?: string;
  heading?: string;
  subheading?: string;
  variant?: "homepage" | "about";
}

export function CraftPillarsCarousel({
  pillars,
  badge = "Craft Principles",
  heading = "What Makes Every Gift Special",
  subheading = "Fourfold Standards",
}: CraftPillarsCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const overflowing = el.scrollWidth > el.clientWidth + 8;
    setIsOverflowing(overflowing);
    setCanScrollLeft(el.scrollLeft > 5);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 8);
  }, []);

  useEffect(() => {
    checkScroll();
    const timer = setTimeout(checkScroll, 100);
    window.addEventListener("resize", checkScroll);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", checkScroll);
    };
  }, [pillars, checkScroll]);

  const handleScroll = (direction: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    const scrollAmount = Math.max(280, el.clientWidth * 0.7);

    if (direction === "left") {
      el.scrollBy({ left: -scrollAmount, behavior: "smooth" });
    } else {
      el.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
    setTimeout(checkScroll, 350);
  };

  // Only show navigation arrows when there are more than 4 principles OR when screen is too small to display all principles
  const showArrows = (pillars.length > 4 || isOverflowing) && isOverflowing;

  return (
    <div className="space-y-6">
      {/* Section Header (Modular "ss part") with Conditional Navigation Arrows */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between pb-4 border-b border-border gap-3">
        <div>
          <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.2em] text-accent font-semibold block">
            {badge}
          </span>
          <h3 className="font-bold tracking-tight text-2xl sm:text-3xl text-foreground mt-1">
            {heading}
          </h3>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-3 self-stretch sm:self-auto">
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {subheading}
          </span>

          {/* Left & Right Arrow Buttons - Only rendered when screen is too small or > 4 principles */}
          {showArrows && (
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => handleScroll("left")}
                disabled={!canScrollLeft}
                className="w-8 h-8 rounded-full border border-border bg-card text-foreground hover:border-accent flex items-center justify-center shrink-0 transition-colors cursor-pointer disabled:opacity-25 disabled:cursor-not-allowed shadow-xs"
                aria-label="Previous principles"
                title="Previous principles"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => handleScroll("right")}
                disabled={!canScrollRight}
                className="w-8 h-8 rounded-full border border-border bg-card text-foreground hover:border-accent flex items-center justify-center shrink-0 transition-colors cursor-pointer disabled:opacity-25 disabled:cursor-not-allowed shadow-xs"
                aria-label="Next principles"
                title="Next principles"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Pillars Track: Restored to Clean Old UI */}
      <div
        ref={scrollRef}
        onScroll={checkScroll}
        className="flex gap-6 overflow-x-auto scroll-smooth snap-x snap-mandatory scrollbar-none pb-2 -mx-4 px-4 sm:mx-0 sm:px-0"
      >
        {pillars.map((pillar, idx) => (
          <div
            key={pillar.id || idx}
            className={`snap-start p-6 bg-card border border-border rounded-2xl space-y-3 transition-colors ${
              pillars.length > 4
                ? "w-[82vw] sm:w-[280px] lg:w-[280px] shrink-0"
                : "w-[82vw] sm:w-[280px] lg:w-auto lg:flex-1 shrink-0 lg:shrink"
            }`}
          >
            <span className="text-xs font-semibold text-muted-foreground tracking-widest uppercase block">
              {pillar.badge}
            </span>
            <h4 className="font-bold tracking-tight text-lg text-foreground">
              {pillar.title}
            </h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {pillar.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

