import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getUserResumes, createResume } from "@/services/resume.service";

export async function GET() {
  try {
    const session = await auth();
    const userEmail = session?.user?.email;
    if (!userEmail) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const resumes = await getUserResumes(userEmail);
    return NextResponse.json({ success: true, data: resumes });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch resumes";
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
    if (!body.name?.trim() || !body.fileUrl?.trim()) {
      return NextResponse.json(
        { success: false, error: "Resume title and document URL are required" },
        { status: 400 }
      );
    }

    const resume = await createResume(userEmail, {
      name: body.name,
      fileName: body.fileName || `${body.name.toLowerCase().replace(/\s+/g, "-")}.pdf`,
      fileUrl: body.fileUrl,
      fileSize: body.fileSize,
      category: body.category,
      isDefault: Boolean(body.isDefault),
      notes: body.notes,
    });

    return NextResponse.json({ success: true, data: resume }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to create resume";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

