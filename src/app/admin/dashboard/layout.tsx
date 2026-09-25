import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
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
          {children}
        </div>
      </main>
    </div>
  );
}
