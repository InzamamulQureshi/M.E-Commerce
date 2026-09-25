import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAdminSession } from "@/lib/auth";
import { slugify } from "@/lib/utils";

// GET all categories with subcategories
export async function GET() {
  const admin = await getAdminSession();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized artisan access" }, { status: 401 });
  }

  const [categories, studioSetting] = await Promise.all([
    db.category.findMany({
      orderBy: { orderIndex: "asc" },
      include: {
        subcategories: {
          orderBy: { orderIndex: "asc" },
          include: { _count: { select: { products: true } } },
        },
        _count: { select: { products: true } },
      },
    }),
    db.studioSetting.findUnique({
      where: { id: "default" },
      select: { heroFeaturedCategoryId: true, heroFeaturedCategoryLabel: true },
    }),
  ]);

  return NextResponse.json({
    categories,
    heroFeaturedCategoryId: studioSetting?.heroFeaturedCategoryId || null,
    heroFeaturedCategoryLabel: studioSetting?.heroFeaturedCategoryLabel || null,
  });
}

// POST create category or subcategory
export async function POST(request: Request) {
  const admin = await getAdminSession();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized artisan access" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { type = "category", name, description, image, categoryId } = body;

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const slug = slugify(name);

    if (type === "subcategory") {
      if (!categoryId) {
        return NextResponse.json({ error: "Parent Category is required for subcategory" }, { status: 400 });
      }

      const subcategory = await db.subcategory.create({
        data: {
          name: name.trim(),
          slug,
          description: description || null,
          categoryId,
        },
      });
      return NextResponse.json({ success: true, subcategory });
    } else {
      const category = await db.category.create({
        data: {
          name: name.trim(),
          slug,
          description: description || null,
          image: image || null,
        },
      });
      return NextResponse.json({ success: true, category });
    }
  } catch (error: any) {
    console.error("Admin create category error:", error);
    return NextResponse.json({ error: "Failed to create category or subcategory" }, { status: 500 });
  }
}

// PUT update category or subcategory
export async function PUT(request: Request) {
  const admin = await getAdminSession();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized artisan access" }, { status: 401 });
  }

  try {
    const body = await request.json();

    // Quick Action: Set or toggle Category as Featured on Homepage Hero
    if (body.action === "set_hero_featured") {
      const targetCategoryId = body.categoryId ? String(body.categoryId).trim() : null;
      const currentSetting = await db.studioSetting.findUnique({ where: { id: "default" } });
      const newTarget = currentSetting?.heroFeaturedCategoryId === targetCategoryId ? null : targetCategoryId;

      await db.studioSetting.upsert({
        where: { id: "default" },
        update: { heroFeaturedCategoryId: newTarget },
        create: { id: "default", heroFeaturedCategoryId: newTarget },
      });

      return NextResponse.json({
        success: true,
        heroFeaturedCategoryId: newTarget,
        message: newTarget ? "Category set as Homepage Hero Featured" : "Homepage Hero Category reset to Automatic",
      });
    }

    const { id, type = "category", name, description, image, categoryId } = body;

    if (!id) {
      return NextResponse.json({ error: "ID is required to update" }, { status: 400 });
    }

    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const slug = slugify(name.trim());

    if (type === "subcategory") {
      const updateData: any = {
        name: name.trim(),
        slug,
        description: description !== undefined ? (description?.trim() || null) : undefined,
      };
      if (categoryId) {
        updateData.categoryId = categoryId;
      }

      const subcategory = await db.subcategory.update({
        where: { id },
        data: updateData,
      });
      return NextResponse.json({ success: true, subcategory });
    } else {
      const category = await db.category.update({
        where: { id },
        data: {
          name: name.trim(),
          slug,
          description: description !== undefined ? (description?.trim() || null) : undefined,
          image: image !== undefined ? (image?.trim() || null) : undefined,
        },
      });
      return NextResponse.json({ success: true, category });
    }
  } catch (error: any) {
    console.error("Admin update category error:", error);
    return NextResponse.json({ error: "Failed to update category or subcategory" }, { status: 500 });
  }
}

// DELETE category or subcategory
export async function DELETE(request: Request) {
  const admin = await getAdminSession();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized artisan access" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const type = searchParams.get("type") || "category";

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    if (type === "subcategory") {
      await db.subcategory.delete({ where: { id } });
    } else {
      await db.category.delete({ where: { id } });

      // If the deleted category was configured as the hero featured category, cleanly reset it
      try {
        const setting = await db.studioSetting.findUnique({ where: { id: "default" } });
        if (setting && setting.heroFeaturedCategoryId === id) {
          await db.studioSetting.update({
            where: { id: "default" },
            data: { heroFeaturedCategoryId: null, heroFeaturedCategoryLabel: null },
          });
        }
      } catch (err) {
        console.error("Failed to reset hero category on delete:", err);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Admin delete category error:", error);
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
