import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

// GET reviews for product slug + check if current session user has purchased
export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;

    const product = await db.product.findUnique({
      where: { slug },
      select: { id: true, title: true },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const reviews = await db.review.findMany({
      where: { productId: product.id },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        authorName: true,
        rating: true,
        comment: true,
        adminReply: true,
        adminRepliedAt: true,
        createdAt: true,
        userId: true,
      },
    });

    const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
    const avgRating = reviews.length > 0 ? (totalRating / reviews.length).toFixed(1) : "0.0";

    // Check purchase eligibility for current user
    let canReview = false;
    let alreadyReviewed = false;
    let reason = "Please sign in to check your purchase eligibility.";

    const sessionUser = await getSessionUser();
    if (sessionUser) {
      alreadyReviewed = reviews.some((r) => r.userId === sessionUser.id);
      if (alreadyReviewed) {
        canReview = false;
        reason = "You have already submitted a review for this creation.";
      } else {
        const orderWithProduct = await db.order.findFirst({
          where: {
            userId: sessionUser.id,
            status: { notIn: ["CANCELLED"] },
            items: {
              some: {
                productId: product.id,
              },
            },
          },
        });

        if (orderWithProduct) {
          canReview = true;
          reason = "Verified Purchaser: You can write a review for this creation.";
        } else {
          canReview = false;
          reason = "Only verified customers who have purchased this creation can leave a review.";
        }
      }
    }

    return NextResponse.json({
      reviews,
      avgRating,
      count: reviews.length,
      canReview,
      alreadyReviewed,
      reason,
      isLoggedIn: !!sessionUser,
    });
  } catch (error: any) {
    console.error("Get reviews error:", error);
    return NextResponse.json({ error: "Failed to load reviews." }, { status: 500 });
  }
}

// POST new review (Verified buyers only)
export async function POST(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json(
        { error: "Authentication required. Please sign in to submit a review." },
        { status: 401 }
      );
    }

    const { slug } = params;
    const body = await request.json();
    const { rating = 5, comment } = body;

    if (!comment || !comment.trim()) {
      return NextResponse.json({ error: "Please write your review thoughts." }, { status: 400 });
    }

    const product = await db.product.findUnique({
      where: { slug },
      select: { id: true, title: true },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // STRICT CHECK: Has user purchased this product?
    const hasPurchased = await db.order.findFirst({
      where: {
        userId: sessionUser.id,
        status: { notIn: ["CANCELLED"] },
        items: {
          some: {
            productId: product.id,
          },
        },
      },
    });

    if (!hasPurchased) {
      return NextResponse.json(
        {
          error:
            "Permission denied. Only verified buyers who have purchased this creation can leave a review.",
        },
        { status: 403 }
      );
    }

    // Check for duplicate review
    const existing = await db.review.findFirst({
      where: {
        productId: product.id,
        userId: sessionUser.id,
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "You have already submitted a review for this creation." },
        { status: 400 }
      );
    }

    const review = await db.review.create({
      data: {
        productId: product.id,
        userId: sessionUser.id,
        authorName: sessionUser.name,
        rating: Math.max(1, Math.min(5, parseInt(rating, 10) || 5)),
        comment: comment.trim(),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Your verified review has been published!",
      review,
    });
  } catch (error: any) {
    console.error("Submit review error:", error);
    return NextResponse.json({ error: "Failed to submit review." }, { status: 500 });
  }
}
