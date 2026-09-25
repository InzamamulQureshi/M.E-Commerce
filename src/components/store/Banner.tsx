"use client";

import Link from "next/link";
import { Sparkles, Heart } from "lucide-react";

export function Banner() {
  return (
    <div className="bg-craft-sage text-parchment-50 text-xs font-medium py-2 px-4 text-center border-b border-craft-sage-dark flex items-center justify-center gap-2 tracking-wide">
      <Sparkles className="w-3.5 h-3.5 text-amber-200 animate-pulse" />
      <span>
        Free Studio Delivery across India on orders above ₹999 • 100% Handcrafted by Artisans
      </span>
      <span className="hidden sm:inline-block text-amber-200">|</span>
      <Link
        href="/catalog"
        className="hidden sm:inline-flex items-center gap-1 underline underline-offset-2 hover:text-amber-200 font-semibold"
      >
        Explore New Folds <Heart className="w-3 h-3 fill-rose-300 text-rose-300" />
      </Link>
    </div>
  );
}
