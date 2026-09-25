import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAdminSession } from "@/lib/auth";
import { slugify } from "@/lib/utils";

// GET all products with full admin relations or single product by ?id=
export async function GET(request: Request) {
  const admin = await getAdminSession();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized artisan access" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (id) {
    const product = await db.product.findUnique({
      where: { id },
      include: {
        category: true,
        subcategory: true,
        categories: {
          include: {
            category: true,
          },
        },
      },
    });
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    return NextResponse.json({ product });
  }

  const products = await db.product.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      category: true,
      subcategory: true,
      categories: {
        include: {
          category: true,
        },
      },
      _count: { select: { orderItems: true } },
    },
  });

  return NextResponse.json({ products });
}

// POST create new product
export async function POST(request: Request) {
  const admin = await getAdminSession();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized artisan access" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      title,
      tagline,
      description,
      price,
      compareAtPrice,
      stock = 10,
      images,
      categoryId,
      categoryIds,
      subcategoryId,
      materials,
      dimensions,
      craftDays = 2,
      isFeatured = false,
      isBestSeller = false,
      allowsCustomNote = true,
      allowsWaxSeal = true,
      allowsGiftWrap = true,
    } = body;

    const primaryCategoryId = (Array.isArray(categoryIds) && categoryIds.length > 0)
      ? categoryIds[0]
      : categoryId;

    if (!title || !description || !price || !primaryCategoryId) {
      return NextResponse.json(
        { error: "Title, description, price, and category are required." },
        { status: 400 }
      );
    }

    // Auto-generate unique slug
    let baseSlug = slugify(title);
    let slug = baseSlug;
    let counter = 1;
    while (await db.product.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    // Format images JSON array
    let imagesString = "[]";
    if (Array.isArray(images)) {
      imagesString = JSON.stringify(images);
    } else if (typeof images === "string") {
      imagesString = JSON.stringify(images.split(",").map((s: string) => s.trim()).filter(Boolean));
    }

    const product = await db.product.create({
      data: {
        title: title.trim(),
        slug,
        tagline: tagline?.trim() || null,
        description: description.trim(),
        price: parseFloat(price),
        compareAtPrice: compareAtPrice ? parseFloat(compareAtPrice) : null,
        stock: parseInt(stock, 10) || 0,
        images: imagesString,
        categoryId: primaryCategoryId,
        subcategoryId: subcategoryId || null,
        materials: materials?.trim() || null,
        dimensions: dimensions?.trim() || null,
        craftDays: parseInt(craftDays, 10) || 2,
        isFeatured: Boolean(isFeatured),
        isBestSeller: Boolean(isBestSeller),
        allowsCustomNote: Boolean(allowsCustomNote),
        allowsWaxSeal: Boolean(allowsWaxSeal),
        allowsGiftWrap: Boolean(allowsGiftWrap),
      },
    });

    // Save multi-category assignments in ProductCategory join table
    const assignedCatIds = Array.from(
      new Set([...(Array.isArray(categoryIds) ? categoryIds : []), primaryCategoryId].filter(Boolean))
    );
    if (assignedCatIds.length > 0) {
      await db.productCategory.createMany({
        data: assignedCatIds.map((cId) => ({
          productId: product.id,
          categoryId: cId,
        })),
        skipDuplicates: true,
      });
    }

    const fullProduct = await db.product.findUnique({
      where: { id: product.id },
      include: {
        category: true,
        subcategory: true,
        categories: { include: { category: true } },
      },
    });

    return NextResponse.json({ success: true, product: fullProduct || product });
  } catch (error: any) {
    console.error("Admin create product error:", error);
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}

// PUT edit product
export async function PUT(request: Request) {
  const admin = await getAdminSession();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized artisan access" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id, categoryIds, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
    }

    if (updates.price) updates.price = parseFloat(updates.price);
    if (updates.compareAtPrice !== undefined) {
      updates.compareAtPrice = updates.compareAtPrice ? parseFloat(updates.compareAtPrice) : null;
    }
    if (updates.stock !== undefined) updates.stock = parseInt(updates.stock, 10);
    if (updates.craftDays !== undefined) updates.craftDays = parseInt(updates.craftDays, 10);
    if (updates.allowsCustomNote !== undefined) updates.allowsCustomNote = Boolean(updates.allowsCustomNote);
    if (updates.allowsWaxSeal !== undefined) updates.allowsWaxSeal = Boolean(updates.allowsWaxSeal);
    if (updates.allowsGiftWrap !== undefined) updates.allowsGiftWrap = Boolean(updates.allowsGiftWrap);
    if (updates.isFeatured !== undefined) updates.isFeatured = Boolean(updates.isFeatured);
    if (updates.isBestSeller !== undefined) updates.isBestSeller = Boolean(updates.isBestSeller);
    if (updates.images && Array.isArray(updates.images)) {
      updates.images = JSON.stringify(updates.images);
    }

    if (Array.isArray(categoryIds) && categoryIds.length > 0) {
      updates.categoryId = categoryIds[0];
    }

    const product = await db.product.update({
      where: { id },
      data: updates,
    });

    // Sync multi-category assignments in ProductCategory join table
    if (Array.isArray(categoryIds)) {
      const assignedCatIds = Array.from(new Set(categoryIds.filter(Boolean)));
      await db.productCategory.deleteMany({ where: { productId: id } });
      if (assignedCatIds.length > 0) {
        await db.productCategory.createMany({
          data: assignedCatIds.map((cId) => ({
            productId: id,
            categoryId: cId,
          })),
          skipDuplicates: true,
        });
      }
    }

    const fullProduct = await db.product.findUnique({
      where: { id: product.id },
      include: {
        category: true,
        subcategory: true,
        categories: { include: { category: true } },
      },
    });

    return NextResponse.json({ success: true, product: fullProduct || product });
  } catch (error: any) {
    console.error("Admin update product error:", error);
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
  }
}

// DELETE product
export async function DELETE(request: Request) {
  const admin = await getAdminSession();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized artisan access" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
    }

    await db.product.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Admin delete product error:", error);
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
}
