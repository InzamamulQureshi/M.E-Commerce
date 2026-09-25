"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/store/ThemeToggle";
import {
  LayoutDashboard,
  Package,
  PlusCircle,
  Folders,
  ClipboardList,
  MessageSquare,
  ExternalLink,
  LogOut,
  Menu,
  X,
  ShieldCheck,
  TicketPercent,
  Users,
  Settings,
  ChevronDown,
} from "lucide-react";

export function AdminSidebar({ initialStoreName }: { initialStoreName?: string }) {
  const [storeName, setStoreName] = useState(initialStoreName || "The Fourfold");
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.settings?.storeName) {
          setStoreName(data.settings.storeName);
        }
      })
      .catch(() => {});

    const handleSettingsUpdate = (e: any) => {
      if (e?.detail?.storeName) {
        setStoreName(e.detail.storeName);
      }
    };
    window.addEventListener("studio_settings_updated", handleSettingsUpdate);
    return () => {
      window.removeEventListener("studio_settings_updated", handleSettingsUpdate);
    };
  }, []);

  const navItems = [
    {
      label: "Studio Overview",
      href: "/admin/dashboard",
      icon: LayoutDashboard,
      active: pathname === "/admin/dashboard",
    },
    {
      label: "Order Fulfillment",
      href: "/admin/dashboard/orders",
      icon: ClipboardList,
      active: pathname === "/admin/dashboard/orders",
    },
    {
      label: "Catalog Creations",
      href: "/admin/dashboard/products",
      icon: Package,
      active:
        (pathname === "/admin/dashboard/products" ||
          pathname.startsWith("/admin/dashboard/products/")) &&
        pathname !== "/admin/dashboard/products/new",
    },
    {
      label: "Add New Gift",
      href: "/admin/dashboard/products/new",
      icon: PlusCircle,
      active: pathname === "/admin/dashboard/products/new",
      highlight: true,
    },
    {
      label: "Collections & Tags",
      href: "/admin/dashboard/categories",
      icon: Folders,
      active: pathname === "/admin/dashboard/categories",
    },
    {
      label: "Coupons & Promos",
      href: "/admin/dashboard/coupons",
      icon: TicketPercent,
      active: pathname === "/admin/dashboard/coupons",
    },
    {
      label: "Customer Directory",
      href: "/admin/dashboard/customers",
      icon: Users,
      active: pathname === "/admin/dashboard/customers",
    },
    {
      label: "Customer Reviews",
      href: "/admin/dashboard/reviews",
      icon: MessageSquare,
      active: pathname === "/admin/dashboard/reviews",
    },
    {
      label: "Studio Settings",
      href: "/admin/dashboard/settings",
      icon: Settings,
      active: pathname.startsWith("/admin/dashboard/settings"),
    },
  ];

  const settingsSubItems = [
    { label: "Hub & Branding", href: "/admin/dashboard/settings", exact: true },
    { label: "Color Themes", href: "/admin/dashboard/settings/themes" },
    { label: "Header & Navigation", href: "/admin/dashboard/settings/announcement" },
    { label: "Homepage & Hero", href: "/admin/dashboard/settings/homepage" },
    { label: "Product Page Layout", href: "/admin/dashboard/settings/product-page" },
    { label: "Shipping & Payments", href: "/admin/dashboard/settings/shipping" },
    { label: "Story & Contact", href: "/admin/dashboard/settings/story" },
    { label: "Security & Passcode", href: "/admin/dashboard/settings/security" },
  ];

  const isSettingsSection = pathname.startsWith("/admin/dashboard/settings");

  const renderNavLinks = () => (
    <nav className="p-2 space-y-0.5 text-[11px] font-medium tracking-wide">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = item.active;

        if (item.highlight) {
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-[#A64732] text-white hover:bg-[#8D3825] dark:bg-[#E07A5F] dark:hover:bg-[#D46548] dark:text-[#181513] transition-colors font-semibold shadow-xs"
            >
              <Icon className="w-3.5 h-3.5 shrink-0" />
              <span>+ Add New Gift</span>
            </Link>
          );
        }

        const isSettings = item.href === "/admin/dashboard/settings";

        return (
          <div key={item.href}>
            <Link
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg transition-colors ${
                isActive
                  ? "bg-[#181513] text-[#FAF8F5] dark:bg-[#FAF8F5] dark:text-[#181513] font-bold shadow-xs"
                  : "text-[#575048] dark:text-[#A89F91] hover:bg-[#DDD5C7]/60 dark:hover:bg-[#25211E] hover:text-[#181513] dark:hover:text-[#FAF8F5]"
              }`}
            >
              <div className="flex items-center gap-2 truncate">
                <Icon
                  className={`w-3.5 h-3.5 shrink-0 ${
                    isActive
                      ? "text-[#FAF8F5] dark:text-[#181513]"
                      : "text-[#786F64] dark:text-[#A89F91]"
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </div>
              {isSettings && (
                <ChevronDown
                  className={`w-3 h-3 transition-transform ${
                    isSettingsSection ? "rotate-180 text-inherit" : "opacity-50"
                  }`}
                />
              )}
            </Link>

            {/* Subpages when inside Studio Settings */}
            {isSettings && isSettingsSection && (
              <div className="ml-3 pl-2.5 my-1 border-l-2 border-[#D0C5B4] dark:border-[#38302A] space-y-0.5">
                {settingsSubItems.map((sub) => {
                  const isSubActive = sub.exact
                    ? pathname === sub.href
                    : pathname === sub.href || pathname.startsWith(sub.href + "/");
                  return (
                    <Link
                      key={sub.href}
                      href={sub.href}
                      onClick={() => setMobileOpen(false)}
                      className={`block px-2 py-1 rounded text-[10px] transition-colors truncate ${
                        isSubActive
                          ? "bg-[#A64732]/15 dark:bg-[#E07A5F]/20 text-[#A64732] dark:text-[#E07A5F] font-bold"
                          : "text-[#786F64] dark:text-[#A89F91] hover:text-[#181513] dark:hover:text-[#FAF8F5] hover:bg-[#DDD5C7]/40 dark:hover:bg-[#25211E]/40"
                      }`}
                    >
                      {sub.label}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );

  return (
    <>
      {/* Mobile Top App Bar */}
      <header className="lg:hidden shrink-0 sticky top-0 z-40 bg-[#EBE3D6]/95 dark:bg-[#151210]/95 backdrop-blur-md border-b border-[#D0C5B4] dark:border-[#2A231F] px-4 py-2.5 flex items-center justify-between transition-colors">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-1.5 rounded-lg border border-[#C5B9A6] dark:border-[#38322D] text-[#181513] dark:text-[#FAF8F5] hover:border-[#181513] dark:hover:border-[#FAF8F5] transition-colors cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
          <div>
            <span className="font-bold text-xs tracking-tight text-[#181513] dark:text-[#FAF8F5] uppercase block truncate max-w-[130px]" title={storeName}>
              {storeName}
            </span>
            <span className="text-[8px] text-[#A64732] dark:text-[#E07A5F] uppercase tracking-[0.2em] block font-bold">
              Admin Portal
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle variant="circle" />
          <Link
            href="/"
            target="_blank"
            className="text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full border border-[#C5B9A6] dark:border-[#38322D] text-[#181513] dark:text-[#FAF8F5] flex items-center gap-1 hover:border-[#181513] dark:hover:border-[#FAF8F5]"
          >
            <span>Store</span>
            <ExternalLink className="w-2.5 h-2.5" />
          </Link>
        </div>
      </header>

      {/* Mobile Drawer Backdrop & Drawer (Scrollable & Viewport Safe) */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-xs transition-opacity"
          onClick={() => setMobileOpen(false)}
        >
          <div
            className="w-72 max-w-[85vw] h-[100dvh] bg-[#EBE3D6] dark:bg-[#151210] border-r border-[#D0C5B4] dark:border-[#2A231F] flex flex-col shadow-2xl animate-in slide-in-from-left duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header (shrink-0) */}
            <div className="shrink-0 p-4 border-b border-[#D0C5B4] dark:border-[#2A231F] flex items-center justify-between">
              <div>
                <div className="text-sm font-bold tracking-tight text-[#181513] dark:text-[#FAF8F5] uppercase truncate max-w-[170px]" title={storeName}>
                  {storeName}
                </div>
                <div className="text-[8px] tracking-[0.2em] uppercase text-[#A64732] dark:text-[#E07A5F] font-bold mt-0.5 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  <span>Studio Vault</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="p-1.5 rounded-lg text-[#786F64] dark:text-[#A89F91] hover:text-[#181513] dark:hover:text-[#FAF8F5] cursor-pointer"
                aria-label="Close navigation drawer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Nav Items */}
            <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain">
              {renderNavLinks()}
            </div>

            {/* Bottom Actions (shrink-0) */}
            <div className="shrink-0 p-3 border-t border-[#D0C5B4] dark:border-[#2A231F] space-y-1.5">
              <Link
                href="/"
                target="_blank"
                className="flex items-center justify-between px-2.5 py-1.5 rounded-lg border border-[#C5B9A6] dark:border-[#38322D] text-[11px] font-semibold text-[#181513] dark:text-[#FAF8F5] hover:border-[#181513] dark:hover:border-[#FAF8F5] transition-colors"
              >
                <span>Customer Store</span>
                <ExternalLink className="w-3 h-3" />
              </Link>

              <form action="/api/auth/logout" method="POST">
                <button
                  type="submit"
                  className="w-full flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold text-[#A64732] dark:text-[#E07A5F] hover:bg-[#DDD5C7]/60 dark:hover:bg-[#25211E] transition-colors cursor-pointer"
                >
                  <LogOut className="w-3 h-3" />
                  <span>Lock Vault & Sign Out</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Sidebar (Rigidly locked width, fixed height) */}
      <aside className="hidden lg:flex w-56 min-w-[224px] max-w-[224px] shrink-0 h-screen sticky top-0 bg-[#EBE3D6] dark:bg-[#151210] border-r border-[#D0C5B4] dark:border-[#2A231F] flex-col justify-between transition-colors z-30 select-none">
        <div className="overflow-y-auto">
          {/* Studio Brand Header */}
          <div className="p-3.5 border-b border-[#D0C5B4] dark:border-[#2A231F] flex items-center justify-between">
            <Link href="/admin/dashboard" className="block max-w-[155px]">
              <span className="text-sm font-bold tracking-tight text-[#181513] dark:text-[#FAF8F5] block uppercase truncate" title={storeName}>
                {storeName}
              </span>
              <div className="text-[8.5px] tracking-[0.2em] uppercase text-[#A64732] dark:text-[#E07A5F] font-bold mt-0.5 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                <span>Studio Admin</span>
              </div>
            </Link>
            <ThemeToggle />
          </div>

          {/* Navigation Links */}
          {renderNavLinks()}
        </div>

        {/* Bottom Actions: Store link & Logout */}
        <div className="p-3 border-t border-[#D0C5B4] dark:border-[#2A231F] space-y-1.5">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between px-2.5 py-1.5 rounded-lg border border-[#C5B9A6] dark:border-[#38322D] bg-white/50 dark:bg-[#1E1916]/50 text-[11px] font-semibold text-[#181513] dark:text-[#FAF8F5] hover:border-[#181513] dark:hover:border-[#FAF8F5] transition-colors group"
          >
            <span className="group-hover:text-[#A64732] dark:group-hover:text-[#E07A5F] transition-colors">
              Customer Store
            </span>
            <ExternalLink className="w-3 h-3 text-[#786F64] dark:text-[#A89F91]" />
          </Link>

          <form action="/api/auth/logout" method="POST">
            <button
              type="submit"
              className="w-full flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold text-[#A64732] dark:text-[#E07A5F] hover:bg-[#DDD5C7]/60 dark:hover:bg-[#25211E] transition-colors cursor-pointer"
            >
              <LogOut className="w-3 h-3" />
              <span>Lock & Sign Out</span>
            </button>
          </form>
        </div>
      </aside>

      {/* Mobile Sticky Bottom Navigation Bar (Symmetrical 5-Column Grid with Safe-Area Alignment) */}
      <nav
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#FAF8F5]/98 dark:bg-[#1A1715]/98 backdrop-blur-lg border-t border-[#E5DFD4] dark:border-[#2E2925] shadow-lg transition-colors"
        style={{ paddingBottom: "max(0.35rem, env(safe-area-inset-bottom, 0px))" }}
      >
        <div className="grid grid-cols-5 items-center w-full max-w-lg mx-auto h-14 sm:h-16 px-1">
          {/* 1. Overview */}
          <Link
            href="/admin/dashboard"
            className={`flex flex-col items-center justify-center h-full py-1 text-center transition-colors ${
              pathname === "/admin/dashboard"
                ? "text-[#A64732] dark:text-[#E07A5F] font-bold"
                : "text-[#786F64] dark:text-[#A89F91] hover:text-[#181513] dark:hover:text-[#FAF8F5]"
            }`}
          >
            <LayoutDashboard className="w-5 h-5 shrink-0" />
            <span className="text-[10px] tracking-tight leading-tight mt-1 whitespace-nowrap">
              Overview
            </span>
          </Link>

          {/* 2. Orders */}
          <Link
            href="/admin/dashboard/orders"
            className={`flex flex-col items-center justify-center h-full py-1 text-center transition-colors ${
              pathname === "/admin/dashboard/orders"
                ? "text-[#A64732] dark:text-[#E07A5F] font-bold"
                : "text-[#786F64] dark:text-[#A89F91] hover:text-[#181513] dark:hover:text-[#FAF8F5]"
            }`}
          >
            <ClipboardList className="w-5 h-5 shrink-0" />
            <span className="text-[10px] tracking-tight leading-tight mt-1 whitespace-nowrap">
              Orders
            </span>
          </Link>

          {/* 3. Add Gift (Prominent Action Item Aligned In Grid) */}
          <Link
            href="/admin/dashboard/products/new"
            className="flex flex-col items-center justify-center h-full py-1 text-center group"
          >
            <div className="w-8 h-8 rounded-full bg-[#A64732] hover:bg-[#8D3825] dark:bg-[#E07A5F] dark:hover:bg-[#D46548] text-white dark:text-[#181513] flex items-center justify-center shadow-xs transition-transform group-active:scale-95">
              <PlusCircle className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-bold text-[#A64732] dark:text-[#E07A5F] tracking-tight leading-tight mt-0.5 whitespace-nowrap">
              New Gift
            </span>
          </Link>

          {/* 4. Customer Directory */}
          <Link
            href="/admin/dashboard/customers"
            className={`flex flex-col items-center justify-center h-full py-1 text-center transition-colors ${
              pathname === "/admin/dashboard/customers"
                ? "text-[#A64732] dark:text-[#E07A5F] font-bold"
                : "text-[#786F64] dark:text-[#A89F91] hover:text-[#181513] dark:hover:text-[#FAF8F5]"
            }`}
          >
            <Users className="w-5 h-5 shrink-0" />
            <span className="text-[10px] tracking-tight leading-tight mt-1 whitespace-nowrap">
              Patrons
            </span>
          </Link>

          {/* 5. Mobile Drawer Menu Toggle */}
          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            className={`flex flex-col items-center justify-center h-full py-1 text-center transition-colors cursor-pointer ${
              mobileOpen ||
              (pathname.startsWith("/admin/dashboard/settings") ||
                pathname.startsWith("/admin/dashboard/categories") ||
                pathname.startsWith("/admin/dashboard/coupons") ||
                pathname.startsWith("/admin/dashboard/reviews") ||
                pathname.startsWith("/admin/dashboard/products"))
                ? "text-[#A64732] dark:text-[#E07A5F] font-bold"
                : "text-[#786F64] dark:text-[#A89F91] hover:text-[#181513] dark:hover:text-[#FAF8F5]"
            }`}
          >
            <Menu className="w-5 h-5 shrink-0" />
            <span className="text-[10px] tracking-tight leading-tight mt-1 whitespace-nowrap">
              Menu
            </span>
          </button>
        </div>
      </nav>
    </>
  );
}
