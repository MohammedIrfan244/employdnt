import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { updateResource, deleteResource } from "@/services/resource.service";

interface RouteProps {
  params: Promise<{ id: string }>;
}

export async function PATCH(req: NextRequest, { params }: RouteProps) {
  try {
    const session = await auth();
    const userEmail = session?.user?.email;
    if (!userEmail) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();

    const updated = await updateResource(id, userEmail, body);
    if (!updated) {
      return NextResponse.json({ success: false, error: "Resource not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to update resource";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: RouteProps) {
  try {
    const session = await auth();
    const userEmail = session?.user?.email;
    if (!userEmail) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const success = await deleteResource(id, userEmail);
    if (!success) {
      return NextResponse.json({ success: false, error: "Resource not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Resource deleted" });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to delete resource";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

