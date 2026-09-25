import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const categorySlug = searchParams.get("category");
    const subcategorySlug = searchParams.get("subcategory");
    const search = searchParams.get("search");
    const sort = searchParams.get("sort") || "featured";
    const featured = searchParams.get("featured");
    const bestseller = searchParams.get("bestseller");

    const where: any = {};
    const andClauses: any[] = [];

    // Match product if it has category as primary OR as any assigned secondary category
    if (categorySlug) {
      andClauses.push({
        OR: [
          { category: { slug: categorySlug } },
          { categories: { some: { category: { slug: categorySlug } } } },
        ],
      });
    }

    if (subcategorySlug) {
      where.subcategory = { slug: subcategorySlug };
    }

    if (featured === "true") {
      where.isFeatured = true;
    }

    if (bestseller === "true") {
      where.isBestSeller = true;
    }

    if (search) {
      andClauses.push({
        OR: [
          { title: { contains: search } },
          { description: { contains: search } },
          { tagline: { contains: search } },
        ],
      });
    }

    if (andClauses.length > 0) {
      where.AND = andClauses;
    }

    let orderBy: any = { createdAt: "desc" };
    if (sort === "price_asc") {
      orderBy = { price: "asc" };
    } else if (sort === "price_desc") {
      orderBy = { price: "desc" };
    } else if (sort === "craft_days") {
      orderBy = { craftDays: "asc" };
    } else if (sort === "featured") {
      orderBy = [{ isBestSeller: "desc" }, { isFeatured: "desc" }, { createdAt: "desc" }];
    }

    const products = await db.product.findMany({
      where,
      orderBy,
      include: {
        category: {
          select: { id: true, name: true, slug: true },
        },
        subcategory: {
          select: { id: true, name: true, slug: true },
        },
        categories: {
          include: {
            category: {
              select: { id: true, name: true, slug: true },
            },
          },
        },
      },
    });

    return NextResponse.json({ products });
  } catch (error: any) {
    console.error("Fetch products error:", error);
    return NextResponse.json(
      { error: "Failed to load products" },
      { status: 500 }
    );
  }
}
