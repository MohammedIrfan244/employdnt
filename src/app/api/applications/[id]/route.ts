import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  getApplicationById,
  updateApplication,
  deleteApplication,
} from "@/services/application.service";
import { getApplicationTimeline } from "@/services/timeline.service";

interface RouteProps {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: RouteProps) {
  try {
    const session = await auth();
    const userEmail = session?.user?.email;
    if (!userEmail) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const application = await getApplicationById(id, userEmail);

    if (!application) {
      return NextResponse.json({ success: false, error: "Application not found" }, { status: 404 });
    }

    const timeline = await getApplicationTimeline(id);

    return NextResponse.json({ success: true, data: { application, timeline } });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch application";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
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

    const updated = await updateApplication(id, body, userEmail);
    if (!updated) {
      return NextResponse.json({ success: false, error: "Application not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to update application";
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
    const success = await deleteApplication(id, userEmail);

    if (!success) {
      return NextResponse.json({ success: false, error: "Application not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Application deleted" });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to delete application";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
