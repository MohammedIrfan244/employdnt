import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getResources, createResource } from "@/services/resource.service";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    const userEmail = session?.user?.email;
    if (!userEmail) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category") || undefined;

    const resources = await getResources(userEmail, category);
    return NextResponse.json({ success: true, data: resources });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch resources";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const userEmail = session?.user?.email;
    if (!userEmail) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    if (!body.title?.trim() || !body.url?.trim() || !body.category) {
      return NextResponse.json(
        { success: false, error: "Title, URL, and category are required" },
        { status: 400 }
      );
    }

    const resource = await createResource(userEmail, {
      title: body.title,
      url: body.url,
      category: body.category,
      description: body.description,
      tags: body.tags,
      isPinned: Boolean(body.isPinned),
    });

    return NextResponse.json({ success: true, data: resource }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to create resource";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

