"use client";

import { useState } from "react";
import { useCart } from "@/lib/cart-store";
import { formatCurrency } from "@/lib/utils";
import { ShoppingBag, Check } from "lucide-react";

export interface ProductCustomizerProps {
  product: {
    id: string;
    title: string;
    price: number | string | any;
    images: string;
    stock: number;
    allowsCustomNote: boolean;
    allowsWaxSeal: boolean;
    craftDays?: number;
  };
  enableWaxSeal?: boolean;
  enableGiftWrap?: boolean;
}

const WAX_SEAL_OPTIONS = [
  { name: "Antique Crimson", color: "#7A1C1C" },
  { name: "Imperial Gold", color: "#C59B35" },
  { name: "Forest Sage", color: "#2E4734" },
  { name: "Rose Blush", color: "#B86657" },
];

const GIFT_WRAP_OPTIONS = [
  { name: "Studio Kraft & Jute Twine", price: 0, desc: "Recycled kraft housing tied with natural jute twine." },
  { name: "Botanical Pressed Wrap", price: 49, desc: "Hand-wrapped parchment with dried wildflower sprigs." },
  { name: "Satin Ribbon & Wax Seal", price: 89, desc: "Luxe emerald ribbon tied with custom hot wax stamp." },
];

export function ProductCustomizer({
  product,
  enableWaxSeal = true,
  enableGiftWrap = true,
}: ProductCustomizerProps) {
  const { addItem, openCart } = useCart();
  const [recipientName, setRecipientName] = useState("");
  const [personalMessage, setPersonalMessage] = useState("");
  const [selectedWax, setSelectedWax] = useState(WAX_SEAL_OPTIONS[0]);
  const [selectedWrap, setSelectedWrap] = useState(GIFT_WRAP_OPTIONS[0]);
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);

  let imageList: string[] = [];
  try {
    imageList = JSON.parse(product.images);
  } catch {
    imageList = product.images ? product.images.split(",") : [];
  }
  const mainImage = imageList[0] || "";
  const wrapPrice = enableGiftWrap ? selectedWrap.price : 0;
  const unitPrice = Number(product.price) + wrapPrice;
  const totalPrice = unitPrice * quantity;

  const handleAddToCart = () => {
    if (product.stock <= 0) return;
    setIsAdding(true);
    addItem({
      productId: product.id,
      title: product.title,
      price: unitPrice,
      image: mainImage,
      quantity,
      customRecipientName: recipientName.trim() || undefined,
      customMessage: personalMessage.trim() || undefined,
      waxSealColor: enableWaxSeal && product.allowsWaxSeal ? selectedWax.name : undefined,
      giftWrapOption: enableGiftWrap ? selectedWrap.name : undefined,
      craftDays: product.craftDays,
    });

    setTimeout(() => {
      setIsAdding(false);
      openCart();
    }, 300);
  };

  const hasWaxSeal = Boolean(enableWaxSeal && product.allowsWaxSeal);
  const hasCustomNote = Boolean(product.allowsCustomNote);
  const hasGiftWrap = Boolean(enableGiftWrap);
  const hasPersonalization = hasWaxSeal || hasCustomNote;
  const hasAnyCustomization = hasPersonalization || hasGiftWrap;

  return (
    <div className="space-y-6 pt-6 border-t border-border">
      {/* Top Status Row */}
      <div className="flex items-center justify-between">
        {hasAnyCustomization ? (
          <span className="text-[10px] uppercase tracking-[0.2em] text-accent font-semibold block">
            {hasPersonalization ? "Bespoke Customization" : "Gift Wrap & Packaging"}
          </span>
        ) : (
          <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-semibold block">
            Studio Selection
          </span>
        )}
        <span
          className={`text-xs font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
            product.stock > 0
              ? "text-emerald-700 dark:text-emerald-400 bg-emerald-500/10"
              : "text-neutral-600 dark:text-neutral-400 bg-neutral-200 dark:bg-neutral-800"
          }`}
        >
          {product.stock > 0 ? `In Stock (${product.stock} available)` : "Out of Stock"}
        </span>
      </div>

      {/* Recipient Name (Only rendered if personalized scribed message / dedication is allowed) */}
      {hasCustomNote && (
        <div className="space-y-1.5">
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-foreground">
            Recipient Name or Initials <span className="text-muted-foreground lowercase">(optional)</span>
          </label>
          <input
            type="text"
            value={recipientName}
            onChange={(e) => setRecipientName(e.target.value)}
            placeholder="e.g. Vikram & Ananya, or Sneha"
            maxLength={50}
            className="w-full h-11 px-3.5 text-xs bg-card rounded-xl border border-border text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-foreground"
          />
        </div>
      )}

      {/* Wax Seal Option (if applicable & enabled) */}
      {hasWaxSeal && (
        <div className="space-y-2">
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-foreground">
            Hot Wax Seal Color: <span className="font-semibold text-accent">{selectedWax.name}</span>
          </label>
          <div className="flex items-center gap-3">
            {WAX_SEAL_OPTIONS.map((w) => {
              const isSelected = selectedWax.name === w.name;
              return (
                <button
                  type="button"
                  key={w.name}
                  onClick={() => setSelectedWax(w)}
                  className={`w-7 h-7 rounded-full transition-transform flex items-center justify-center ${
                    isSelected ? "scale-110 ring-2 ring-offset-2 ring-primary ring-offset-background" : "opacity-85 hover:opacity-100"
                  }`}
                  style={{ backgroundColor: w.color }}
                  title={w.name}
                >
                  {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Gift Wrap Choice (if enabled) */}
      {enableGiftWrap && (
        <div className="space-y-2">
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-foreground">
            Packaging & Gift Wrapping
          </label>
          <div className="space-y-2">
            {GIFT_WRAP_OPTIONS.map((wrap) => {
              const isSelected = selectedWrap.name === wrap.name;
              return (
                <div
                  key={wrap.name}
                  onClick={() => setSelectedWrap(wrap)}
                  className={`p-3.5 border rounded-xl cursor-pointer transition-colors flex items-center justify-between text-xs ${
                    isSelected
                      ? "border-foreground bg-accent/10"
                      : "border-border bg-card/60 hover:border-foreground/50"
                  }`}
                >
                  <div>
                    <div className="font-semibold text-foreground flex items-center gap-2">
                      <span>{wrap.name}</span>
                      {wrap.price > 0 && (
                        <span className="text-[10px] font-semibold text-accent">
                          (+{formatCurrency(wrap.price)})
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{wrap.desc}</p>
                  </div>
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0 ml-3 ${
                      isSelected ? "border-foreground bg-primary" : "border-border"
                    }`}
                  >
                    {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-primary-foreground" />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Custom Note */}
      {product.allowsCustomNote && (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-foreground">
              Personalized Scribed Message <span className="text-muted-foreground lowercase">(optional)</span>
            </label>
            <span className="text-[10px] font-medium text-muted-foreground">
              {personalMessage.length}/300
            </span>
          </div>
          <textarea
            rows={3}
            value={personalMessage}
            onChange={(e) => setPersonalMessage(e.target.value)}
            placeholder="Write the exact words you would like us to hand-letter inside your gift..."
            maxLength={300}
            className="w-full p-3.5 text-xs bg-card rounded-xl border border-border text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-foreground"
          />
        </div>
      )}

      {/* Quantity & Add to Cart */}
      <div className="pt-4 border-t border-border flex items-center gap-4">
        <div className="flex items-center border border-border bg-secondary rounded-full overflow-hidden h-12">
          <button
            type="button"
            disabled={product.stock <= 0 || quantity <= 1}
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="px-4 text-xs text-foreground hover:text-accent disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            -
          </button>
          <span className="px-3 text-xs font-semibold text-foreground">
            {product.stock <= 0 ? 0 : quantity}
          </span>
          <button
            type="button"
            disabled={product.stock <= 0 || quantity >= product.stock}
            onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
            className="px-4 text-xs text-foreground hover:text-accent disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            +
          </button>
        </div>

        <button
          type="button"
          onClick={handleAddToCart}
          disabled={isAdding || product.stock <= 0}
          className={`flex-1 h-12 text-xs font-semibold uppercase tracking-wider rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm ${
            product.stock <= 0
              ? "bg-secondary text-muted-foreground cursor-not-allowed shadow-none"
              : "bg-primary text-primary-foreground hover:bg-accent hover:text-accent-foreground"
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>
            {product.stock <= 0
              ? "Sold Out"
              : isAdding
              ? "Adding..."
              : `Add to Bag • ${formatCurrency(totalPrice)}`}
          </span>
        </button>
      </div>
    </div>
  );
}
