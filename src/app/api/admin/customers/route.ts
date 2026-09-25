import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAdminSession } from "@/lib/auth";
import { CustomerStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

// GET all registered customers with aggregate order statistics & status filtering
export async function GET(request: Request) {
  const admin = await getAdminSession();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized artisan access" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q")?.toLowerCase().trim() || "";
    const statusParam = searchParams.get("status")?.toUpperCase().trim() || "ALL";

    const statusFilter =
      statusParam !== "ALL" && ["ACTIVE", "SUSPENDED", "BANNED"].includes(statusParam)
        ? (statusParam as CustomerStatus)
        : undefined;

    const whereClause: any = {
      role: "CUSTOMER",
    };

    if (statusFilter) {
      whereClause.status = statusFilter;
    }

    if (query) {
      whereClause.OR = [
        { name: { contains: query } },
        { email: { contains: query } },
        { phone: { contains: query } },
        { city: { contains: query } },
      ];
    }

    const [users, countAll, countActive, countSuspended, countBanned] = await Promise.all([
      db.user.findMany({
        where: whereClause,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          address: true,
          city: true,
          state: true,
          postalCode: true,
          emailVerified: true,
          status: true,
          statusReason: true,
          statusUpdatedAt: true,
          createdAt: true,
          orders: {
            select: {
              id: true,
              orderNumber: true,
              finalTotal: true,
              status: true,
              createdAt: true,
            },
            orderBy: { createdAt: "desc" },
          },
        },
      }),
      db.user.count({ where: { role: "CUSTOMER" } }),
      db.user.count({ where: { role: "CUSTOMER", status: "ACTIVE" } }),
      db.user.count({ where: { role: "CUSTOMER", status: "SUSPENDED" } }),
      db.user.count({ where: { role: "CUSTOMER", status: "BANNED" } }),
    ]);

    const customers = users.map((u) => {
      const orderCount = u.orders.length;
      const totalSpent = u.orders.reduce((sum, o) => sum + Number(o.finalTotal), 0);
      const lastOrder = u.orders[0] || null;

      return {
        id: u.id,
        name: u.name,
        email: u.email,
        phone: u.phone,
        address: u.address,
        city: u.city,
        state: u.state,
        postalCode: u.postalCode,
        emailVerified: u.emailVerified,
        status: u.status || "ACTIVE",
        statusReason: u.statusReason || null,
        statusUpdatedAt: u.statusUpdatedAt ? u.statusUpdatedAt.toISOString() : null,
        joinedAt: u.createdAt,
        orderCount,
        totalSpent,
        lastOrderDate: lastOrder ? lastOrder.createdAt : null,
        recentOrders: u.orders.slice(0, 3),
      };
    });

    return NextResponse.json({
      customers,
      counts: {
        all: countAll,
        active: countActive,
        suspended: countSuspended,
        banned: countBanned,
      },
    });
  } catch (error: any) {
    console.error("Fetch customers error:", error);
    return NextResponse.json({ error: "Failed to load customer directory" }, { status: 500 });
  }
}

// PUT update customer moderation status (ACTIVE, SUSPENDED, BANNED)
export async function PUT(request: Request) {
  const admin = await getAdminSession();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized artisan access" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { customerId, status, reason } = body;

    if (!customerId) {
      return NextResponse.json({ error: "Customer ID is required" }, { status: 400 });
    }

    if (!status || !["ACTIVE", "SUSPENDED", "BANNED"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status. Must be ACTIVE, SUSPENDED, or BANNED." },
        { status: 400 }
      );
    }

    const customer = await db.user.findUnique({
      where: { id: customerId },
    });

    if (!customer) {
      return NextResponse.json({ error: "Customer not found." }, { status: 404 });
    }

    if (customer.role === "ADMIN") {
      return NextResponse.json({ error: "Cannot modify status of administrator." }, { status: 403 });
    }

    const updatedUser = await db.user.update({
      where: { id: customerId },
      data: {
        status: status as CustomerStatus,
        statusReason: reason ? String(reason).trim() : null,
        statusUpdatedAt: new Date(),
      },
      select: {
        id: true,
        name: true,
        email: true,
        status: true,
        statusReason: true,
        statusUpdatedAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Customer ${status === "ACTIVE" ? "reactivated" : status.toLowerCase()} successfully.`,
      customer: updatedUser,
    });
  } catch (error: any) {
    console.error("Update customer status error:", error);
    return NextResponse.json(
      { error: "Failed to update customer status." },
      { status: 500 }
    );
  }
}
