import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAdminSession } from "@/lib/auth";

// GET all reviews for admin moderation
export async function GET(request: Request) {
  const admin = await getAdminSession();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized artisan access" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const pageParam = searchParams.get("page");
  const limitParam = searchParams.get("limit");
  const q = searchParams.get("q")?.trim();
  const ratingParam = searchParams.get("rating");

  try {
    const whereClause: any = {};
    if (ratingParam && ratingParam !== "ALL") {
      const parsedRating = parseInt(ratingParam, 10);
      if (!isNaN(parsedRating)) {
        whereClause.rating = parsedRating;
      }
    }
    if (q) {
      whereClause.OR = [
        { authorName: { contains: q } },
        { comment: { contains: q } },
        { product: { title: { contains: q } } },
      ];
    }

    const total = await db.review.count({ where: whereClause });

    let skip: number | undefined = undefined;
    let take: number | undefined = undefined;
    let page = 1;
    let limit = 0;
    let totalPages = 1;

    if (limitParam) {
      limit = Math.max(1, parseInt(limitParam, 10) || 10);
      page = Math.max(1, parseInt(pageParam || "1", 10) || 1);
      totalPages = Math.max(1, Math.ceil(total / limit));
      if (page > totalPages && totalPages > 0) {
        page = totalPages;
      }
      skip = (page - 1) * limit;
      take = limit;
    }

    const reviews = await db.review.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      skip,
      take,
      include: {
        product: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json({
      reviews,
      total,
      page,
      limit: limit || total,
      totalPages,
    });
  } catch (error: any) {
    console.error("Admin get reviews error:", error);
    return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 });
  }
}

// PUT reply to a customer review
export async function PUT(request: Request) {
  const admin = await getAdminSession();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized artisan access" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id, adminReply } = body;

    if (!id) {
      return NextResponse.json({ error: "Review ID is required" }, { status: 400 });
    }

    const updated = await db.review.update({
      where: { id },
      data: {
        adminReply: adminReply && adminReply.trim() ? adminReply.trim() : null,
        adminRepliedAt: adminReply && adminReply.trim() ? new Date() : null,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Reply saved successfully.",
      review: updated,
    });
  } catch (error: any) {
    console.error("Admin reply error:", error);
    return NextResponse.json({ error: "Failed to save reply to review" }, { status: 500 });
  }
}

// DELETE a review by ID
export async function DELETE(request: Request) {
  const admin = await getAdminSession();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized artisan access" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Review ID is required" }, { status: 400 });
    }

    await db.review.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Review deleted successfully" });
  } catch (error: any) {
    console.error("Admin delete review error:", error);
    return NextResponse.json({ error: "Failed to delete review" }, { status: 500 });
  }
}
