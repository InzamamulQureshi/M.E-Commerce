import { redirect } from "next/navigation";
import { getAdminSession, isDemoAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await getAdminSession();
  if (!admin) {
    redirect("/admin/login");
  }

  let storeName = "M.E-Commerce";
  try {
    const setting = await db.studioSetting.findUnique({
      where: { id: "default" },
      select: { storeName: true },
    });
    if (setting?.storeName) {
      storeName = setting.storeName;
    }
  } catch {}

  return (
    <div className="h-[100dvh] overflow-hidden bg-[#F2EDE5] dark:bg-[#0C0A09] flex flex-col lg:flex-row text-[#181513] dark:text-[#FAF8F5] transition-colors duration-200">
      {/* Sidebar Navigation: Locked rigid width on desktop, sticky header + bottom nav on mobile */}
      <AdminSidebar initialStoreName={storeName} />

      {/* Main Admin Content Canvas: Correctly fills flex-1 remaining space without overflow cutoff */}
      <main className="flex-1 min-h-0 overflow-y-auto p-3 sm:p-4 lg:p-5 w-full min-w-0 overscroll-contain">
        <div className="max-w-[1400px] mx-auto pb-28 sm:pb-32 lg:pb-8">
          {isDemoAdmin(admin) && (
            <div className="mb-4 p-3.5 sm:p-4 rounded-xl border border-amber-300 dark:border-amber-600/40 bg-gradient-to-r from-amber-500/10 via-amber-400/5 to-transparent flex flex-wrap items-center justify-between gap-3 text-amber-900 dark:text-amber-200 text-xs sm:text-sm font-medium shadow-sm backdrop-blur-sm">
              <div className="flex items-center gap-2.5">
                <span className="flex h-2.5 w-2.5 rounded-full bg-amber-500 animate-pulse" />
                <span>
                  <strong>Demo Admin Preview:</strong> You are exploring in read-only preview mode. All create, edit, and delete actions are safely blocked to keep data intact.
                </span>
              </div>
              <span className="px-2.5 py-0.5 text-[10px] font-bold tracking-wider uppercase rounded-full bg-amber-200 dark:bg-amber-900/60 text-amber-900 dark:text-amber-300 border border-amber-400/30 whitespace-nowrap">
                Read-Only
              </span>
            </div>
          )}
          {children}
        </div>
      </main>
    </div>
  );
}
