import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  getOutreachTemplates,
  createOutreachTemplate,
} from "@/services/outreach.service";

export async function GET() {
  try {
    const session = await auth();
    const userEmail = session?.user?.email;
    if (!userEmail) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const templates = await getOutreachTemplates(userEmail);
    return NextResponse.json({ success: true, data: templates });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch templates";
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
    if (!body.name?.trim() || !body.subjectTemplate?.trim() || !body.bodyTemplate?.trim()) {
      return NextResponse.json(
        { success: false, error: "Name, subject template, and body template are required" },
        { status: 400 }
      );
    }

    const template = await createOutreachTemplate(userEmail, {
      name: body.name,
      category: body.category || "Custom",
      subjectTemplate: body.subjectTemplate,
      bodyTemplate: body.bodyTemplate,
      description: body.description,
    });

    return NextResponse.json({ success: true, data: template }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to create template";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

