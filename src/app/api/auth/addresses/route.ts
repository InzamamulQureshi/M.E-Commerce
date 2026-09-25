import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

// GET all saved addresses for the session user
export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const addresses = await db.address.findMany({
      where: { userId: user.id },
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
    });

    return NextResponse.json({ addresses });
  } catch (error: any) {
    console.error("Fetch addresses error:", error);
    return NextResponse.json({ error: "Failed to load addresses" }, { status: 500 });
  }
}

// POST create a new saved address
export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      tag = "Home",
      name,
      phone,
      street,
      city,
      state,
      postalCode,
      isDefault = false,
    } = body;

    if (!name || !phone || !street || !city || !state || !postalCode) {
      return NextResponse.json(
        { error: "Please fill in all address details." },
        { status: 400 }
      );
    }

    // Check if this is the first address, make default automatically
    const existingCount = await db.address.count({ where: { userId: user.id } });
    const shouldBeDefault = isDefault || existingCount === 0;

    if (shouldBeDefault) {
      await db.address.updateMany({
        where: { userId: user.id },
        data: { isDefault: false },
      });
    }

    const address = await db.address.create({
      data: {
        userId: user.id,
        tag: String(tag),
        name: name.trim(),
        phone: phone.trim(),
        street: street.trim(),
        city: city.trim(),
        state: state.trim(),
        postalCode: postalCode.trim(),
        isDefault: Boolean(shouldBeDefault),
      },
    });

    return NextResponse.json({ success: true, address });
  } catch (error: any) {
    console.error("Create address error:", error);
    return NextResponse.json({ error: "Failed to save address" }, { status: 500 });
  }
}

// PUT update an existing saved address or set as default
export async function PUT(request: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id, tag, name, phone, street, city, state, postalCode, isDefault } = body;

    if (!id) {
      return NextResponse.json({ error: "Address ID is required" }, { status: 400 });
    }

    const existing = await db.address.findFirst({
      where: { id, userId: user.id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Address not found" }, { status: 404 });
    }

    if (isDefault) {
      await db.address.updateMany({
        where: { userId: user.id },
        data: { isDefault: false },
      });
    }

    const updateData: any = {};
    if (tag !== undefined) updateData.tag = String(tag);
    if (name !== undefined) updateData.name = name.trim();
    if (phone !== undefined) updateData.phone = phone.trim();
    if (street !== undefined) updateData.street = street.trim();
    if (city !== undefined) updateData.city = city.trim();
    if (state !== undefined) updateData.state = state.trim();
    if (postalCode !== undefined) updateData.postalCode = postalCode.trim();
    if (isDefault !== undefined) updateData.isDefault = Boolean(isDefault);

    const address = await db.address.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ success: true, address });
  } catch (error: any) {
    console.error("Update address error:", error);
    return NextResponse.json({ error: "Failed to update address" }, { status: 500 });
  }
}

// DELETE an address
export async function DELETE(request: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Address ID is required" }, { status: 400 });
    }

    const existing = await db.address.findFirst({
      where: { id, userId: user.id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Address not found" }, { status: 404 });
    }

    await db.address.delete({ where: { id } });

    // If deleted address was default, set another address as default if one exists
    if (existing.isDefault) {
      const remaining = await db.address.findFirst({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
      });
      if (remaining) {
        await db.address.update({
          where: { id: remaining.id },
          data: { isDefault: true },
        });
      }
    }

    return NextResponse.json({ success: true, message: "Address deleted successfully" });
  } catch (error: any) {
    console.error("Delete address error:", error);
    return NextResponse.json({ error: "Failed to delete address" }, { status: 500 });
  }
}
