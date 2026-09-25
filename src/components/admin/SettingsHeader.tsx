"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Settings,
  Palette,
  Megaphone,
  LayoutGrid,
  Package,
  Truck,
  BookOpen,
  Shield,
  ArrowLeft,
  ExternalLink,
  Share2,
} from "lucide-react";

interface SettingsHeaderProps {
  title: string;
  subtitle: string;
  icon?: React.ElementType;
  badge?: string;
  actions?: React.ReactNode;
}

const SETTINGS_PAGES = [
  { label: "Hub & Branding", href: "/admin/dashboard/settings", icon: Settings, exact: true },
  { label: "SEO & OG Branding", href: "/admin/dashboard/settings/branding", icon: Share2 },
  { label: "Color Themes", href: "/admin/dashboard/settings/themes", icon: Palette },
  { label: "Announcement Bar", href: "/admin/dashboard/settings/announcement", icon: Megaphone },
  { label: "Homepage & Hero", href: "/admin/dashboard/settings/homepage", icon: LayoutGrid },
  { label: "Product Page", href: "/admin/dashboard/settings/product-page", icon: Package },
  { label: "Shipping & Payments", href: "/admin/dashboard/settings/shipping", icon: Truck },
  { label: "Story & Contact", href: "/admin/dashboard/settings/story", icon: BookOpen },
  { label: "Security", href: "/admin/dashboard/settings/security", icon: Shield },
];

export function SettingsHeader({
  title,
  subtitle,
  icon: Icon = Settings,
  badge = "Studio Settings",
  actions,
}: SettingsHeaderProps) {
  const pathname = usePathname();

  return (
    <div className="space-y-4 mb-6">
      {/* Top Breadcrumb & Quick Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <Link
            href="/admin/dashboard/settings"
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#E5DFD4] dark:bg-[#25211E] text-[#575048] dark:text-[#A89F91] hover:text-[#181513] dark:hover:text-[#FAF8F5] transition-colors font-medium"
          >
            <ArrowLeft className="w-3 h-3" />
            <span>Settings Hub</span>
          </Link>
          <span className="text-[#A89F91] dark:text-[#575048]">/</span>
          <span className="text-[#A64732] dark:text-[#E07A5F] font-semibold">
            {badge}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/"
            target="_blank"
            className="inline-flex items-center gap-1 text-[11px] font-medium text-[#786F64] dark:text-[#A89F91] hover:text-[#181513] dark:hover:text-[#FAF8F5]"
          >
            <span>Preview Storefront</span>
            <ExternalLink className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* Main Header Banner */}
      <div className="bg-[#FAF8F5] dark:bg-[#151210] border border-[#E5DFD4] dark:border-[#2A231F] rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-[#A64732]/10 dark:bg-[#E07A5F]/15 text-[#A64732] dark:text-[#E07A5F] flex items-center justify-center shrink-0 border border-[#A64732]/20 dark:border-[#E07A5F]/25">
            <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-[#181513] dark:text-[#FAF8F5]">
                {title}
              </h1>
            </div>
            <p className="text-xs sm:text-[13px] text-[#786F64] dark:text-[#A89F91] mt-0.5 max-w-2xl leading-relaxed">
              {subtitle}
            </p>
          </div>
        </div>

        {actions && <div className="shrink-0 flex items-center gap-2.5">{actions}</div>}
      </div>

      {/* Subpage Navigation Pills for Fast Switching */}
      <div className="overflow-x-auto pb-1 scrollbar-none">
        <div className="flex items-center gap-1.5 min-w-max">
          {SETTINGS_PAGES.map((page) => {
            const isCurrent = page.exact
              ? pathname === page.href
              : pathname === page.href || pathname.startsWith(page.href + "/");
            const PageIcon = page.icon;

            return (
              <Link
                key={page.href}
                href={page.href}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all ${
                  isCurrent
                    ? "bg-[#181513] text-white dark:bg-[#FAF8F5] dark:text-[#181513] shadow-xs font-semibold"
                    : "bg-[#FAF8F5]/80 dark:bg-[#181513]/60 text-[#786F64] dark:text-[#A89F91] border border-[#E5DFD4] dark:border-[#2A231F] hover:border-[#181513] dark:hover:border-[#FAF8F5] hover:text-[#181513] dark:hover:text-[#FAF8F5]"
                }`}
              >
                <PageIcon className={`w-3.5 h-3.5 ${isCurrent ? "text-inherit" : "opacity-70"}`} />
                <span>{page.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
