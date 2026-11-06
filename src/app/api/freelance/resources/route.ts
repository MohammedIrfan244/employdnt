import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  getFreelanceResources,
  createFreelanceResource,
} from "@/services/freelance-resource.service";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    const userEmail = session?.user?.email;
    if (!userEmail) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category") || undefined;

    const resources = await getFreelanceResources(userEmail, category);
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
    if (!body.title?.trim() || !body.url?.trim()) {
      return NextResponse.json(
        { success: false, error: "Resource title and URL are required" },
        { status: 400 }
      );
    }

    const resource = await createFreelanceResource(userEmail, {
      title: body.title,
      url: body.url,
      category: body.category || "Other",
      description: body.description,
      isPinned: Boolean(body.isPinned),
    });

    return NextResponse.json({ success: true, data: resource }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to create resource";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

