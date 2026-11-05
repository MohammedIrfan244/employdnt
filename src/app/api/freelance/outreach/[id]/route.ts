import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { deleteOutreachTemplate } from "@/services/outreach.service";

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
    const success = await deleteOutreachTemplate(id, userEmail);

    if (!success) {
      return NextResponse.json(
        { success: false, error: "Template could not be deleted (system templates are protected)" },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, message: "Template deleted" });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to delete template";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

