"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { formatCurrency, formatDate, extractRejectionReason } from "@/lib/utils";
import { notifyAuthChange } from "@/lib/auth-client";
import { StoreModal } from "@/components/store/StoreModal";
import {
  Package,
  Clock,
  Truck,
  CheckCircle2,
  LogOut,
  RefreshCw,
  KeyRound,
  ArrowRight,
  ShieldCheck,
  MapPin,
  Tag,
  User,
  Plus,
  Trash2,
  Edit3,
  Copy,
  Check,
  ExternalLink,
  Sparkles,
  Lock,
  Calendar,
  Phone,
  Mail,
  Search,
  AlertCircle,
  Home,
  Briefcase,
  ShoppingBag,
  Eye,
  EyeOff,
  Share2,
  X,
  Compass,
} from "lucide-react";

interface AddressItem {
  id: string;
  tag: string;
  name: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  isDefault: boolean;
  createdAt: string;
}

interface CouponWalletItem {
  id: string;
  code: string;
  discountPercent: number | null;
  discountAmount: number | null;
  minOrderAmount: number | null;
  maxDiscountAmount: number | null;
  targetAudience: string;
  targetUserEmail?: string | null;
  usageLimit?: number | null;
  usedCount: number;
  expiresAt: string | null;
}

interface OrderItem {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string | null;
  shippingAddress: string;
  city: string;
  state: string;
  postalCode: string;
  total: number;
  discount: number;
  finalTotal: number;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  courierName?: string | null;
  trackingNumber?: string | null;
  orderNotes?: string | null;
  rejectionReason?: string | null;
  createdAt: string;
  items: Array<{
    id: string;
    productTitle: string;
    quantity: number;
    price: number;
    image?: string | null;
  }>;
}

export default function AccountPage() {
  const [activeTab, setActiveTab] = useState<
    "overview" | "orders" | "addresses" | "wallet" | "profile"
  >("overview");
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Orders state
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [orderSearchQuery, setOrderSearchQuery] = useState("");
  const [orderFilter, setOrderFilter] = useState<"ALL" | "RUNNING" | "DELIVERED" | "REJECTED">("ALL");

  // Addresses state
  const [addresses, setAddresses] = useState<AddressItem[]>([]);
  const [addressesLoading, setAddressesLoading] = useState(false);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<AddressItem | null>(null);
  const [addrTag, setAddrTag] = useState("HOME");
  const [addrName, setAddrName] = useState("");
  const [addrPhone, setAddrPhone] = useState("");
  const [addrStreet, setAddrStreet] = useState("");
  const [addrCity, setAddrCity] = useState("");
  const [addrState, setAddrState] = useState("");
  const [addrPostalCode, setAddrPostalCode] = useState("");
  const [addrIsDefault, setAddrIsDefault] = useState(false);
  const [addrSubmitting, setAddrSubmitting] = useState(false);
  const [addrError, setAddrError] = useState("");

  // Coupons wallet state
  const [walletCoupons, setWalletCoupons] = useState<CouponWalletItem[]>([]);
  const [walletLoading, setWalletLoading] = useState(false);
  const [copiedCouponCode, setCopiedCouponCode] = useState<string | null>(null);

  // Profile edit states
  const [profileName, setProfileName] = useState("");
  const [profilePhone, setProfilePhone] = useState("");
  const [profileBirthDate, setProfileBirthDate] = useState("");
  const [profileAnniversaryDate, setProfileAnniversaryDate] = useState("");
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState("");
  const [profileError, setProfileError] = useState("");

  // Password change with OTP states
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordOtp, setPasswordOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpSending, setOtpSending] = useState(false);
  const [otpDevCode, setOtpDevCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [pwSaving, setPwSaving] = useState(false);
  const [pwMsg, setPwMsg] = useState("");
  const [pwError, setPwError] = useState("");

  // Auth states (for unauthenticated users)
  const [authMode, setAuthMode] = useState<"login" | "register" | "verify" | "track">("login");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authName, setAuthName] = useState("");
  const [authPhone, setAuthPhone] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [devCodeHint, setDevCodeHint] = useState("");
  const [authError, setAuthError] = useState("");
  const [authSuccess, setAuthSuccess] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  // Guest Tracking lookup state
  const [lookupOrderNumber, setLookupOrderNumber] = useState("");
  const [lookupResult, setLookupResult] = useState<any>(null);
  const [lookupError, setLookupError] = useState("");
  const [isLookingUp, setIsLookingUp] = useState(false);

  // Fetch functions
  const fetchOrders = useCallback(async () => {
    setOrdersLoading(true);
    try {
      const res = await fetch("/api/orders");
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
      }
    } catch {
      console.error("Failed to load orders");
    } finally {
      setOrdersLoading(false);
    }
  }, []);

  const fetchAddresses = useCallback(async () => {
    setAddressesLoading(true);
    try {
      const res = await fetch("/api/auth/addresses");
      if (res.ok) {
        const data = await res.json();
        setAddresses(data.addresses || []);
      }
    } catch {
      console.error("Failed to load addresses");
    } finally {
      setAddressesLoading(false);
    }
  }, []);

  const fetchWalletCoupons = useCallback(async () => {
    setWalletLoading(true);
    try {
      const res = await fetch("/api/auth/coupons");
      if (res.ok) {
        const data = await res.json();
        setWalletCoupons(data.coupons || []);
      }
    } catch {
      console.error("Failed to load wallet coupons");
    } finally {
      setWalletLoading(false);
    }
  }, []);

  const fetchProfile = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/profile");
      if (res.ok) {
        const data = await res.json();
        if (data?.user) {
          setUser(data.user);
          setProfileName(data.user.name || "");
          setProfilePhone(data.user.phone || "");
          setProfileBirthDate(
            data.user.birthDate ? new Date(data.user.birthDate).toISOString().split("T")[0] : ""
          );
          setProfileAnniversaryDate(
            data.user.anniversaryDate
              ? new Date(data.user.anniversaryDate).toISOString().split("T")[0]
              : ""
          );
          notifyAuthChange(data.user);
          fetchOrders();
          fetchAddresses();
          fetchWalletCoupons();
        }
      }
    } catch {
      // not logged in
    } finally {
      setLoading(false);
    }
  }, [fetchOrders, fetchAddresses, fetchWalletCoupons]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get("tab");
    if (
      tabParam === "orders" ||
      tabParam === "track" ||
      tabParam === "addresses" ||
      tabParam === "wallet" ||
      tabParam === "profile"
    ) {
      if (tabParam === "track") {
        setActiveTab("orders");
        setAuthMode("track");
      } else {
        setActiveTab(tabParam as any);
      }
    }
    fetchProfile();
  }, [fetchProfile]);

  // Auth Submit for Guest
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setAuthSuccess("");
    setAuthLoading(true);

    if (authMode === "login") {
      try {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: authEmail, password: authPassword }),
        });

        const data = await res.json();
        if (!res.ok) {
          setAuthError(data.error || "Invalid credentials.");
        } else {
          setUser(data.user);
          notifyAuthChange(data.user);
          fetchProfile();
        }
      } catch {
        setAuthError("Failed to communicate with authentication server.");
      } finally {
        setAuthLoading(false);
      }
    } else if (authMode === "register") {
      try {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: authName,
            email: authEmail,
            password: authPassword,
            phone: authPhone,
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          setAuthError(data.error || "Registration failed.");
        } else {
          setAuthSuccess(data.message || "Verification code sent to your email.");
          if (data.devCode) {
            setDevCodeHint(data.devCode);
          }
          setAuthMode("verify");
        }
      } catch {
        setAuthError("Network error during registration.");
      } finally {
        setAuthLoading(false);
      }
    } else if (authMode === "verify") {
      try {
        const res = await fetch("/api/auth/verify-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: authEmail,
            code: verificationCode,
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          setAuthError(data.error || "Invalid or expired verification code.");
        } else {
          setUser(data.user);
          notifyAuthChange(data.user);
          fetchProfile();
        }
      } catch {
        setAuthError("Failed to verify code.");
      } finally {
        setAuthLoading(false);
      }
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    setOrders([]);
    setAddresses([]);
    setWalletCoupons([]);
    notifyAuthChange(null);
    setAuthMode("login");
  };

  // Guest Tracking Lookup
  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLookupError("");
    setLookupResult(null);

    const cleanNum = lookupOrderNumber.trim();
    if (!cleanNum) {
      setLookupError("Please enter your Order Number (e.g. FF-2026-1234).");
      return;
    }

    setIsLookingUp(true);
    try {
      const res = await fetch(`/api/orders/${encodeURIComponent(cleanNum)}`);
      const data = await res.json();
      if (!res.ok) {
        setLookupError(data.error || "Order not found. Please verify your order number.");
      } else {
        setLookupResult(data.order);
      }
    } catch {
      setLookupError("Failed to look up order. Please check your connection.");
    } finally {
      setIsLookingUp(false);
    }
  };

  // Save Personal Profile
  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileMsg("");
    setProfileError("");

    try {
      const res = await fetch("/api/auth/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: profileName,
          phone: profilePhone,
          birthDate: profileBirthDate || null,
          anniversaryDate: profileAnniversaryDate || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setProfileError(data.error || "Failed to update profile.");
      } else {
        setUser(data.user);
        notifyAuthChange(data.user);
        setProfileMsg("Your personal details have been updated successfully.");
        setTimeout(() => setProfileMsg(""), 4000);
      }
    } catch {
      setProfileError("Network connection error. Please try again.");
    } finally {
      setProfileSaving(false);
    }
  };

  // Dispatch OTP for Password Change
  const handleSendPasswordOtp = async () => {
    setOtpSending(true);
    setPwError("");
    setPwMsg("");

    if (!currentPassword) {
      setPwError("Please enter your current password first.");
      setOtpSending(false);
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      setPwError("Please choose a new password of at least 6 characters.");
      setOtpSending(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setPwError("New passwords do not match.");
      setOtpSending(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/profile/password-otp", {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) {
        setPwError(data.error || "Failed to dispatch verification code.");
      } else {
        setOtpSent(true);
        setPwMsg(data.message || `Verification code sent to ${user?.email}`);
        if (data.devCode) {
          setOtpDevCode(data.devCode);
        }
      }
    } catch {
      setPwError("Network error. Could not send verification OTP.");
    } finally {
      setOtpSending(false);
    }
  };

  // Change Password with OTP verification
  const handlePasswordSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwMsg("");
    setPwError("");

    if (!otpSent) {
      setPwError("Please request a verification OTP code first.");
      return;
    }

    if (!passwordOtp || passwordOtp.trim().length !== 6) {
      setPwError("Please enter the 6-digit verification OTP sent to your email.");
      return;
    }

    setPwSaving(true);
    try {
      const res = await fetch("/api/auth/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword,
          newPassword,
          otp: passwordOtp.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setPwError(data.error || "Failed to update password.");
      } else {
        setPwMsg("Password updated successfully!");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setPasswordOtp("");
        setOtpSent(false);
        setOtpDevCode("");
        setTimeout(() => setPwMsg(""), 4000);
      }
    } catch {
      setPwError("Network error. Please try again.");
    } finally {
      setPwSaving(false);
    }
  };

  // Address Handlers
  const handleOpenAddAddress = () => {
    setEditingAddress(null);
    setAddrTag("HOME");
    setAddrName(user?.name || "");
    setAddrPhone(user?.phone || "");
    setAddrStreet("");
    setAddrCity("");
    setAddrState("");
    setAddrPostalCode("");
    setAddrIsDefault(addresses.length === 0);
    setAddrError("");
    setIsAddressModalOpen(true);
  };

  const handleOpenEditAddress = (addr: AddressItem) => {
    setEditingAddress(addr);
    setAddrTag(addr.tag || "HOME");
    setAddrName(addr.name);
    setAddrPhone(addr.phone);
    setAddrStreet(addr.street);
    setAddrCity(addr.city);
    setAddrState(addr.state);
    setAddrPostalCode(addr.postalCode);
    setAddrIsDefault(addr.isDefault);
    setAddrError("");
    setIsAddressModalOpen(true);
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddrError("");
    setAddrSubmitting(true);

    const payload = {
      id: editingAddress?.id,
      tag: addrTag,
      name: addrName.trim(),
      phone: addrPhone.trim(),
      street: addrStreet.trim(),
      city: addrCity.trim(),
      state: addrState.trim(),
      postalCode: addrPostalCode.trim(),
      isDefault: addrIsDefault,
    };

    try {
      const method = editingAddress ? "PUT" : "POST";
      const res = await fetch("/api/auth/addresses", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        setAddrError(data.error || "Failed to save address.");
      } else {
        setIsAddressModalOpen(false);
        fetchAddresses();
      }
    } catch {
      setAddrError("Failed to communicate with server.");
    } finally {
      setAddrSubmitting(false);
    }
  };

  const handleDeleteAddress = async (id: string) => {
    if (!confirm("Are you sure you want to remove this delivery address?")) return;
    try {
      const res = await fetch(`/api/auth/addresses?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setAddresses((prev) => prev.filter((a) => a.id !== id));
      }
    } catch {
      console.error("Failed to delete address");
    }
  };

  const handleSetDefaultAddress = async (id: string) => {
    try {
      const res = await fetch("/api/auth/addresses", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isDefault: true }),
      });
      if (res.ok) {
        fetchAddresses();
      }
    } catch {
      console.error("Failed to set default address");
    }
  };

  // Copy Coupon Code
  const handleCopyCoupon = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCouponCode(code);
    setTimeout(() => setCopiedCouponCode(null), 2000);
  };

  // Order Partitioning: Running vs Past
  const { runningOrders, pastOrders } = useMemo(() => {
    const runningStatuses = ["PENDING", "CONFIRMED", "HANDCRAFTING", "PACKED", "SHIPPED"];
    const running: OrderItem[] = [];
    const past: OrderItem[] = [];

    orders.forEach((o) => {
      const isRejected = o.status === "CANCELLED" || o.paymentStatus === "REJECTED";
      if (!isRejected && runningStatuses.includes(o.status)) {
        running.push(o);
      } else {
        past.push(o);
      }
    });

    return { runningOrders: running, pastOrders: past };
  }, [orders]);

  const rejectedOrders = useMemo(() => {
    return orders.filter((o) => o.status === "CANCELLED" || o.paymentStatus === "REJECTED");
  }, [orders]);

  const filteredOrders = useMemo(() => {
    let list = orders;
    if (orderFilter === "RUNNING") {
      list = runningOrders;
    } else if (orderFilter === "DELIVERED") {
      list = pastOrders;
    } else if (orderFilter === "REJECTED") {
      list = rejectedOrders;
    }

    if (orderSearchQuery.trim()) {
      const q = orderSearchQuery.toLowerCase();
      list = list.filter(
        (o) =>
          o.orderNumber.toLowerCase().includes(q) ||
          o.items.some((item) => item.productTitle.toLowerCase().includes(q))
      );
    }
    return list;
  }, [orders, runningOrders, pastOrders, rejectedOrders, orderFilter, orderSearchQuery]);

  // Visual Stepper for Live Tracking
  const renderTrackingTimeline = (status: string, rejectionReason?: string | null) => {
    const steps = [
      { key: "CONFIRMED", label: "Confirmed", icon: CheckCircle2 },
      { key: "HANDCRAFTING", label: "Studio Crafting", icon: Clock },
      { key: "PACKED", label: "Packed & Sealed", icon: Package },
      { key: "SHIPPED", label: "Shipped", icon: Truck },
      { key: "DELIVERED", label: "Delivered", icon: CheckCircle2 },
    ];

    const statusHierarchy: Record<string, number> = {
      PENDING: 0,
      CONFIRMED: 1,
      HANDCRAFTING: 2,
      PACKED: 3,
      SHIPPED: 4,
      DELIVERED: 5,
      CANCELLED: -1,
    };

    const currentStep = statusHierarchy[status] ?? 1;

    if (status === "CANCELLED") {
      return (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 rounded-xl text-xs space-y-1.5 text-left">
          <div className="flex items-center gap-2 font-bold text-rose-900 dark:text-rose-200">
            <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
            <span>Order Payment Rejected & Cancelled</span>
          </div>
          <p className="text-rose-700 dark:text-rose-300 text-xs pl-6">
            Reason: <strong className="font-semibold">{rejectionReason || "Payment verification failed or invalid details provided."}</strong>
          </p>
          <p className="text-[11px] text-rose-600 dark:text-rose-400 pl-6">
            If you need assistance, please contact our studio via WhatsApp with your payment proof.
          </p>
        </div>
      );
    }

    return (
      <div className="py-2">
        {/* Mobile Vertical Stepper */}
        <div className="sm:hidden space-y-3 pl-2 py-1">
          {steps.map((step, idx) => {
            const isCompleted = idx + 1 <= currentStep;
            const isCurrent = idx + 1 === currentStep;
            const Icon = step.icon;
            const isLast = idx === steps.length - 1;

            return (
              <div key={step.key} className="flex items-start gap-3 relative">
                {!isLast && (
                  <div
                    className={`absolute left-3.5 top-7 w-0.5 -ml-px ${
                      isCompleted ? "bg-[#181513] dark:bg-[#FAF8F5]" : "bg-stone-200 dark:bg-stone-800"
                    }`}
                    style={{ height: "calc(100% + 2px)" }}
                  />
                )}
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 z-10 transition-colors ${
                    isCurrent
                      ? "bg-[#A64732] text-white shadow-sm ring-3 ring-stone-100 dark:ring-stone-900"
                      : isCompleted
                      ? "bg-[#181513] dark:bg-[#FAF8F5] text-white dark:text-[#181513]"
                      : "bg-stone-100 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-stone-400"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <div className="pt-0.5">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-bold uppercase tracking-wider ${
                        isCurrent
                          ? "text-[#A64732] dark:text-[#E07A5F]"
                          : isCompleted
                          ? "text-stone-900 dark:text-stone-100"
                          : "text-stone-400"
                      }`}
                    >
                      {step.label}
                    </span>
                    {isCurrent && (
                      <span className="text-[10px] px-2 py-0.2 rounded-full bg-[#A64732]/10 text-[#A64732] dark:text-[#E07A5F] font-semibold">
                        In Progress
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Desktop / Tablet Horizontal Stepper */}
        <div className="hidden sm:block py-3">
          <div className="flex items-center justify-between relative">
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-stone-200 dark:bg-stone-800 -translate-y-1/2 z-0" />
            {steps.map((step, idx) => {
              const isCompleted = idx + 1 <= currentStep;
              const isCurrent = idx + 1 === currentStep;
              const Icon = step.icon;

              return (
                <div key={step.key} className="flex flex-col items-center relative z-10">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                      isCurrent
                        ? "bg-[#A64732] text-white shadow-sm ring-4 ring-[#FAF8F5] dark:ring-[#1A1715]"
                        : isCompleted
                        ? "bg-[#181513] dark:bg-[#FAF8F5] text-white dark:text-[#181513]"
                        : "bg-white dark:bg-[#1C1816] border border-stone-300 dark:border-stone-700 text-stone-400"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <span
                    className={`text-[10.5px] mt-1.5 uppercase tracking-wider font-semibold ${
                      isCurrent
                        ? "text-[#A64732] dark:text-[#E07A5F]"
                        : isCompleted
                        ? "text-stone-900 dark:text-stone-100"
                        : "text-stone-400"
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center">
        <div className="w-8 h-8 border-2 border-[#181513] dark:border-[#FAF8F5] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs font-semibold uppercase tracking-widest text-[#786F64] dark:text-[#A89F91]">
          Opening client portal...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-200 dark:border-stone-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10.5px] uppercase tracking-[0.2em] text-[#A64732] dark:text-[#E07A5F] font-bold block">
              Fourfold Studio
            </span>
            <span className="text-stone-300 dark:text-stone-700">•</span>
            <span className="text-xs font-medium text-stone-500">Patron Portal</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-serif font-bold tracking-tight text-stone-900 dark:text-stone-100 mt-1">
            {user ? `Welcome, ${user.name}` : "Patron Portal & Account"}
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 mt-1">
            {user
              ? "Track live artisanal crafting milestones, manage saved delivery addresses, and view your VIP discounts."
              : "Sign in to manage your orders or track existing dispatch receipts as a guest."}
          </p>
        </div>

        {user && (
          <button
            onClick={handleLogout}
            className="self-start sm:self-auto px-4 py-2 border border-stone-200 dark:border-stone-800 rounded-xl text-xs font-semibold uppercase tracking-wider text-stone-700 dark:text-stone-300 hover:border-stone-400 dark:hover:border-stone-600 hover:text-red-600 dark:hover:text-red-400 transition-colors flex items-center gap-2 cursor-pointer bg-white dark:bg-[#1C1816]"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        )}
      </div>

      {/* Guest Mode: Sign In, Registration, or Guest Tracking */}
      {!user ? (
        authMode === "track" ? (
          /* Guest Tracking View */
          <div className="max-w-xl mx-auto bg-white dark:bg-[#1C1816] border border-stone-200 dark:border-stone-800 rounded-2xl p-6 sm:p-10 space-y-6 shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b border-stone-100 dark:border-stone-800">
              <div>
                <span className="text-[10px] font-semibold text-[#A64732] dark:text-[#E07A5F] uppercase tracking-[0.2em] block">
                  Guest Order Lookup
                </span>
                <h2 className="text-xl sm:text-2xl font-serif font-bold text-stone-900 dark:text-stone-100 mt-0.5">
                  Track Your Order
                </h2>
              </div>
              <button
                type="button"
                onClick={() => {
                  setAuthMode("login");
                  setLookupError("");
                  setLookupResult(null);
                }}
                className="text-xs font-semibold uppercase tracking-wider text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 transition-colors cursor-pointer"
              >
                ← Back to Login
              </button>
            </div>

            <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
              Enter your order number to view real-time studio craft milestones, courier dispatch details, and tracking updates.
            </p>

            <form onSubmit={handleLookup} className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={lookupOrderNumber}
                onChange={(e) => setLookupOrderNumber(e.target.value.toUpperCase())}
                placeholder="e.g. FF-2026-1234"
                className="w-full sm:flex-1 h-12 px-4 sm:px-5 text-sm sm:text-base font-mono font-medium uppercase rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 text-stone-900 dark:text-stone-100 placeholder:normal-case placeholder:font-sans placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
              <button
                type="submit"
                disabled={isLookingUp}
                className="w-full sm:w-auto h-12 px-7 bg-[#181513] dark:bg-[#FAF8F5] text-[#FAF8F5] dark:text-[#181513] text-xs sm:text-sm font-semibold uppercase tracking-wider rounded-xl hover:bg-[#A64732] dark:hover:bg-[#E07A5F] dark:hover:text-white transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shrink-0 cursor-pointer shadow-sm"
              >
                {isLookingUp ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Checking...</span>
                  </>
                ) : (
                  <span>Track Order</span>
                )}
              </button>
            </form>

            {lookupError && (
              <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-rose-800 dark:text-rose-300 text-xs font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{lookupError}</span>
              </div>
            )}

            {lookupResult && (() => {
              const isLookupRejected = lookupResult.status === "CANCELLED" || lookupResult.paymentStatus === "REJECTED";
              const lookupReason = extractRejectionReason(lookupResult.orderNotes) || lookupResult.rejectionReason;

              return (
              <div className="p-5 sm:p-6 bg-stone-50 dark:bg-stone-900/60 border border-stone-200 dark:border-stone-800 rounded-2xl space-y-5 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-stone-200 dark:border-stone-800 gap-2">
                  <div>
                    <span className="font-mono font-bold text-base text-stone-900 dark:text-stone-100 tracking-wide">
                      #{lookupResult.orderNumber}
                    </span>
                    <span className="text-[11px] text-stone-500 block mt-0.5">
                      Placed on {formatDate(lookupResult.createdAt)}
                    </span>
                  </div>
                  {isLookupRejected ? (
                    <span className="text-xs font-bold uppercase px-3 py-1 bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-300 dark:border-rose-800 rounded-full self-start sm:self-auto">
                      REJECTED
                    </span>
                  ) : (
                    <span className="text-xs font-semibold uppercase px-3 py-1 bg-white dark:bg-stone-800 text-[#A64732] dark:text-[#E07A5F] border border-stone-200 dark:border-stone-700 rounded-full self-start sm:self-auto">
                      {lookupResult.status}
                    </span>
                  )}
                </div>

                {/* Rejection Alert Callout */}
                {isLookupRejected && (
                  <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 rounded-xl text-xs text-rose-800 dark:text-rose-300 space-y-1.5 shadow-2xs">
                    <div className="flex items-center gap-1.5 font-bold text-rose-900 dark:text-rose-200">
                      <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
                      <span>Payment Rejected by Studio</span>
                    </div>
                    <p className="text-xs text-rose-800 dark:text-rose-200 pl-5.5 font-medium">
                      Reason: <strong>{lookupReason || "Fake or unverified payment details provided. Payment was not credited."}</strong>
                    </p>
                    <div className="pt-1 pl-5.5">
                      <a
                        href={`https://wa.me/919876543210?text=${encodeURIComponent(
                          `Hello The Fourfold Studio! My order #${lookupResult.orderNumber} is marked as rejected (Reason: ${lookupReason || "Payment unverified"}). Here is my payment receipt/UTR screenshot.`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-rose-700 dark:text-rose-300 hover:underline"
                      >
                        <Share2 className="w-3 h-3" />
                        <span>Contact Studio on WhatsApp →</span>
                      </a>
                    </div>
                  </div>
                )}

                {/* Stepper */}
                {renderTrackingTimeline(lookupResult.status, lookupReason)}

                {/* Courier Details */}
                {lookupResult.trackingNumber ? (
                  <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 rounded-xl text-xs space-y-1">
                    <span className="font-semibold text-emerald-900 dark:text-emerald-300 block">
                      Dispatched with {lookupResult.courierName || "Courier Partner"}
                    </span>
                    <span className="text-emerald-800 dark:text-emerald-400 break-all font-mono">
                      AWB / Tracking Number: <strong>{lookupResult.trackingNumber}</strong>
                    </span>
                  </div>
                ) : (
                  <div className="p-4 bg-white dark:bg-[#1C1816] border border-stone-200 dark:border-stone-800 rounded-xl text-xs text-stone-600 dark:text-stone-400">
                    Our Mumbai studio is handcrafting and finishing your pieces. Courier tracking details will appear as soon as your package is dispatched.
                  </div>
                )}

                {/* Items & Destination */}
                <div className="pt-2 text-xs space-y-3">
                  <div className="flex flex-col sm:flex-row justify-between text-stone-600 dark:text-stone-400 gap-1">
                    <span>
                      Recipient: <strong className="text-stone-900 dark:text-stone-100">{lookupResult.customerName}</strong>
                    </span>
                    <span>
                      Destination: <strong className="text-stone-900 dark:text-stone-100">{lookupResult.city}, {lookupResult.state}</strong>
                    </span>
                  </div>

                  <div className="divide-y divide-stone-200 dark:divide-stone-800 border-t border-stone-200 dark:border-stone-800 pt-2">
                    {lookupResult.items?.map((item: any) => (
                      <div key={item.id} className="py-2 flex justify-between items-center text-xs">
                        <span className="text-stone-900 dark:text-stone-100">
                          {item.productTitle} <span className="text-stone-400">× {item.quantity}</span>
                        </span>
                        <span className="font-semibold text-stone-900 dark:text-stone-100">
                          {formatCurrency(Number(item.price) * item.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              );
            })()}
          </div>
        ) : (
          /* Login & Register Card */
          <div className="max-w-md mx-auto bg-white dark:bg-[#1C1816] border border-stone-200 dark:border-stone-800 rounded-2xl p-6 sm:p-10 space-y-6 shadow-sm">
            {/* Mode Switcher */}
            {authMode !== "verify" ? (
              <div className="grid grid-cols-2 p-1 bg-stone-100 dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 text-xs sm:text-sm font-semibold uppercase tracking-wider gap-1">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode("login");
                    setAuthError("");
                    setAuthSuccess("");
                  }}
                  className={`py-2.5 px-3 rounded-lg text-center transition-all cursor-pointer ${
                    authMode === "login"
                      ? "bg-white dark:bg-stone-800 text-stone-900 dark:text-white shadow-sm font-bold"
                      : "text-stone-500 hover:text-stone-900 dark:hover:text-stone-100"
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode("register");
                    setAuthError("");
                    setAuthSuccess("");
                  }}
                  className={`py-2.5 px-3 rounded-lg text-center transition-all cursor-pointer ${
                    authMode === "register"
                      ? "bg-white dark:bg-stone-800 text-stone-900 dark:text-white shadow-sm font-bold"
                      : "text-stone-500 hover:text-stone-900 dark:hover:text-stone-100"
                  }`}
                >
                  Register
                </button>
              </div>
            ) : (
              <div className="text-center space-y-1">
                <div className="w-10 h-10 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-900 dark:text-stone-100 flex items-center justify-center mx-auto mb-2">
                  <KeyRound className="w-5 h-5" />
                </div>
                <h3 className="font-serif font-bold tracking-tight text-xl text-stone-900 dark:text-stone-100">
                  Verify Email
                </h3>
                <p className="text-xs text-stone-500">
                  Code sent to <strong>{authEmail}</strong>
                </p>
              </div>
            )}

            {authError && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-rose-800 dark:text-rose-300 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            {authSuccess && (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 text-emerald-800 dark:text-emerald-300 rounded-xl text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{authSuccess}</span>
              </div>
            )}

            {devCodeHint && authMode === "verify" && (
              <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 text-amber-900 dark:text-amber-300 rounded-xl text-xs font-medium flex items-center justify-between">
                <span>Demo OTP Code:</span>
                <strong className="font-bold font-mono tracking-wider">{devCodeHint}</strong>
              </div>
            )}

            <form onSubmit={handleAuthSubmit} className="space-y-4 text-xs">
              {authMode === "verify" ? (
                <div className="space-y-3">
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                    Enter 6-Digit Verification Code
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="123456"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ""))}
                    className="w-full text-center text-xl tracking-[0.4em] font-bold h-12 bg-stone-50 dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    autoFocus
                    required
                  />
                  <div className="flex items-center justify-between text-[11px] pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode("register");
                        setAuthError("");
                        setAuthSuccess("");
                      }}
                      className="text-stone-500 hover:underline cursor-pointer"
                    >
                      ← Back
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          const res = await fetch("/api/auth/resend-code", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ email: authEmail }),
                          });
                          const data = await res.json();
                          if (data.devCode) setDevCodeHint(data.devCode);
                          setAuthSuccess("New verification code dispatched.");
                        } catch {
                          setAuthError("Failed to resend code.");
                        }
                      }}
                      className="text-[#A64732] dark:text-[#E07A5F] hover:underline font-semibold cursor-pointer"
                    >
                      Resend Code
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {authMode === "register" && (
                    <div className="space-y-1">
                      <label className="block text-[10px] font-semibold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        placeholder="Ananya Sharma"
                        value={authName}
                        onChange={(e) => setAuthName(e.target.value)}
                        required
                        className="w-full h-12 px-4 text-sm bg-stone-50 dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      />
                    </div>
                  )}

                  <div className="space-y-1">
                    <label className="block text-[10px] font-semibold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      placeholder="patron@example.com"
                      value={authEmail}
                      onChange={(e) => setAuthEmail(e.target.value)}
                      required
                      className="w-full h-12 px-4 text-sm bg-stone-50 dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-semibold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                      Password *
                    </label>
                    <input
                      type="password"
                      placeholder="Minimum 6 characters"
                      value={authPassword}
                      onChange={(e) => setAuthPassword(e.target.value)}
                      required
                      className="w-full h-12 px-4 text-sm bg-stone-50 dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>
                </>
              )}

              <button
                type="submit"
                disabled={authLoading}
                className="w-full h-12 bg-[#181513] dark:bg-[#FAF8F5] text-[#FAF8F5] dark:text-[#181513] rounded-xl text-xs sm:text-sm font-semibold uppercase tracking-wider hover:bg-[#A64732] dark:hover:bg-[#E07A5F] dark:hover:text-white transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
              >
                {authLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin mx-auto" />
                ) : authMode === "login" ? (
                  "Sign In"
                ) : authMode === "register" ? (
                  "Send Verification Code"
                ) : (
                  "Verify Code"
                )}
              </button>
            </form>

            <div className="pt-4 border-t border-stone-100 dark:border-stone-800 text-center">
              <button
                type="button"
                onClick={() => {
                  setAuthMode("track");
                  setAuthError("");
                  setAuthSuccess("");
                }}
                className="text-xs font-semibold text-[#A64732] dark:text-[#E07A5F] hover:underline cursor-pointer"
              >
                Track Order as Guest →
              </button>
            </div>
          </div>
        )
      ) : (
        /* Authenticated Client Portal with 5 Tabs */
        <div className="space-y-6">
          {/* Tabs Navigation Bar */}
          <div className="flex border-b border-stone-200 dark:border-stone-800 text-xs font-semibold uppercase tracking-wider gap-4 sm:gap-6 overflow-x-auto pb-px scrollbar-none">
            <button
              type="button"
              onClick={() => setActiveTab("overview")}
              className={`pb-3 transition-colors shrink-0 flex items-center gap-2 relative cursor-pointer ${
                activeTab === "overview"
                  ? "text-stone-900 dark:text-stone-100 font-bold border-b-2 border-stone-900 dark:border-stone-100"
                  : "text-stone-500 hover:text-stone-900 dark:hover:text-stone-100"
              }`}
            >
              <Compass className="w-4 h-4" />
              <span>Overview</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("orders")}
              className={`pb-3 transition-colors shrink-0 flex items-center gap-2 relative cursor-pointer ${
                activeTab === "orders"
                  ? "text-stone-900 dark:text-stone-100 font-bold border-b-2 border-stone-900 dark:border-stone-100"
                  : "text-stone-500 hover:text-stone-900 dark:hover:text-stone-100"
              }`}
            >
              <Package className="w-4 h-4" />
              <span>Orders & Live Tracking ({orders.length})</span>
              {runningOrders.length > 0 && (
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("addresses")}
              className={`pb-3 transition-colors shrink-0 flex items-center gap-2 relative cursor-pointer ${
                activeTab === "addresses"
                  ? "text-stone-900 dark:text-stone-100 font-bold border-b-2 border-stone-900 dark:border-stone-100"
                  : "text-stone-500 hover:text-stone-900 dark:hover:text-stone-100"
              }`}
            >
              <MapPin className="w-4 h-4" />
              <span>Saved Addresses ({addresses.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("wallet")}
              className={`pb-3 transition-colors shrink-0 flex items-center gap-2 relative cursor-pointer ${
                activeTab === "wallet"
                  ? "text-stone-900 dark:text-stone-100 font-bold border-b-2 border-stone-900 dark:border-stone-100"
                  : "text-stone-500 hover:text-stone-900 dark:hover:text-stone-100"
              }`}
            >
              <Tag className="w-4 h-4" />
              <span>Coupons & Wallet ({walletCoupons.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("profile")}
              className={`pb-3 transition-colors shrink-0 flex items-center gap-2 relative cursor-pointer ${
                activeTab === "profile"
                  ? "text-stone-900 dark:text-stone-100 font-bold border-b-2 border-stone-900 dark:border-stone-100"
                  : "text-stone-500 hover:text-stone-900 dark:hover:text-stone-100"
              }`}
            >
              <User className="w-4 h-4" />
              <span>Profile & Security</span>
            </button>
          </div>

          {/* TAB 1: OVERVIEW */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Metric Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <div className="bg-white dark:bg-[#1C1816] p-5 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm space-y-1">
                  <span className="text-xs text-stone-500 font-medium">Total Orders</span>
                  <p className="text-2xl font-serif font-bold text-stone-900 dark:text-stone-100">
                    {orders.length}
                  </p>
                </div>
                <div className="bg-white dark:bg-[#1C1816] p-5 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm space-y-1">
                  <span className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">
                    Active / Running
                  </span>
                  <p className="text-2xl font-serif font-bold text-emerald-700 dark:text-emerald-400">
                    {runningOrders.length}
                  </p>
                </div>
                <div className="bg-white dark:bg-[#1C1816] p-5 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm space-y-1">
                  <span className="text-xs text-stone-500 font-medium">Saved Addresses</span>
                  <p className="text-2xl font-serif font-bold text-stone-900 dark:text-stone-100">
                    {addresses.length}
                  </p>
                </div>
                <div className="bg-white dark:bg-[#1C1816] p-5 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm space-y-1">
                  <span className="text-xs text-primary font-medium">Available Offers</span>
                  <p className="text-2xl font-serif font-bold text-primary">
                    {walletCoupons.length}
                  </p>
                </div>
              </div>

              {/* Running Orders Spotlight Banner (if any) */}
              {runningOrders.length > 0 && (
                <div className="bg-[#FAF8F5] dark:bg-[#1C1816] border-2 border-[#A64732]/30 dark:border-[#E07A5F]/30 rounded-2xl p-5 sm:p-6 space-y-4 shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-stone-200 dark:border-stone-800">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                      <h3 className="font-serif font-bold text-base sm:text-lg text-stone-900 dark:text-stone-100">
                        Live Order In Progress (#{runningOrders[0].orderNumber})
                      </h3>
                    </div>
                    <button
                      onClick={() => setActiveTab("orders")}
                      className="text-xs font-semibold text-[#A64732] dark:text-[#E07A5F] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <span>View Detailed Tracking</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {renderTrackingTimeline(runningOrders[0].status)}

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-stone-600 dark:text-stone-400 pt-2 gap-2">
                    <span>
                      Total: <strong className="text-stone-900 dark:text-stone-100">{formatCurrency(runningOrders[0].finalTotal)}</strong> ({runningOrders[0].items.length} items)
                    </span>
                    {runningOrders[0].trackingNumber ? (
                      <span className="text-emerald-700 dark:text-emerald-400 font-semibold">
                        Dispatched via {runningOrders[0].courierName}: {runningOrders[0].trackingNumber}
                      </span>
                    ) : (
                      <span>Artisans are crafting and finishing your order</span>
                    )}
                  </div>
                </div>
              )}

              {/* Latest Rejected Order Spotlight Banner (if any) */}
              {(() => {
                const latestRejected = orders.find((o) => o.status === "CANCELLED" || o.paymentStatus === "REJECTED");
                if (!latestRejected) return null;
                const rejReason = extractRejectionReason(latestRejected.orderNotes) || latestRejected.rejectionReason;

                return (
                  <div className="bg-rose-50/70 dark:bg-rose-950/20 border-2 border-rose-300 dark:border-rose-900/60 rounded-2xl p-5 sm:p-6 space-y-3 shadow-2xs">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-rose-200 dark:border-rose-900/40">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0" />
                        <h3 className="font-serif font-bold text-base text-rose-900 dark:text-rose-200">
                          Order #{latestRejected.orderNumber} Payment Rejected
                        </h3>
                      </div>
                      <button
                        onClick={() => {
                          setOrderFilter("REJECTED");
                          setActiveTab("orders");
                        }}
                        className="text-xs font-semibold text-rose-700 dark:text-rose-300 hover:underline flex items-center gap-1 cursor-pointer self-start sm:self-auto"
                      >
                        <span>View in Orders Tab</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="text-xs text-rose-800 dark:text-rose-300 space-y-1">
                      <p>
                        Reason: <strong>{rejReason || "Fake or unverified payment details provided."}</strong>
                      </p>
                      <p className="text-[11.5px] text-rose-700 dark:text-rose-300/80">
                        This order will not be handcrafted. If this was marked in error, please reach out to our studio on WhatsApp with your payment proof.
                      </p>
                    </div>
                  </div>
                );
              })()}

              {/* Quick Actions Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <button
                  onClick={() => setActiveTab("orders")}
                  className="p-5 bg-white dark:bg-[#1C1816] rounded-2xl border border-stone-200 dark:border-stone-800 hover:border-primary/40 transition-all text-left space-y-2 cursor-pointer shadow-2xs group"
                >
                  <div className="w-9 h-9 rounded-xl bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                    <Package className="w-4 h-4" />
                  </div>
                  <h4 className="font-serif font-bold text-stone-900 dark:text-stone-100 text-sm">
                    Orders & Tracking
                  </h4>
                  <p className="text-xs text-stone-500 leading-relaxed">
                    Check running shipments, review order receipts, and track courier milestones.
                  </p>
                </button>

                <button
                  onClick={() => setActiveTab("addresses")}
                  className="p-5 bg-white dark:bg-[#1C1816] rounded-2xl border border-stone-200 dark:border-stone-800 hover:border-primary/40 transition-all text-left space-y-2 cursor-pointer shadow-2xs group"
                >
                  <div className="w-9 h-9 rounded-xl bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <h4 className="font-serif font-bold text-stone-900 dark:text-stone-100 text-sm">
                    Address Book
                  </h4>
                  <p className="text-xs text-stone-500 leading-relaxed">
                    Manage multiple shipping addresses for home, studio, and gifting destinations.
                  </p>
                </button>

                <button
                  onClick={() => setActiveTab("wallet")}
                  className="p-5 bg-white dark:bg-[#1C1816] rounded-2xl border border-stone-200 dark:border-stone-800 hover:border-primary/40 transition-all text-left space-y-2 cursor-pointer shadow-2xs group"
                >
                  <div className="w-9 h-9 rounded-xl bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                    <Tag className="w-4 h-4" />
                  </div>
                  <h4 className="font-serif font-bold text-stone-900 dark:text-stone-100 text-sm">
                    Coupons & Rewards
                  </h4>
                  <p className="text-xs text-stone-500 leading-relaxed">
                    View personal promo codes assigned to you and festive studio discounts.
                  </p>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: MERGED ORDERS & LIVE TRACKING */}
          {activeTab === "orders" && (
            <div className="space-y-6">
              {/* Order Search & Filter Bar */}
              <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    type="text"
                    placeholder="Search by order # or product..."
                    value={orderSearchQuery}
                    onChange={(e) => setOrderSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 text-xs bg-white dark:bg-[#1C1816] border border-stone-200 dark:border-stone-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-stone-900 dark:text-stone-100 placeholder:text-stone-400"
                  />
                </div>

                <div className="flex items-center gap-1.5 p-1 bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl w-full sm:w-auto self-stretch text-xs">
                  <button
                    onClick={() => setOrderFilter("ALL")}
                    className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                      orderFilter === "ALL"
                        ? "bg-white dark:bg-stone-800 text-stone-900 dark:text-white shadow-xs font-bold"
                        : "text-stone-500 hover:text-stone-900"
                    }`}
                  >
                    All ({orders.length})
                  </button>
                  <button
                    onClick={() => setOrderFilter("RUNNING")}
                    className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                      orderFilter === "RUNNING"
                        ? "bg-white dark:bg-stone-800 text-stone-900 dark:text-white shadow-xs font-bold"
                        : "text-stone-500 hover:text-stone-900"
                    }`}
                  >
                    In Progress ({runningOrders.length})
                  </button>
                  <button
                    onClick={() => setOrderFilter("DELIVERED")}
                    className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                      orderFilter === "DELIVERED"
                        ? "bg-white dark:bg-stone-800 text-stone-900 dark:text-white shadow-xs font-bold"
                        : "text-stone-500 hover:text-stone-900"
                    }`}
                  >
                    History ({pastOrders.length})
                  </button>
                  {rejectedOrders.length > 0 && (
                    <button
                      onClick={() => setOrderFilter("REJECTED")}
                      className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                        orderFilter === "REJECTED"
                          ? "bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 shadow-xs font-bold border border-rose-300 dark:border-rose-800"
                          : "text-rose-600 dark:text-rose-400 hover:text-rose-700"
                      }`}
                    >
                      Rejected ({rejectedOrders.length})
                    </button>
                  )}
                </div>
              </div>

              {ordersLoading ? (
                <div className="p-16 text-center text-xs font-medium text-stone-500">
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto text-primary mb-2" />
                  <span>Loading orders & tracking history...</span>
                </div>
              ) : filteredOrders.length === 0 ? (
                <div className="p-12 text-center bg-white dark:bg-[#1C1816] border border-stone-200 dark:border-stone-800 rounded-2xl space-y-3">
                  <ShoppingBag className="w-10 h-10 mx-auto text-stone-300 dark:text-stone-600" />
                  <h3 className="font-serif font-bold text-stone-900 dark:text-stone-100 text-base">
                    No Orders Found
                  </h3>
                  <p className="text-xs text-stone-500 max-w-sm mx-auto">
                    {orderSearchQuery
                      ? "No orders match your search criteria."
                      : "Explore our curated artisanal collection and place your first handcrafted order today!"}
                  </p>
                  <Link
                    href="/catalog"
                    className="inline-block px-6 py-2.5 bg-[#181513] text-[#FAF8F5] dark:bg-[#FAF8F5] dark:text-[#181513] rounded-xl text-xs font-semibold uppercase tracking-wider hover:bg-[#A64732] dark:hover:bg-[#E07A5F] transition-colors"
                  >
                    Explore Studio Catalog
                  </Link>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* SECTION A: Currently Running Orders Pinned on Top */}
                  {runningOrders.length > 0 && orderFilter !== "DELIVERED" && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                        <h3 className="text-xs font-bold uppercase tracking-wider text-stone-900 dark:text-stone-100">
                          Active Orders In Progress ({runningOrders.length})
                        </h3>
                      </div>

                      <div className="space-y-4">
                        {runningOrders.map((order) => (
                          <div
                            key={order.id}
                            className="bg-white dark:bg-[#1C1816] border-2 border-[#A64732]/30 dark:border-[#E07A5F]/30 rounded-2xl p-5 sm:p-6 space-y-4 shadow-sm"
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800 gap-2">
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-mono font-bold text-base text-stone-900 dark:text-stone-100">
                                    #{order.orderNumber}
                                  </span>
                                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#A64732]/10 text-[#A64732] dark:text-[#E07A5F] uppercase">
                                    {order.status}
                                  </span>
                                </div>
                                <span className="text-[11px] text-stone-500 block mt-0.5">
                                  Placed on {formatDate(order.createdAt)} • {order.items.length} items
                                </span>
                              </div>

                              <div className="text-left sm:text-right">
                                <span className="text-base font-bold text-stone-900 dark:text-stone-100 block">
                                  {formatCurrency(order.finalTotal)}
                                </span>
                                <span className="text-[11px] text-stone-400">
                                  {order.paymentMethod} • {order.paymentStatus}
                                </span>
                              </div>
                            </div>

                            {/* Live Stepper */}
                            {renderTrackingTimeline(order.status)}

                            {/* Courier & Dispatch Info */}
                            {order.trackingNumber ? (
                              <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 rounded-xl text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                <div>
                                  <span className="font-semibold text-emerald-900 dark:text-emerald-300 block">
                                    In Transit with {order.courierName || "Courier Partner"}
                                  </span>
                                  <span className="text-emerald-800 dark:text-emerald-400 font-mono text-[11px]">
                                    AWB Tracking: <strong>{order.trackingNumber}</strong>
                                  </span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleCopyCoupon(order.trackingNumber!)}
                                  className="self-start sm:self-auto px-2.5 py-1 bg-white dark:bg-stone-800 border border-emerald-300 dark:border-emerald-800 rounded-lg text-[11px] font-semibold text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 transition-colors cursor-pointer flex items-center gap-1"
                                >
                                  {copiedCouponCode === order.trackingNumber ? (
                                    <>
                                      <Check className="w-3 h-3 text-emerald-600" />
                                      <span>Copied</span>
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="w-3 h-3" />
                                      <span>Copy AWB</span>
                                    </>
                                  )}
                                </button>
                              </div>
                            ) : (
                              <div className="p-3 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl text-xs text-stone-600 dark:text-stone-400 flex items-center gap-2">
                                <Clock className="w-4 h-4 text-primary shrink-0" />
                                <span>
                                  Our Mumbai studio is crafting and hand-finishing your items. Tracking details will update here as soon as the courier scans your package.
                                </span>
                              </div>
                            )}

                            {/* Items List */}
                            <div className="divide-y divide-stone-100 dark:divide-stone-800 text-xs">
                              {order.items.map((item) => (
                                <div key={item.id} className="py-2 flex justify-between items-center">
                                  <span className="text-stone-800 dark:text-stone-200">
                                    {item.productTitle} <span className="text-stone-400">× {item.quantity}</span>
                                  </span>
                                  <span className="font-semibold text-stone-900 dark:text-stone-100">
                                    {formatCurrency(Number(item.price) * item.quantity)}
                                  </span>
                                </div>
                              ))}
                            </div>

                            {/* Action links */}
                            <div className="pt-2 border-t border-stone-100 dark:border-stone-800 flex flex-wrap items-center justify-between gap-2 text-xs">
                              <a
                                href={`https://wa.me/?text=${encodeURIComponent(
                                  `Hello Fourfold Studio! I have a question regarding my ongoing order #${order.orderNumber}.`
                                )}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 font-semibold transition-colors"
                              >
                                <Share2 className="w-3.5 h-3.5" />
                                <span>WhatsApp Studio Concierge</span>
                              </a>

                              <Link
                                href={`/order-confirmation/${order.orderNumber}`}
                                className="text-xs font-semibold text-[#A64732] dark:text-[#E07A5F] hover:underline flex items-center gap-1"
                              >
                                <span>Full Receipt Details</span>
                                <ExternalLink className="w-3 h-3" />
                              </Link>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* SECTION B: Past / Delivered Orders */}
                  {pastOrders.length > 0 && orderFilter !== "RUNNING" && (
                    <div className="space-y-3 pt-2">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                        Historical Orders ({pastOrders.length})
                      </h3>

                      <div className="space-y-3">
                        {pastOrders.map((order) => {
                          const isOrderRejected = order.status === "CANCELLED" || order.paymentStatus === "REJECTED";
                          const rejReason = extractRejectionReason(order.orderNotes) || order.rejectionReason;

                          return (
                          <div
                            key={order.id}
                            className={`p-4 sm:p-5 bg-white dark:bg-[#1C1816] border ${
                              isOrderRejected
                                ? "border-rose-300 dark:border-rose-900/60 bg-rose-50/20 dark:bg-rose-950/10"
                                : "border-stone-200 dark:border-stone-800"
                            } rounded-2xl space-y-3 shadow-2xs hover:border-stone-300 transition-colors`}
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2.5 border-b border-stone-100 dark:border-stone-800 gap-2">
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-mono font-bold text-sm text-stone-900 dark:text-stone-100">
                                    #{order.orderNumber}
                                  </span>
                                  {isOrderRejected ? (
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
                                      REJECTED
                                    </span>
                                  ) : (
                                    <span
                                      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                                        order.status === "DELIVERED"
                                          ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
                                          : "bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-300"
                                      }`}
                                    >
                                      {order.status}
                                    </span>
                                  )}
                                </div>
                                <span className="text-[11px] text-stone-500">
                                  {formatDate(order.createdAt)} • {order.items.length} items
                                </span>
                              </div>

                              <div className="text-left sm:text-right">
                                <span className="text-sm font-bold text-stone-900 dark:text-stone-100">
                                  {formatCurrency(order.finalTotal)}
                                </span>
                              </div>
                            </div>

                            {/* REJECTION REASON ALERT BANNER */}
                            {isOrderRejected && (
                              <div className="p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 rounded-xl text-xs text-rose-800 dark:text-rose-300 flex items-start gap-2.5">
                                <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                                <div className="space-y-0.5">
                                  <span className="font-bold block text-rose-900 dark:text-rose-200">
                                    Order Payment Rejected by Studio
                                  </span>
                                  <span className="text-[11.5px] leading-relaxed block text-rose-800 dark:text-rose-300">
                                    Reason: <strong>{rejReason || "Fake or unverified payment details provided. Payment was not credited to studio."}</strong>
                                  </span>
                                  <div className="pt-1">
                                    <a
                                      href={`https://wa.me/919876543210?text=${encodeURIComponent(
                                        `Hello The Fourfold Studio! My order #${order.orderNumber} was marked as rejected (Reason: ${rejReason || "Payment unverified"}). Here is my payment receipt/UTR screenshot.`
                                      )}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700 dark:text-rose-300 hover:underline"
                                    >
                                      <Share2 className="w-3 h-3" />
                                      <span>Contact Studio on WhatsApp →</span>
                                    </a>
                                  </div>
                                </div>
                              </div>
                            )}

                            <div className="space-y-1 text-xs">
                              {order.items.map((item) => (
                                <div key={item.id} className="flex justify-between items-center text-stone-600 dark:text-stone-400">
                                  <span className="truncate max-w-[70%]">
                                    {item.productTitle} × {item.quantity}
                                  </span>
                                  <span className="font-medium text-stone-900 dark:text-stone-100">
                                    {formatCurrency(Number(item.price) * item.quantity)}
                                  </span>
                                </div>
                              ))}
                            </div>

                            <div className="pt-2 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-xs">
                              <span className="text-[11px] text-stone-400">
                                {isOrderRejected ? "Order Cancelled" : `Delivered to ${order.city}, ${order.state}`}
                              </span>
                              <Link
                                href={`/order-confirmation/${order.orderNumber}`}
                                className="text-xs font-semibold text-[#A64732] dark:text-[#E07A5F] hover:underline"
                              >
                                View Receipt →
                              </Link>
                            </div>
                          </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: SAVED ADDRESSES BOOK */}
          {activeTab === "addresses" && (
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="font-serif font-bold text-lg text-stone-900 dark:text-stone-100">
                    Saved Delivery Addresses
                  </h3>
                  <p className="text-xs text-stone-500">
                    Manage your shipping destinations for fast one-click checkout.
                  </p>
                </div>

                <button
                  onClick={handleOpenAddAddress}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#181513] text-[#FAF8F5] dark:bg-[#FAF8F5] dark:text-[#181513] hover:bg-[#A64732] dark:hover:bg-[#E07A5F] rounded-xl text-xs font-semibold transition-all cursor-pointer shadow-sm self-start sm:self-auto"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Address</span>
                </button>
              </div>

              {addressesLoading ? (
                <div className="p-12 text-center text-xs text-stone-500">
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto text-primary mb-2" />
                  <span>Loading address book...</span>
                </div>
              ) : addresses.length === 0 ? (
                <div className="p-12 text-center bg-white dark:bg-[#1C1816] border border-stone-200 dark:border-stone-800 rounded-2xl space-y-3">
                  <MapPin className="w-10 h-10 mx-auto text-stone-300 dark:text-stone-600" />
                  <h4 className="font-serif font-bold text-stone-900 dark:text-stone-100 text-base">
                    No Addresses Saved Yet
                  </h4>
                  <p className="text-xs text-stone-500 max-w-sm mx-auto">
                    Add your home, office, or studio address to expedite your orders.
                  </p>
                  <button
                    onClick={handleOpenAddAddress}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#181513] text-[#FAF8F5] dark:bg-[#FAF8F5] dark:text-[#181513] rounded-xl text-xs font-semibold cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add First Address</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {addresses.map((addr) => (
                    <div
                      key={addr.id}
                      className={`p-5 rounded-2xl border transition-all flex flex-col justify-between space-y-3 bg-white dark:bg-[#1C1816] ${
                        addr.isDefault
                          ? "border-[#A64732]/40 dark:border-[#E07A5F]/40 shadow-sm"
                          : "border-stone-200 dark:border-stone-800 hover:border-stone-300"
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 uppercase">
                              {addr.tag === "HOME" ? (
                                <Home className="w-3.5 h-3.5" />
                              ) : addr.tag === "WORK" ? (
                                <Briefcase className="w-3.5 h-3.5" />
                              ) : (
                                <MapPin className="w-3.5 h-3.5" />
                              )}
                              <span>{addr.tag}</span>
                            </span>

                            {addr.isDefault && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                                Default Shipping
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleOpenEditAddress(addr)}
                              className="p-1.5 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded-lg transition-colors cursor-pointer"
                              title="Edit address"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteAddress(addr.id)}
                              className="p-1.5 text-stone-400 hover:text-red-600 transition-colors rounded-lg cursor-pointer"
                              title="Delete address"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-bold text-sm text-stone-900 dark:text-stone-100">
                            {addr.name}
                          </h4>
                          <p className="text-xs text-stone-600 dark:text-stone-400 mt-1 leading-relaxed">
                            {addr.street}, {addr.city}, {addr.state} - {addr.postalCode}
                          </p>
                          <p className="text-xs text-stone-500 mt-1 flex items-center gap-1">
                            <Phone className="w-3.5 h-3.5" />
                            <span>{addr.phone}</span>
                          </p>
                        </div>
                      </div>

                      {!addr.isDefault && (
                        <div className="pt-2 border-t border-stone-100 dark:border-stone-800">
                          <button
                            onClick={() => handleSetDefaultAddress(addr.id)}
                            className="text-xs font-semibold text-[#A64732] dark:text-[#E07A5F] hover:underline cursor-pointer"
                          >
                            Set as Default Address
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: COUPONS & REWARDS WALLET */}
          {activeTab === "wallet" && (
            <div className="space-y-5">
              <div>
                <h3 className="font-serif font-bold text-lg text-stone-900 dark:text-stone-100">
                  Coupons & Rewards Wallet
                </h3>
                <p className="text-xs text-stone-500">
                  Exclusive promo codes, festive treats, and personal rewards available for your account.
                </p>
              </div>

              {walletLoading ? (
                <div className="p-12 text-center text-xs text-stone-500">
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto text-primary mb-2" />
                  <span>Loading coupons...</span>
                </div>
              ) : walletCoupons.length === 0 ? (
                <div className="p-12 text-center bg-white dark:bg-[#1C1816] border border-stone-200 dark:border-stone-800 rounded-2xl space-y-3">
                  <Tag className="w-10 h-10 mx-auto text-stone-300 dark:text-stone-600" />
                  <h4 className="font-serif font-bold text-stone-900 dark:text-stone-100 text-base">
                    No Active Coupons in Wallet
                  </h4>
                  <p className="text-xs text-stone-500 max-w-sm mx-auto">
                    Check back during festive seasons or subscribe to our newsletter for exclusive patron discount codes.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {walletCoupons.map((c) => {
                    const discountText = c.discountPercent
                      ? `${c.discountPercent}% OFF`
                      : c.discountAmount
                      ? `${formatCurrency(c.discountAmount)} OFF`
                      : "Special Savings";

                    const isPersonal = c.targetAudience === "SPECIFIC_USER";

                    return (
                      <div
                        key={c.id}
                        className={`bg-white dark:bg-[#1C1816] rounded-2xl border p-5 space-y-3 relative overflow-hidden flex flex-col justify-between shadow-2xs transition-all hover:shadow-md ${
                          isPersonal
                            ? "border-blue-300 dark:border-blue-800"
                            : "border-stone-200 dark:border-stone-800"
                        }`}
                      >
                        <div className="space-y-2.5">
                          <div className="flex items-center justify-between">
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary/10 text-primary">
                              <Sparkles className="w-3 h-3" />
                              <span>{discountText}</span>
                            </span>

                            {isPersonal && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                                Just for You
                              </span>
                            )}
                          </div>

                          {/* Code Pill */}
                          <div className="p-3 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl flex items-center justify-between">
                            <span className="font-mono font-bold tracking-wider text-base text-stone-900 dark:text-stone-100">
                              {c.code}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleCopyCoupon(c.code)}
                              className="p-1.5 rounded-lg text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-200 dark:hover:bg-stone-800 transition-colors cursor-pointer"
                              title="Copy code"
                            >
                              {copiedCouponCode === c.code ? (
                                <Check className="w-4 h-4 text-emerald-600" />
                              ) : (
                                <Copy className="w-4 h-4" />
                              )}
                            </button>
                          </div>

                          {/* Details */}
                          <div className="space-y-1 text-xs text-stone-600 dark:text-stone-400">
                            {c.minOrderAmount && (
                              <div className="flex justify-between">
                                <span>Min. Order:</span>
                                <strong className="text-stone-900 dark:text-stone-100 font-medium">
                                  {formatCurrency(c.minOrderAmount)}
                                </strong>
                              </div>
                            )}
                            {c.maxDiscountAmount && (
                              <div className="flex justify-between">
                                <span>Max Discount Cap:</span>
                                <strong className="text-stone-900 dark:text-stone-100 font-medium">
                                  {formatCurrency(c.maxDiscountAmount)}
                                </strong>
                              </div>
                            )}
                            <div className="flex justify-between">
                              <span>Valid Until:</span>
                              <strong className="text-stone-900 dark:text-stone-100 font-medium">
                                {c.expiresAt ? formatDate(c.expiresAt) : "No expiry"}
                              </strong>
                            </div>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-stone-100 dark:border-stone-800">
                          <Link
                            href="/catalog"
                            className="text-xs font-semibold text-[#A64732] dark:text-[#E07A5F] hover:underline flex items-center justify-between"
                          >
                            <span>Shop & Apply at Checkout</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: PROFILE & SECURITY */}
          {activeTab === "profile" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Personal Information */}
              <div className="bg-white dark:bg-[#1C1816] p-6 sm:p-8 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm space-y-5">
                <div className="pb-3 border-b border-stone-100 dark:border-stone-800 flex items-center justify-between">
                  <div>
                    <h3 className="font-serif font-bold text-lg text-stone-900 dark:text-stone-100">
                      Personal Details
                    </h3>
                    <p className="text-xs text-stone-500">
                      Update your name, contact phone, and milestone dates.
                    </p>
                  </div>
                  <span className="text-[10px] font-semibold uppercase px-2.5 py-1 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 rounded-full border border-emerald-200 dark:border-emerald-800">
                    Verified
                  </span>
                </div>

                {profileMsg && (
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-300 rounded-xl text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>{profileMsg}</span>
                  </div>
                )}

                {profileError && (
                  <div className="p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-300 rounded-xl text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{profileError}</span>
                  </div>
                )}

                <form onSubmit={handleProfileSave} className="space-y-4 text-xs">
                  <div>
                    <label className="block text-[10px] font-semibold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      required
                      className="w-full h-11 px-3.5 bg-stone-50 dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={user.email}
                      disabled
                      className="w-full h-11 px-3.5 bg-stone-100 dark:bg-stone-800/60 rounded-xl border border-stone-200 dark:border-stone-800 text-stone-500 cursor-not-allowed"
                    />
                    <p className="text-[10.5px] text-stone-400 mt-1">
                      Registered account email cannot be altered.
                    </p>
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={profilePhone}
                      onChange={(e) => setProfilePhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full h-11 px-3.5 bg-stone-50 dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-semibold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-1">
                        Birthday (Optional)
                      </label>
                      <input
                        type="date"
                        value={profileBirthDate}
                        onChange={(e) => setProfileBirthDate(e.target.value)}
                        className="w-full h-11 px-3 bg-stone-50 dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-primary/20 text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-1">
                        Anniversary (Optional)
                      </label>
                      <input
                        type="date"
                        value={profileAnniversaryDate}
                        onChange={(e) => setProfileAnniversaryDate(e.target.value)}
                        className="w-full h-11 px-3 bg-stone-50 dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-primary/20 text-xs"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={profileSaving}
                    className="w-full h-11 bg-[#181513] text-[#FAF8F5] dark:bg-[#FAF8F5] dark:text-[#181513] rounded-xl text-xs font-semibold uppercase tracking-wider hover:bg-[#A64732] dark:hover:bg-[#E07A5F] transition-colors cursor-pointer shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {profileSaving && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                    <span>Save Personal Details</span>
                  </button>
                </form>
              </div>

              {/* Security & Password with OTP Verification */}
              <div className="bg-white dark:bg-[#1C1816] p-6 sm:p-8 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm space-y-5">
                <div className="pb-3 border-b border-stone-100 dark:border-stone-800">
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-primary" />
                    <h3 className="font-serif font-bold text-lg text-stone-900 dark:text-stone-100">
                      Security & Password
                    </h3>
                  </div>
                  <p className="text-xs text-stone-500 mt-0.5">
                    For your account security, changing your password requires 2-factor OTP verification sent to your email.
                  </p>
                </div>

                {pwMsg && (
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-300 rounded-xl text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>{pwMsg}</span>
                  </div>
                )}

                {pwError && (
                  <div className="p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-300 rounded-xl text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{pwError}</span>
                  </div>
                )}

                {otpDevCode && (
                  <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 text-amber-900 dark:text-amber-200 rounded-xl text-xs font-medium flex items-center justify-between">
                    <span>Dev Security OTP:</span>
                    <strong className="font-mono text-sm tracking-widest">{otpDevCode}</strong>
                  </div>
                )}

                <form onSubmit={handlePasswordSave} className="space-y-4 text-xs">
                  <div>
                    <label className="block text-[10px] font-semibold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-1">
                      Current Password *
                    </label>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      required
                      placeholder="••••••••"
                      className="w-full h-11 px-3.5 bg-stone-50 dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-1">
                      New Password *
                    </label>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      placeholder="At least 6 characters"
                      className="w-full h-11 px-3.5 bg-stone-50 dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-1">
                      Confirm New Password *
                    </label>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      placeholder="Re-type new password"
                      className="w-full h-11 px-3.5 bg-stone-50 dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 flex items-center gap-1.5 cursor-pointer text-[11px]"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      <span>{showPassword ? "Hide passwords" : "Show passwords"}</span>
                    </button>

                    {!otpSent && (
                      <button
                        type="button"
                        onClick={handleSendPasswordOtp}
                        disabled={otpSending}
                        className="px-3 py-1.5 rounded-lg bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-[#A64732] dark:text-[#E07A5F] font-semibold text-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        {otpSending ? <RefreshCw className="w-3 h-3 animate-spin" /> : <KeyRound className="w-3 h-3" />}
                        <span>Send OTP to Email</span>
                      </button>
                    )}
                  </div>

                  {/* OTP Verification Block */}
                  {otpSent && (
                    <div className="p-3.5 bg-stone-50 dark:bg-stone-900 rounded-xl border border-primary/30 space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-800 dark:text-stone-200">
                          Enter 6-Digit Email OTP *
                        </label>
                        <button
                          type="button"
                          onClick={handleSendPasswordOtp}
                          disabled={otpSending}
                          className="text-[11px] text-[#A64732] dark:text-[#E07A5F] hover:underline font-semibold"
                        >
                          Resend Code
                        </button>
                      </div>
                      <input
                        type="text"
                        maxLength={6}
                        inputMode="numeric"
                        pattern="[0-9]{6}"
                        required
                        placeholder="123456"
                        value={passwordOtp}
                        onChange={(e) => setPasswordOtp(e.target.value.replace(/\D/g, ""))}
                        className="w-full text-center text-lg tracking-[0.3em] font-bold font-mono h-11 bg-white dark:bg-[#12100E] rounded-xl border border-stone-200 dark:border-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-primary/20"
                        autoFocus
                      />
                      <p className="text-[10.5px] text-stone-500">
                        Check your inbox for the 6-digit confirmation code.
                      </p>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={pwSaving || !otpSent}
                    className="w-full h-11 bg-[#181513] text-[#FAF8F5] dark:bg-[#FAF8F5] dark:text-[#181513] rounded-xl text-xs font-semibold uppercase tracking-wider hover:bg-[#A64732] dark:hover:bg-[#E07A5F] transition-colors cursor-pointer shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {pwSaving && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                    <span>{otpSent ? "Verify OTP & Update Password" : "Click 'Send OTP to Email' First"}</span>
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Address Form Modal with StoreModal (Guaranteed Fullscreen Blur and Phone Positioning) */}
      <StoreModal
        isOpen={isAddressModalOpen}
        onClose={() => setIsAddressModalOpen(false)}
        maxWidth="max-w-lg"
      >
        <div className="bg-white dark:bg-[#1C1816] rounded-2xl border border-stone-200 dark:border-stone-800 shadow-2xl w-full overflow-hidden flex flex-col max-h-[90dvh]">
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <MapPin className="w-4 h-4" />
              </div>
              <h3 className="font-serif font-bold text-stone-900 dark:text-stone-100 text-base sm:text-lg">
                {editingAddress ? "Edit Delivery Address" : "Add Delivery Address"}
              </h3>
            </div>
            <button
              onClick={() => setIsAddressModalOpen(false)}
              className="p-1.5 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 rounded-lg cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSaveAddress} className="flex-1 flex flex-col min-h-0 overflow-hidden">
            <div className="flex-1 overflow-y-auto min-h-0 p-4 sm:p-5 space-y-4 text-xs">
              {addrError && (
                <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 text-red-600 rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{addrError}</span>
                </div>
              )}

              {/* Address Tag Selector */}
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-1.5">
                  Address Label / Tag *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(["HOME", "WORK", "OTHER"] as const).map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => setAddrTag(tag)}
                      className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        addrTag === tag
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-stone-200 dark:border-stone-800 text-stone-500 hover:bg-stone-50 dark:hover:bg-stone-800/60"
                      }`}
                    >
                      {tag === "HOME" ? (
                        <Home className="w-3.5 h-3.5" />
                      ) : tag === "WORK" ? (
                        <Briefcase className="w-3.5 h-3.5" />
                      ) : (
                        <MapPin className="w-3.5 h-3.5" />
                      )}
                      <span>{tag}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-1">
                    Contact Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Receiver's name"
                    value={addrName}
                    onChange={(e) => setAddrName(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl text-stone-900 dark:text-stone-100 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98765 43210"
                    value={addrPhone}
                    onChange={(e) => setAddrPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl text-stone-900 dark:text-stone-100 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-1">
                  Street Address / Flat / Building *
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="House/Apartment #, Street, Locality"
                  value={addrStreet}
                  onChange={(e) => setAddrStreet(e.target.value)}
                  className="w-full p-3 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl text-stone-900 dark:text-stone-100 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Mumbai"
                    value={addrCity}
                    onChange={(e) => setAddrCity(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl text-stone-900 dark:text-stone-100 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-1">
                    State *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Maharashtra"
                    value={addrState}
                    onChange={(e) => setAddrState(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl text-stone-900 dark:text-stone-100 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-1">
                    PIN Code *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="400050"
                    value={addrPostalCode}
                    onChange={(e) => setAddrPostalCode(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl text-stone-900 dark:text-stone-100 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isDefaultCheck"
                  checked={addrIsDefault}
                  onChange={(e) => setAddrIsDefault(e.target.checked)}
                  className="rounded text-primary focus:ring-primary"
                />
                <label htmlFor="isDefaultCheck" className="text-stone-700 dark:text-stone-300 cursor-pointer">
                  Set as default delivery address for checkout
                </label>
              </div>
            </div>

            <div className="shrink-0 p-3.5 sm:p-4 border-t border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsAddressModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-200 dark:hover:bg-stone-800 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={addrSubmitting}
                className="px-5 py-2 text-xs font-bold bg-[#181513] text-[#FAF8F5] dark:bg-[#FAF8F5] dark:text-[#181513] hover:bg-[#A64732] dark:hover:bg-[#E07A5F] rounded-xl transition-all disabled:opacity-50 flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                {addrSubmitting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                <span>Save Address</span>
              </button>
            </div>
          </form>
        </div>
      </StoreModal>
    </div>
  );
}
