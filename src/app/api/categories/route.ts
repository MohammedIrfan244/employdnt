import { NextRequest, NextResponse } from "next/server";
import { getActiveCategories, getAllCategories, createCategory } from "@/services/category.service";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const includeArchived = searchParams.get("all") === "true";
    const categories = includeArchived ? await getAllCategories() : await getActiveCategories();
    return NextResponse.json({ success: true, data: categories });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch categories";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.name || typeof body.name !== "string" || !body.name.trim()) {
      return NextResponse.json({ success: false, error: "Category name is required" }, { status: 400 });
    }

    const category = await createCategory({
      name: body.name,
      defaultTarget: typeof body.defaultTarget === "number" ? body.defaultTarget : undefined,
    });

    return NextResponse.json({ success: true, data: category }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to create category";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

