"use client";

import { useState, useEffect } from "react";
import { SettingsHeader } from "@/components/admin/SettingsHeader";
import {
  Truck,
  Check,
  Save,
  RefreshCw,
  Sparkles,
  Info,
  ExternalLink,
  DollarSign,
  QrCode,
  CreditCard,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";

const CURRENCIES = [
  { code: "INR", symbol: "₹", label: "Indian Rupee (INR ₹)" },
  { code: "USD", symbol: "$", label: "US Dollar (USD $)" },
  { code: "EUR", symbol: "€", label: "Euro (EUR €)" },
  { code: "GBP", symbol: "£", label: "British Pound (GBP £)" },
  { code: "AED", symbol: "AED", label: "UAE Dirham (AED)" },
  { code: "CAD", symbol: "CA$", label: "Canadian Dollar (CAD $)" },
  { code: "AUD", symbol: "A$", label: "Australian Dollar (AUD $)" },
];

export default function ShippingPaymentSettingsPage() {
  const [currencyCode, setCurrencyCode] = useState("INR");
  const [currencySymbol, setCurrencySymbol] = useState("₹");
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(999);
  const [standardShippingFee, setStandardShippingFee] = useState(99);

  const [enableUpi, setEnableUpi] = useState(true);
  const [enableCod, setEnableCod] = useState(true);
  const [upiId, setUpiId] = useState("");
  const [upiName, setUpiName] = useState("");
  const [codInstructions, setCodInstructions] = useState("");
  const [codFailSafeAlert, setCodFailSafeAlert] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.settings) {
          const s = data.settings;
          setCurrencyCode(s.currencyCode || "INR");
          setCurrencySymbol(s.currencySymbol || "₹");
          setFreeShippingThreshold(s.freeShippingThreshold ?? 999);
          setStandardShippingFee(s.standardShippingFee ?? 99);

          const upi = s.enableUpi ?? true;
          let cod = s.enableCod ?? true;
          if (!upi && !cod) cod = true;
          setEnableUpi(upi);
          setEnableCod(cod);

          setUpiId(s.upiId || "");
          setUpiName(s.upiName || "");
          setCodInstructions(s.codInstructions || "");
        }
      })
      .catch(() => setError("Failed to load shipping & payment settings"))
      .finally(() => setLoading(false));
  }, []);

  const handleCurrencySelect = (code: string) => {
    setCurrencyCode(code);
    const curr = CURRENCIES.find((c) => c.code === code);
    if (curr) setCurrencySymbol(curr.symbol);
  };

  const handleToggleUpi = () => {
    if (enableUpi && !enableCod) {
      setCodFailSafeAlert(true);
      return;
    }
    setCodFailSafeAlert(false);
    setEnableUpi(!enableUpi);
  };

  const handleToggleCod = () => {
    if (enableCod && !enableUpi) {
      setCodFailSafeAlert(true);
      return;
    }
    setCodFailSafeAlert(false);
    setEnableCod(!enableCod);
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!enableUpi && !enableCod) {
      setCodFailSafeAlert(true);
      return;
    }

    setSaving(true);
    setSuccess("");
    setError("");

    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studioSettings: {
            currencyCode,
            currencySymbol,
            freeShippingThreshold: Number(freeShippingThreshold),
            standardShippingFee: Number(standardShippingFee),
            enableUpi,
            enableCod,
            upiId,
            upiName,
            codInstructions,
          },
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update shipping & payment settings");
      }

      setSuccess("Shipping rates & payment settings updated successfully!");
      window.dispatchEvent(new CustomEvent("studio_settings_updated"));
    } catch (err: any) {
      setError(err.message || "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <SettingsHeader
        title="Shipping, Rates & Payments"
        subtitle="Manage checkout delivery thresholds, studio shipping fees, currency format, and customer payment methods (UPI QR Code & Cash on Delivery)."
        icon={Truck}
        badge="Shipping & Payments"
        actions={
          <button
            onClick={() => handleSave()}
            disabled={saving || loading}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#A64732] hover:bg-[#8D3825] text-white text-xs font-semibold shadow-xs disabled:opacity-50 transition-colors cursor-pointer"
          >
            {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            <span>{saving ? "Saving..." : "Save Shipping & Payments"}</span>
          </button>
        }
      />

      {success && (
        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>{success}</span>
          </div>
          <Link
            href="/checkout"
            target="_blank"
            className="underline font-semibold hover:opacity-80 inline-flex items-center gap-1"
          >
            <span>Preview Checkout</span>
            <ExternalLink className="w-3 h-3" />
          </Link>
        </div>
      )}

      {codFailSafeAlert && (
        <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            <strong>Fail-safe Protection:</strong> At least one checkout payment method (UPI or Cash on Delivery) must remain enabled so customers can place orders.
          </span>
        </div>
      )}

      {error && (
        <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs">
          {error}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: Currency & Shipping Thresholds */}
        <div className="bg-[#FAF8F5] dark:bg-[#151210] border border-[#E5DFD4] dark:border-[#2A231F] rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#E5DFD4] dark:border-[#2A231F]">
            <DollarSign className="w-4 h-4 text-[#A64732] dark:text-[#E07A5F]" />
            <h2 className="text-sm font-bold text-[#181513] dark:text-[#FAF8F5]">
              1. Store Currency & Delivery Charges
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#181513] dark:text-[#FAF8F5]">
                Store Currency
              </label>
              <select
                value={currencyCode}
                onChange={(e) => handleCurrencySelect(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#D0C5B4] dark:border-[#38302A] bg-white dark:bg-[#1C1815] text-[#181513] dark:text-[#FAF8F5] text-xs outline-hidden focus:ring-1 focus:ring-[#A64732]"
              >
                {CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.label}
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-[#786F64] dark:text-[#A89F91]">
                Symbol: <span className="font-bold text-[#181513] dark:text-[#FAF8F5]">{currencySymbol}</span>
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#181513] dark:text-[#FAF8F5]">
                Free Shipping Threshold ({currencySymbol})
              </label>
              <input
                type="number"
                min="0"
                value={freeShippingThreshold}
                onChange={(e) => setFreeShippingThreshold(Number(e.target.value))}
                className="w-full px-3.5 py-2 rounded-xl border border-[#D0C5B4] dark:border-[#38302A] bg-white dark:bg-[#1C1815] text-[#181513] dark:text-[#FAF8F5] text-xs outline-hidden focus:ring-1 focus:ring-[#A64732]"
              />
              <p className="text-[11px] text-[#786F64] dark:text-[#A89F91]">
                Orders equal or above this get free shipping.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#181513] dark:text-[#FAF8F5]">
                Standard Delivery Fee ({currencySymbol})
              </label>
              <input
                type="number"
                min="0"
                value={standardShippingFee}
                onChange={(e) => setStandardShippingFee(Number(e.target.value))}
                className="w-full px-3.5 py-2 rounded-xl border border-[#D0C5B4] dark:border-[#38302A] bg-white dark:bg-[#1C1815] text-[#181513] dark:text-[#FAF8F5] text-xs outline-hidden focus:ring-1 focus:ring-[#A64732]"
              />
              <p className="text-[11px] text-[#786F64] dark:text-[#A89F91]">
                Charged when cart is below free shipping mark.
              </p>
            </div>
          </div>
        </div>

        {/* Section 2: Direct UPI QR Code Payments */}
        <div className="bg-[#FAF8F5] dark:bg-[#151210] border border-[#E5DFD4] dark:border-[#2A231F] rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E5DFD4] dark:border-[#2A231F]">
            <div className="flex items-center gap-2">
              <QrCode className="w-4 h-4 text-[#A64732] dark:text-[#E07A5F]" />
              <h2 className="text-sm font-bold text-[#181513] dark:text-[#FAF8F5]">
                2. Direct UPI QR Code Payment (0% Gateway Commission)
              </h2>
            </div>
            <button
              type="button"
              onClick={handleToggleUpi}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                enableUpi ? "bg-[#A64732] dark:bg-[#E07A5F]" : "bg-[#D0C5B4] dark:bg-[#38302A]"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                  enableUpi ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#181513] dark:text-[#FAF8F5]">
                UPI VPA ID
              </label>
              <input
                type="text"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                placeholder="e.g. mecommerce@oksbi"
                className="w-full px-3.5 py-2 rounded-xl border border-[#D0C5B4] dark:border-[#38302A] bg-white dark:bg-[#1C1815] text-[#181513] dark:text-[#FAF8F5] text-xs outline-hidden focus:ring-1 focus:ring-[#A64732]"
              />
              <p className="text-[11px] text-[#786F64] dark:text-[#A89F91]">
                Generates a live dynamic payment QR code with the exact order total encoded.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#181513] dark:text-[#FAF8F5]">
                Payee / Studio Display Name
              </label>
              <input
                type="text"
                value={upiName}
                onChange={(e) => setUpiName(e.target.value)}
                placeholder="e.g. M.E-Commerce Studio"
                className="w-full px-3.5 py-2 rounded-xl border border-[#D0C5B4] dark:border-[#38302A] bg-white dark:bg-[#1C1815] text-[#181513] dark:text-[#FAF8F5] text-xs outline-hidden focus:ring-1 focus:ring-[#A64732]"
              />
              <p className="text-[11px] text-[#786F64] dark:text-[#A89F91]">
                Shown in Google Pay, PhonePe, and Paytm when customer scans the QR code.
              </p>
            </div>
          </div>
        </div>

        {/* Section 3: Cash on Delivery (COD) */}
        <div className="bg-[#FAF8F5] dark:bg-[#151210] border border-[#E5DFD4] dark:border-[#2A231F] rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E5DFD4] dark:border-[#2A231F]">
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-[#A64732] dark:text-[#E07A5F]" />
              <h2 className="text-sm font-bold text-[#181513] dark:text-[#FAF8F5]">
                3. Cash on Delivery (COD)
              </h2>
            </div>
            <button
              type="button"
              onClick={handleToggleCod}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                enableCod ? "bg-[#A64732] dark:bg-[#E07A5F]" : "bg-[#D0C5B4] dark:bg-[#38302A]"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                  enableCod ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#181513] dark:text-[#FAF8F5]">
              COD Handover Instructions (Optional)
            </label>
            <textarea
              rows={2}
              value={codInstructions}
              onChange={(e) => setCodInstructions(e.target.value)}
              placeholder="e.g. Please keep exact cash ready upon delivery. Our courier partner will verify the wax seal before opening."
              className="w-full px-3.5 py-2 rounded-xl border border-[#D0C5B4] dark:border-[#38302A] bg-white dark:bg-[#1C1815] text-[#181513] dark:text-[#FAF8F5] text-xs outline-hidden focus:ring-1 focus:ring-[#A64732]"
            />
            <p className="text-[11px] text-[#786F64] dark:text-[#A89F91]">
              Displayed to customers who select Cash on Delivery on the final checkout screen.
            </p>
          </div>
        </div>

        {/* Bottom Save Action */}
        <div className="pt-2 flex items-center justify-end">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#A64732] hover:bg-[#8D3825] text-white text-xs font-semibold shadow-xs disabled:opacity-50 transition-colors cursor-pointer"
          >
            {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            <span>{saving ? "Saving Changes..." : "Save Shipping & Payments"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
