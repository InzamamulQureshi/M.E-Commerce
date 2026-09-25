"use client";

import { useState, useEffect } from "react";

export interface CartItem {
  id: string; // generated unique cart item id (product.id + custom options hash)
  productId: string;
  title: string;
  price: number;
  image: string;
  quantity: number;
  customRecipientName?: string;
  customMessage?: string;
  waxSealColor?: string;
  giftWrapOption?: string;
  craftDays?: number;
}

export interface AppliedCoupon {
  code: string;
  discountPercent?: number;
  discountAmount?: number;
  maxDiscountAmount?: number;
}

const STORAGE_KEY = "mecommerce_cart_v1";

// Simple reactive store for Next.js client components
type Listener = () => void;
let listeners: Listener[] = [];

let cartItems: CartItem[] = [];
let appliedCoupon: AppliedCoupon | null = null;
let isDrawerOpen = false;
let shippingConfig = {
  freeShippingThreshold: 999,
  standardShippingFee: 79,
};

function notify() {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ items: cartItems, coupon: appliedCoupon })
      );
    } catch (e) {
      console.error("Failed to save cart to localStorage", e);
    }
  }
  listeners.forEach((listener) => listener());
}

if (typeof window !== "undefined") {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      cartItems = parsed.items || [];
      appliedCoupon = parsed.coupon || null;
    }
  } catch (e) {
    console.error("Failed to load cart from localStorage", e);
  }
}

export const cartStore = {
  getItems: () => cartItems,
  getCoupon: () => appliedCoupon,
  isDrawerOpen: () => isDrawerOpen,

  openDrawer: () => {
    isDrawerOpen = true;
    notify();
  },

  closeDrawer: () => {
    isDrawerOpen = false;
    notify();
  },

  toggleDrawer: () => {
    isDrawerOpen = !isDrawerOpen;
    notify();
  },

  addItem: (item: Omit<CartItem, "id">) => {
    const uniqueId = `${item.productId}-${item.customRecipientName || ""}-${item.waxSealColor || ""}-${item.giftWrapOption || ""}`;
    const existingIndex = cartItems.findIndex((i) => i.id === uniqueId);

    if (existingIndex > -1) {
      cartItems[existingIndex].quantity += item.quantity;
    } else {
      cartItems.push({ ...item, id: uniqueId });
    }
    isDrawerOpen = true; // auto open drawer on adding item
    notify();
  },

  updateQuantity: (id: string, quantity: number) => {
    if (quantity <= 0) {
      cartItems = cartItems.filter((i) => i.id !== id);
    } else {
      const item = cartItems.find((i) => i.id === id);
      if (item) item.quantity = quantity;
    }
    notify();
  },

  removeItem: (id: string) => {
    cartItems = cartItems.filter((i) => i.id !== id);
    notify();
  },

  clearCart: () => {
    cartItems = [];
    appliedCoupon = null;
    notify();
  },

  applyCoupon: (coupon: AppliedCoupon) => {
    appliedCoupon = coupon;
    notify();
  },

  removeCoupon: () => {
    appliedCoupon = null;
    notify();
  },

  setShippingConfig: (config: { freeShippingThreshold?: number; standardShippingFee?: number }) => {
    if (typeof config.freeShippingThreshold === "number" && config.freeShippingThreshold >= 0) {
      shippingConfig.freeShippingThreshold = config.freeShippingThreshold;
    }
    if (typeof config.standardShippingFee === "number" && config.standardShippingFee >= 0) {
      shippingConfig.standardShippingFee = config.standardShippingFee;
    }
    notify();
  },

  getShippingConfig: () => ({ ...shippingConfig }),

  subscribe: (listener: Listener) => {
    listeners.push(listener);
    return () => {
      listeners = listeners.filter((l) => l !== listener);
    };
  },
};

export function useCart() {
  const [, setTick] = useState(0);

  useEffect(() => {
    const unsubscribe = cartStore.subscribe(() => setTick((t) => t + 1));
    return unsubscribe;
  }, []);

  const items = cartStore.getItems();
  const coupon = cartStore.getCoupon();
  const isOpen = cartStore.isDrawerOpen();
  const { freeShippingThreshold, standardShippingFee } = cartStore.getShippingConfig();

  const count = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  let discount = 0;
  if (coupon) {
    if (coupon.discountPercent) {
      discount = Math.round((subtotal * coupon.discountPercent) / 100);
      if (coupon.maxDiscountAmount && discount > coupon.maxDiscountAmount) {
        discount = coupon.maxDiscountAmount;
      }
    } else if (coupon.discountAmount) {
      discount = Math.min(coupon.discountAmount, subtotal);
    }
  }

  const shippingFee = subtotal >= freeShippingThreshold || subtotal === 0 ? 0 : standardShippingFee;
  const total = Math.max(0, subtotal - discount + shippingFee);

  return {
    items,
    coupon,
    isOpen,
    count,
    subtotal,
    discount,
    shippingFee,
    total,
    freeShippingThreshold,
    standardShippingFee,
    openCart: cartStore.openDrawer,
    closeCart: cartStore.closeDrawer,
    toggleCart: cartStore.toggleDrawer,
    addItem: cartStore.addItem,
    updateQuantity: cartStore.updateQuantity,
    removeItem: cartStore.removeItem,
    clearCart: cartStore.clearCart,
    applyCoupon: cartStore.applyCoupon,
    removeCoupon: cartStore.removeCoupon,
    setShippingConfig: cartStore.setShippingConfig,
  };
}
