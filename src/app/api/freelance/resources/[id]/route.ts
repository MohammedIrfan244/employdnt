import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  updateFreelanceResource,
  deleteFreelanceResource,
} from "@/services/freelance-resource.service";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const userEmail = session?.user?.email;
    if (!userEmail) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();

    const updated = await updateFreelanceResource(id, userEmail, body);
    if (!updated) {
      return NextResponse.json({ success: false, error: "Resource not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to update resource";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const userEmail = session?.user?.email;
    if (!userEmail) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const success = await deleteFreelanceResource(id, userEmail);

    if (!success) {
      return NextResponse.json(
        { success: false, error: "Resource could not be deleted (system links are protected)" },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, message: "Resource deleted" });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to delete resource";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

