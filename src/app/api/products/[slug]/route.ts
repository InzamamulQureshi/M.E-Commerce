import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
    const product = await db.product.findUnique({
      where: { slug },
      include: {
        category: true,
        subcategory: true,
        reviews: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ product });
  } catch (error: any) {
    console.error("Fetch product by slug error:", error);
    return NextResponse.json(
      { error: "Failed to load product details" },
      { status: 500 }
    );
  }
}
