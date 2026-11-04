import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { updateResume, deleteResume, setDefaultResume } from "@/services/resume.service";

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

    if (body.action === "setDefault") {
      const updated = await setDefaultResume(id, userEmail);
      return NextResponse.json({ success: true, data: updated });
    }

    const updated = await updateResume(id, userEmail, body);
    if (!updated) {
      return NextResponse.json({ success: false, error: "Resume not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to update resume";
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
    const success = await deleteResume(id, userEmail);
    if (!success) {
      return NextResponse.json({ success: false, error: "Resume not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Resume deleted" });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to delete resume";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

