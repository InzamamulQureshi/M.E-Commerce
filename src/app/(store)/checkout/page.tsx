"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/lib/cart-store";
import { formatCurrency } from "@/lib/utils";
import {
  ShieldCheck,
  QrCode,
  Banknote,
  CreditCard,
  ArrowRight,
  User,
  Lock,
  RefreshCw,
  KeyRound,
  AlertCircle,
  Check,
} from "lucide-react";
import { notifyAuthChange } from "@/lib/auth-client";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, discount, shippingFee, total, coupon, clearCart } = useCart();

  // User auth state
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [authChecking, setAuthChecking] = useState(true);

  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [selectedSavedAddressId, setSelectedSavedAddressId] = useState<string | null>(null);
  const [orderNotes, setOrderNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"UPI_QR" | "COD" | "ONLINE_CARD">("UPI_QR");
  const [paymentRef, setPaymentRef] = useState("");
  const [studioSettings, setStudioSettings] = useState({
    upiId: process.env.NEXT_PUBLIC_UPI_ID || "thefourfold@oksbi",
    upiName: process.env.NEXT_PUBLIC_UPI_NAME || "The Fourfold Craft Studio",
    enableUpi: true,
    enableCod: true,
    codInstructions: null as string | null,
    currencyCode: "INR",
    currencySymbol: "₹",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Inline auth states if user not logged in
  const [authMode, setAuthMode] = useState<"login" | "register" | "verify">("login");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authName, setAuthName] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [devCodeHint, setDevCodeHint] = useState("");
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  useEffect(() => {
    checkUser();
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => {
        if (data?.settings) {
          const s = data.settings;
          const upi = s.enableUpi ?? true;
          let cod = s.enableCod ?? true;
          if (!upi && !cod) cod = true; // Safe fallback

          setStudioSettings({
            upiId: s.upiId || "thefourfold@oksbi",
            upiName: s.upiName || "The Fourfold Craft Studio",
            enableUpi: upi,
            enableCod: cod,
            codInstructions: s.codInstructions || null,
            currencyCode: s.currencyCode || "INR",
            currencySymbol: s.currencySymbol || "₹",
          });

          // Select first available payment method
          if (upi) {
            setPaymentMethod("UPI_QR");
          } else if (cod) {
            setPaymentMethod("COD");
          }
        }
      })
      .catch(() => {});
  }, []);

  const applyAddress = (addr: any) => {
    setSelectedSavedAddressId(addr.id || "custom");
    if (addr.name) setName(addr.name);
    if (addr.phone) setPhone(addr.phone);
    if (addr.street || addr.address) setAddress(addr.street || addr.address);
    setCity(addr.city || "");
    setState(addr.state || "");
    setPostalCode(addr.postalCode || "");
  };

  const checkUser = async () => {
    try {
      const res = await fetch("/api/auth/profile");
      if (res.ok) {
        const data = await res.json();
        if (data?.user) {
          setCurrentUser(data.user);
          notifyAuthChange(data.user);

          const savedAddresses = data.user.addresses || [];
          const defaultAddr = savedAddresses.find((a: any) => a.isDefault) || savedAddresses[0];

          if (defaultAddr) {
            setSelectedSavedAddressId(defaultAddr.id);
            setName(defaultAddr.name || data.user.name || "");
            setEmail(data.user.email || "");
            setPhone(defaultAddr.phone || data.user.phone || "");
            setAddress(defaultAddr.street || data.user.address || "");
            setCity(defaultAddr.city || data.user.city || "");
            setState(defaultAddr.state || data.user.state || "");
            setPostalCode(defaultAddr.postalCode || data.user.postalCode || "");
          } else {
            setSelectedSavedAddressId(null);
            setName(data.user.name || "");
            setEmail(data.user.email || "");
            setPhone(data.user.phone || "");
            setAddress(data.user.address || "");
            setCity(data.user.city || "");
            setState(data.user.state || "");
            setPostalCode(data.user.postalCode || "");
          }
        }
      }
    } catch {
      console.error("Auth check failed");
    } finally {
      setAuthChecking(false);
    }
  };

  const handleInlineLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setAuthLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: authEmail, password: authPassword }),
      });
      const data = await res.json();

      if (!res.ok) {
        if (data.requiresVerification) {
          setAuthMode("verify");
          setAuthError("Email verification required. Code sent to your inbox.");
          setDevCodeHint(data.devCode || "");
        } else {
          setAuthError(data.error || "Login failed");
        }
      } else {
        if (data.user) notifyAuthChange(data.user);
        await checkUser();
      }
    } catch {
      setAuthError("Network error. Please try again.");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleInlineRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setAuthLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: authName, email: authEmail, password: authPassword }),
      });
      const data = await res.json();

      if (!res.ok) {
        setAuthError(data.error || "Registration failed");
      } else {
        setAuthMode("verify");
        setAuthError("Verification code sent to your email!");
        setDevCodeHint(data.devCode || "");
      }
    } catch {
      setAuthError("Network error. Please try again.");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleInlineVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setAuthLoading(true);

    try {
      const res = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: authEmail, code: verificationCode }),
      });
      const data = await res.json();

      if (!res.ok) {
        setAuthError(data.error || "Verification failed");
      } else {
        if (data.user) notifyAuthChange(data.user);
        await checkUser();
      }
    } catch {
      setAuthError("Network error. Please try again.");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;

    if (!name.trim() || !email.trim() || !phone.trim() || !address.trim() || !city.trim() || !postalCode.trim()) {
      setErrorMessage("Please complete all shipping address fields.");
      return;
    }

    if (paymentMethod === "UPI_QR") {
      const cleanUtr = paymentRef.trim();
      if (!cleanUtr || !/^\d{12}$/.test(cleanUtr)) {
        setErrorMessage("Please enter a valid 12-digit numeric UPI Transaction ID (UTR numbers only).");
        return;
      }
    }

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: name.trim(),
          customerEmail: email.trim(),
          customerPhone: phone.trim(),
          shippingAddress: address.trim(),
          city: city.trim(),
          state: state.trim(),
          postalCode: postalCode.trim(),
          orderNotes: orderNotes.trim() || undefined,
          paymentMethod,
          paymentRef: paymentMethod === "UPI_QR" ? paymentRef.trim() : undefined,
          couponCode: coupon ? coupon.code : undefined,
          items: items.map((i) => ({
            productId: i.productId,
            productTitle: i.title,
            price: i.price,
            quantity: i.quantity,
            selectedImage: i.image,
            customRecipientName: i.customRecipientName,
            customMessage: i.customMessage,
            waxSealColor: i.waxSealColor,
            giftWrapOption: i.giftWrapOption,
          })),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || "Failed to place order.");
      } else {
        clearCart();
        router.push(`/order-confirmation/${data.order.id}`);
      }
    } catch {
      setErrorMessage("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center space-y-6">
        <h1 className="text-3xl font-bold tracking-tight text-[#181513] dark:text-[#FAF8F5]">
          No Items in Bag
        </h1>
        <p className="text-xs text-[#786F64] dark:text-[#A89F91]">
          Your bag is empty. Please add gifts before checking out.
        </p>
        <Link
          href="/catalog"
          className="inline-flex items-center gap-2 px-8 py-4 bg-[#181513] dark:bg-[#FAF8F5] text-[#FAF8F5] dark:text-[#181513] rounded-full text-xs font-semibold uppercase tracking-widest hover:bg-[#A64732] dark:hover:bg-[#E07A5F] dark:hover:text-white transition-colors shadow-xs"
        >
          <span>Browse Gifts</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-8">
      <div className="pb-6 border-b border-[#E7E0D5] dark:border-[#2E2925]">
        <span className="text-[10px] uppercase tracking-[0.2em] text-[#A64732] dark:text-[#E07A5F] font-semibold block">
          Secure Checkout
        </span>
        <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-[#181513] dark:text-[#FAF8F5] mt-1">
          Complete Your Order
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left Column: Client Auth Gate or Address Form */}
        <div className="lg:col-span-7 space-y-8">
          {/* 1. Client Identity Confirmation */}
          {!currentUser ? (
            <div className="p-6 bg-[#FAF8F5] dark:bg-[#1A1715] border border-[#E5DFD4] dark:border-[#2E2925] rounded-2xl space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-[#EAE3D8] dark:border-[#2E2925]">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-[#A64732] dark:text-[#E07A5F]" />
                  <h3 className="font-bold tracking-tight text-lg text-[#181513] dark:text-[#FAF8F5]">
                    Customer Sign In
                  </h3>
                </div>
                <div className="flex gap-2 text-xs font-medium">
                  <button
                    onClick={() => { setAuthMode("login"); setAuthError(""); }}
                    className={`px-3 py-1 rounded-full ${authMode === "login" ? "bg-[#181513] dark:bg-[#FAF8F5] text-[#FAF8F5] dark:text-[#181513]" : "text-[#786F64] dark:text-[#A89F91] hover:text-[#181513] dark:hover:text-[#FAF8F5]"}`}
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => { setAuthMode("register"); setAuthError(""); }}
                    className={`px-3 py-1 rounded-full ${authMode === "register" ? "bg-[#181513] dark:bg-[#FAF8F5] text-[#FAF8F5] dark:text-[#181513]" : "text-[#786F64] dark:text-[#A89F91] hover:text-[#181513] dark:hover:text-[#FAF8F5]"}`}
                  >
                    Register
                  </button>
                </div>
              </div>

              {authError && (
                <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-300 text-xs font-medium rounded-xl">
                  {authError}
                  {devCodeHint && <div className="mt-1 font-bold">Verification code: {devCodeHint}</div>}
                </div>
              )}

              {authMode === "login" && (
                <form onSubmit={handleInlineLogin} className="space-y-3">
                  <div>
                    <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#181513] dark:text-[#FAF8F5] mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={authEmail}
                      onChange={(e) => setAuthEmail(e.target.value)}
                      placeholder="your.email@example.com"
                      className="w-full h-10 px-3 text-xs bg-[#F2EDE4] dark:bg-[#12100E] border border-[#DDD5C7] dark:border-[#2E2925] rounded-xl text-[#181513] dark:text-[#FAF8F5] focus:outline-none focus:border-[#181513] dark:focus:border-[#FAF8F5]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#181513] dark:text-[#FAF8F5] mb-1">
                      Password
                    </label>
                    <input
                      type="password"
                      required
                      value={authPassword}
                      onChange={(e) => setAuthPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full h-10 px-3 text-xs bg-[#F2EDE4] dark:bg-[#12100E] border border-[#DDD5C7] dark:border-[#2E2925] rounded-xl text-[#181513] dark:text-[#FAF8F5] focus:outline-none focus:border-[#181513] dark:focus:border-[#FAF8F5]"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={authLoading}
                    className="w-full h-11 bg-[#181513] dark:bg-[#FAF8F5] text-[#FAF8F5] dark:text-[#181513] rounded-xl text-xs font-semibold uppercase tracking-widest hover:bg-[#A64732] dark:hover:bg-[#E07A5F] dark:hover:text-white transition-colors"
                  >
                    {authLoading ? "Authenticating..." : "Sign In & Continue"}
                  </button>
                </form>
              )}

              {authMode === "register" && (
                <form onSubmit={handleInlineRegister} className="space-y-3">
                  <div>
                    <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#181513] dark:text-[#FAF8F5] mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={authName}
                      onChange={(e) => setAuthName(e.target.value)}
                      placeholder="Ananya Sharma"
                      className="w-full h-10 px-3 text-xs bg-[#F2EDE4] dark:bg-[#12100E] border border-[#DDD5C7] dark:border-[#2E2925] rounded-xl text-[#181513] dark:text-[#FAF8F5] focus:outline-none focus:border-[#181513] dark:focus:border-[#FAF8F5]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#181513] dark:text-[#FAF8F5] mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={authEmail}
                      onChange={(e) => setAuthEmail(e.target.value)}
                      placeholder="ananya@example.com"
                      className="w-full h-10 px-3 text-xs bg-[#F2EDE4] dark:bg-[#12100E] border border-[#DDD5C7] dark:border-[#2E2925] rounded-xl text-[#181513] dark:text-[#FAF8F5] focus:outline-none focus:border-[#181513] dark:focus:border-[#FAF8F5]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#181513] dark:text-[#FAF8F5] mb-1">
                      Create Password
                    </label>
                    <input
                      type="password"
                      required
                      value={authPassword}
                      onChange={(e) => setAuthPassword(e.target.value)}
                      placeholder="Minimum 6 characters"
                      className="w-full h-10 px-3 text-xs bg-[#F2EDE4] dark:bg-[#12100E] border border-[#DDD5C7] dark:border-[#2E2925] rounded-xl text-[#181513] dark:text-[#FAF8F5] focus:outline-none focus:border-[#181513] dark:focus:border-[#FAF8F5]"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={authLoading}
                    className="w-full h-11 bg-[#181513] dark:bg-[#FAF8F5] text-[#FAF8F5] dark:text-[#181513] rounded-xl text-xs font-semibold uppercase tracking-widest hover:bg-[#A64732] dark:hover:bg-[#E07A5F] dark:hover:text-white transition-colors"
                  >
                    {authLoading ? "Creating Account..." : "Create Account & Verify"}
                  </button>
                </form>
              )}

              {authMode === "verify" && (
                <form onSubmit={handleInlineVerify} className="space-y-3">
                  <div>
                    <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#181513] dark:text-[#FAF8F5] mb-1">
                      Enter 6-Digit Email Verification Code
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                      placeholder="123456"
                      className="w-full h-11 text-center font-bold tracking-[0.5em] text-sm bg-[#F2EDE4] dark:bg-[#12100E] border border-[#DDD5C7] dark:border-[#2E2925] rounded-xl text-[#181513] dark:text-[#FAF8F5] focus:outline-none focus:border-[#181513] dark:focus:border-[#FAF8F5]"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={authLoading}
                    className="w-full h-11 bg-[#181513] dark:bg-[#FAF8F5] text-[#FAF8F5] dark:text-[#181513] rounded-xl text-xs font-semibold uppercase tracking-widest hover:bg-[#A64732] dark:hover:bg-[#E07A5F] dark:hover:text-white transition-colors"
                  >
                    {authLoading ? "Verifying..." : "Verify Code & Continue"}
                  </button>
                </form>
              )}
            </div>
          ) : (
            <div className="p-4 bg-[#F2EDE4] dark:bg-[#1A1715] border border-[#DDD5C7] dark:border-[#2E2925] rounded-xl flex items-center justify-between text-xs font-medium">
              <div>
                <span className="text-[#8C8276] dark:text-[#8E8478] uppercase">Signed In As: </span>
                <strong className="text-[#181513] dark:text-[#FAF8F5]">{currentUser.name}</strong> ({currentUser.email})
              </div>
              <span className="text-emerald-800 dark:text-emerald-400 font-semibold">✓ Verified Customer</span>
            </div>
          )}

          {/* 2. Shipping Address Details */}
          <form id="checkout-form" onSubmit={handleSubmitOrder} className="space-y-6">
            <div className="p-6 bg-[#FAF8F5] dark:bg-[#1A1715] border border-[#E5DFD4] dark:border-[#2E2925] rounded-2xl space-y-4">
              <span className="text-[10px] uppercase tracking-[0.2em] text-[#A64732] dark:text-[#E07A5F] font-semibold block">
                Destination
              </span>
              <h3 className="font-bold tracking-tight text-xl text-[#181513] dark:text-[#FAF8F5] pb-3 border-b border-[#EAE3D8] dark:border-[#2E2925]">
                Shipping Address
              </h3>

              {/* Saved Account Addresses Selector */}
              {currentUser?.addresses && currentUser.addresses.length > 0 && (
                <div className="space-y-2 pb-3 border-b border-[#EAE3D8] dark:border-[#2E2925]">
                  <div className="flex items-center justify-between">
                    <span className="text-[10.5px] font-bold text-[#181513] dark:text-[#FAF8F5] uppercase tracking-wider flex items-center gap-1.5">
                      <span>📍</span> Saved Account Addresses
                    </span>
                    <span className="text-[10px] text-[#786F64] dark:text-[#A89F91]">
                      Click to auto-fill
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {currentUser.addresses.map((saved: any) => {
                      const isSelected = selectedSavedAddressId === saved.id;
                      return (
                        <button
                          key={saved.id}
                          type="button"
                          onClick={() => applyAddress(saved)}
                          className={`p-2.5 sm:p-3 text-left rounded-xl border transition-all cursor-pointer ${
                            isSelected
                              ? "bg-white dark:bg-[#201D1A] border-[#A64732] dark:border-[#E07A5F] ring-1 ring-[#A64732]/40 dark:ring-[#E07A5F]/40 shadow-xs"
                              : "bg-[#F2EDE4]/60 dark:bg-[#151210] border-[#DDD5C7] dark:border-[#2E2925] hover:border-[#181513] dark:hover:border-[#FAF8F5]"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-1 mb-1">
                            <span className="font-bold text-xs text-[#181513] dark:text-[#FAF8F5] flex items-center gap-1">
                              <span>{saved.tag === "Work" ? "🏢" : "🏠"}</span>
                              <span>{saved.tag || "Saved Address"}</span>
                            </span>
                            {saved.isDefault && (
                              <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                                Default
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] font-medium text-[#181513] dark:text-[#FAF8F5] truncate">
                            {saved.name} • {saved.phone}
                          </p>
                          <p className="text-[10.5px] text-[#786F64] dark:text-[#A89F91] line-clamp-2 mt-0.5 leading-relaxed">
                            {saved.street}, {saved.city}, {saved.state} - {saved.postalCode}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#181513] dark:text-[#FAF8F5] mb-1">
                    Recipient Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      setSelectedSavedAddressId(null);
                    }}
                    placeholder="Recipient's Name"
                    className="w-full h-10 px-3 text-xs bg-[#F2EDE4] dark:bg-[#12100E] border border-[#DDD5C7] dark:border-[#2E2925] rounded-xl text-[#181513] dark:text-[#FAF8F5] focus:outline-none focus:border-[#181513] dark:focus:border-[#FAF8F5]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#181513] dark:text-[#FAF8F5] mb-1">
                    Contact Phone *
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      setSelectedSavedAddressId(null);
                    }}
                    placeholder="10-digit mobile"
                    className="w-full h-10 px-3 text-xs bg-[#F2EDE4] dark:bg-[#12100E] border border-[#DDD5C7] dark:border-[#2E2925] rounded-xl text-[#181513] dark:text-[#FAF8F5] focus:outline-none focus:border-[#181513] dark:focus:border-[#FAF8F5]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#181513] dark:text-[#FAF8F5] mb-1">
                  Email Address (for tracking notifications) *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="contact@example.com"
                  className="w-full h-10 px-3 text-xs bg-[#F2EDE4] dark:bg-[#12100E] border border-[#DDD5C7] dark:border-[#2E2925] rounded-xl text-[#181513] dark:text-[#FAF8F5] focus:outline-none focus:border-[#181513] dark:focus:border-[#FAF8F5]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#181513] dark:text-[#FAF8F5] mb-1">
                  Flat, House No., Street, Landmark *
                </label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => {
                    setAddress(e.target.value);
                    setSelectedSavedAddressId(null);
                  }}
                  placeholder="e.g. Flat 402, Lotus Court, MG Road"
                  className="w-full h-10 px-3 text-xs bg-[#F2EDE4] dark:bg-[#12100E] border border-[#DDD5C7] dark:border-[#2E2925] rounded-xl text-[#181513] dark:text-[#FAF8F5] focus:outline-none focus:border-[#181513] dark:focus:border-[#FAF8F5]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#181513] dark:text-[#FAF8F5] mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => {
                      setCity(e.target.value);
                      setSelectedSavedAddressId(null);
                    }}
                    placeholder="e.g. Mumbai, Bengaluru, Delhi"
                    className="w-full h-10 px-3 text-xs bg-[#F2EDE4] dark:bg-[#12100E] border border-[#DDD5C7] dark:border-[#2E2925] rounded-xl text-[#181513] dark:text-[#FAF8F5] focus:outline-none focus:border-[#181513] dark:focus:border-[#FAF8F5]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#181513] dark:text-[#FAF8F5] mb-1">
                    State *
                  </label>
                  <input
                    type="text"
                    required
                    value={state}
                    onChange={(e) => {
                      setState(e.target.value);
                      setSelectedSavedAddressId(null);
                    }}
                    placeholder="e.g. Maharashtra, Karnataka, Delhi"
                    className="w-full h-10 px-3 text-xs bg-[#F2EDE4] dark:bg-[#12100E] border border-[#DDD5C7] dark:border-[#2E2925] rounded-xl text-[#181513] dark:text-[#FAF8F5] focus:outline-none focus:border-[#181513] dark:focus:border-[#FAF8F5]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#181513] dark:text-[#FAF8F5] mb-1">
                    Postal Code (PIN) *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={postalCode}
                    onChange={(e) => {
                      setPostalCode(e.target.value);
                      setSelectedSavedAddressId(null);
                    }}
                    placeholder="6-digit PIN code"
                    className="w-full h-10 px-3 text-xs bg-[#F2EDE4] dark:bg-[#12100E] border border-[#DDD5C7] dark:border-[#2E2925] rounded-xl text-[#181513] dark:text-[#FAF8F5] focus:outline-none focus:border-[#181513] dark:focus:border-[#FAF8F5]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#181513] dark:text-[#FAF8F5] mb-1">
                  Special Delivery Instructions <span className="text-[#8C8276] dark:text-[#8E8478] lowercase">(optional)</span>
                </label>
                <textarea
                  rows={2}
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  placeholder="Gate code, landmark notes, or preferred delivery timing..."
                  className="w-full p-3 text-xs bg-[#F2EDE4] dark:bg-[#12100E] border border-[#DDD5C7] dark:border-[#2E2925] rounded-xl text-[#181513] dark:text-[#FAF8F5] focus:outline-none focus:border-[#181513] dark:focus:border-[#FAF8F5]"
                />
              </div>
            </div>

            {/* 3. Payment Method Selection */}
            <div className="p-6 bg-[#FAF8F5] dark:bg-[#1A1715] border border-[#E5DFD4] dark:border-[#2E2925] rounded-2xl space-y-4">
              <span className="text-[10px] uppercase tracking-[0.2em] text-[#A64732] dark:text-[#E07A5F] font-semibold block">
                Payment
              </span>
              <h3 className="font-bold tracking-tight text-xl text-[#181513] dark:text-[#FAF8F5] pb-3 border-b border-[#EAE3D8] dark:border-[#2E2925]">
                Select Payment Mode
              </h3>

              <div className="space-y-3">
                {/* UPI QR Option (Conditionally Rendered) */}
                {studioSettings.enableUpi && (
                  <div
                    onClick={() => setPaymentMethod("UPI_QR")}
                    className={`p-4 border rounded-xl cursor-pointer transition-colors ${
                      paymentMethod === "UPI_QR"
                        ? "border-[#181513] dark:border-[#FAF8F5] bg-[#FAF8F5] dark:bg-[#221E1B]"
                        : "border-[#E5DFD4] dark:border-[#2E2925] bg-[#F7F3EB] dark:bg-[#1A1715]"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <QrCode className="w-5 h-5 text-[#A64732] dark:text-[#E07A5F]" />
                        <div>
                          <div className="font-semibold text-sm text-[#181513] dark:text-[#FAF8F5]">
                            Instant UPI QR Transfer
                          </div>
                          <div className="text-[11px] text-[#786F64] dark:text-[#A89F91]">
                            Scan via GPay, PhonePe, Paytm or BHIM
                          </div>
                        </div>
                      </div>
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          paymentMethod === "UPI_QR"
                            ? "border-[#181513] dark:border-[#FAF8F5] bg-[#181513] dark:bg-[#FAF8F5]"
                            : "border-[#DDD5C7] dark:border-[#38322D]"
                        }`}
                      >
                        {paymentMethod === "UPI_QR" && (
                          <div className="w-1.5 h-1.5 rounded-full bg-white dark:bg-[#181513]" />
                        )}
                      </div>
                    </div>

                    {paymentMethod === "UPI_QR" && (
                      <div className="mt-4 pt-4 border-t border-[#EAE3D8] dark:border-[#2E2925] space-y-3">
                        <div className="p-4 bg-[#F2EDE4] dark:bg-[#12100E] border border-[#DDD5C7] dark:border-[#2E2925] rounded-xl flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
                          <div className="w-28 h-28 bg-white border border-[#DDD5C7] dark:border-[#2E2925] rounded-lg p-2 flex items-center justify-center flex-shrink-0 relative">
                            <Image
                              src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=upi://pay?pa=${encodeURIComponent(
                                studioSettings.upiId
                              )}&pn=${encodeURIComponent(studioSettings.upiName)}&am=${total}&cu=${
                                studioSettings.currencyCode || "INR"
                              }`}
                              alt="Scan UPI QR"
                              width={112}
                              height={112}
                              unoptimized
                              className="w-full h-full object-contain"
                            />
                          </div>
                          <div className="space-y-1 text-xs font-medium">
                            <div className="text-[#181513] dark:text-[#FAF8F5] font-bold">
                              UPI ID: {studioSettings.upiId}
                            </div>
                            <div className="text-[#575048] dark:text-[#DCD5CB]">
                              Payee: {studioSettings.upiName}
                            </div>
                            <div className="text-[#575048] dark:text-[#DCD5CB]">
                              Total Payable:{" "}
                              {formatCurrency(total, studioSettings.currencyCode, studioSettings.currencySymbol)}
                            </div>
                            <div className="text-[11px] text-[#A64732] dark:text-[#E07A5F] font-medium">
                              Scan using GPay, PhonePe, Paytm or BHIM, complete payment, and enter the 12-digit UTR below.
                            </div>
                          </div>
                        </div>

                        <div>
                          <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#181513] dark:text-[#FAF8F5] mb-1">
                            12-Digit UPI Transaction ID / UTR Number *
                          </label>
                          <input
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]{12}"
                            maxLength={12}
                            required
                            value={paymentRef}
                            onChange={(e) => setPaymentRef(e.target.value.replace(/\D/g, "").slice(0, 12))}
                            placeholder="e.g. 425612349876 (12 numeric digits)"
                            className="w-full h-10 px-3 text-xs font-mono font-semibold tracking-wider bg-white dark:bg-[#12100E] border border-[#DDD5C7] dark:border-[#2E2925] rounded-xl text-[#181513] dark:text-[#FAF8F5] focus:outline-none focus:border-[#181513] dark:focus:border-[#FAF8F5]"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Cash on Delivery (Conditionally Rendered or Safe Fallback) */}
                {(studioSettings.enableCod || !studioSettings.enableUpi) && (
                  <div
                    onClick={() => setPaymentMethod("COD")}
                    className={`p-4 border rounded-xl cursor-pointer transition-colors ${
                      paymentMethod === "COD"
                        ? "border-[#181513] dark:border-[#FAF8F5] bg-[#FAF8F5] dark:bg-[#221E1B]"
                        : "border-[#E5DFD4] dark:border-[#2E2925] bg-[#F7F3EB] dark:bg-[#1A1715]"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Banknote className="w-5 h-5 text-[#181513] dark:text-[#FAF8F5]" />
                        <div>
                          <div className="font-semibold text-sm text-[#181513] dark:text-[#FAF8F5]">
                            Cash on Delivery (COD)
                          </div>
                          <div className="text-[11px] text-[#786F64] dark:text-[#A89F91]">
                            Pay cash upon courier arrival
                          </div>
                        </div>
                      </div>
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          paymentMethod === "COD"
                            ? "border-[#181513] dark:border-[#FAF8F5] bg-[#181513] dark:bg-[#FAF8F5]"
                            : "border-[#DDD5C7] dark:border-[#38322D]"
                        }`}
                      >
                        {paymentMethod === "COD" && (
                          <div className="w-1.5 h-1.5 rounded-full bg-white dark:bg-[#181513]" />
                        )}
                      </div>
                    </div>

                    {paymentMethod === "COD" && studioSettings.codInstructions && (
                      <div className="mt-3 p-3 bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 rounded-xl text-amber-900 dark:text-amber-200 text-xs flex items-start gap-2 animate-in fade-in-50 duration-150">
                        <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                        <div>
                          <strong className="font-semibold block">COD Note from Studio:</strong>
                          <span className="leading-relaxed">{studioSettings.codInstructions}</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {errorMessage && (
                <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-xs rounded-xl">
                  {errorMessage}
                </div>
              )}
            </div>
          </form>
        </div>

        {/* Right Column: Sticky Order Summary & Submit Button */}
        <div className="lg:col-span-5 bg-[#FAF8F5] dark:bg-[#1A1715] p-6 border border-[#E5DFD4] dark:border-[#2E2925] rounded-2xl space-y-6 sticky top-28">
          <div>
            <span className="text-[10px] uppercase tracking-[0.2em] text-[#A64732] dark:text-[#E07A5F] font-semibold block">
              Summary
            </span>
            <h3 className="font-bold tracking-tight text-xl text-[#181513] dark:text-[#FAF8F5] mt-1 pb-3 border-b border-[#EAE3D8] dark:border-[#2E2925]">
              Your Selected Items ({items.length})
            </h3>
          </div>

          <div className="divide-y divide-[#EFE9DF] dark:divide-[#2E2925] max-h-72 overflow-y-auto pr-1">
            {items.map((item) => (
              <div key={item.id} className="py-3 flex items-center gap-3 text-xs">
                <div className="relative w-12 h-12 rounded-xl bg-[#F0EBE2] dark:bg-[#201C19] border border-[#DDD5C7] dark:border-[#2E2925] overflow-hidden flex-shrink-0">
                  {item.image && <Image src={item.image} alt="" fill unoptimized className="object-cover" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-[#181513] dark:text-[#FAF8F5] truncate">{item.title}</div>
                  <div className="text-[11px] text-[#786F64] dark:text-[#A89F91] font-medium">Qty: {item.quantity}</div>
                </div>
                <div className="font-semibold text-[#181513] dark:text-[#FAF8F5]">
                  {formatCurrency(item.price * item.quantity)}
                </div>
              </div>
            ))}
          </div>

          {/* Pricing Totals */}
          <div className="space-y-2 text-xs font-medium uppercase tracking-wider text-[#6E665D] dark:text-[#A89F91] pt-4 border-t border-[#EAE3D8] dark:border-[#2E2925]">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="text-[#181513] dark:text-[#FAF8F5] font-semibold">{formatCurrency(subtotal)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-[#A64732] dark:text-[#E07A5F]">
                <span>Discount ({coupon?.code})</span>
                <span>-{formatCurrency(discount)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Delivery</span>
              <span>{shippingFee === 0 ? "Complimentary" : formatCurrency(shippingFee)}</span>
            </div>
            <div className="flex justify-between text-base font-semibold text-[#181513] dark:text-[#FAF8F5] pt-3 border-t border-[#EAE3D8] dark:border-[#2E2925]">
              <span>Final Total</span>
              <span>{formatCurrency(total)}</span>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            form="checkout-form"
            disabled={isSubmitting}
            className="w-full h-12 bg-[#181513] dark:bg-[#FAF8F5] text-[#FAF8F5] dark:text-[#181513] rounded-xl text-xs font-semibold uppercase tracking-widest hover:bg-[#A64732] dark:hover:bg-[#E07A5F] dark:hover:text-white transition-colors flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <ShieldCheck className="w-4 h-4" />
            )}
            <span>{isSubmitting ? "Processing..." : `Place Order • ${formatCurrency(total)}`}</span>
          </button>

          <div className="text-[10px] font-medium uppercase tracking-wider text-center text-[#786F64] dark:text-[#A89F91]">
            Insured Pan-India Transit • SSL Encrypted
          </div>
        </div>
      </div>
    </div>
  );
}
