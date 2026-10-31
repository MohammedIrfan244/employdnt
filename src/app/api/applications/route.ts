import { NextRequest, NextResponse } from "next/server";
import {
  getApplications,
  createApplication,
  getRecentApplications,
} from "@/services/application.service";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    if (searchParams.get("recent") === "true") {
      const limit = Number(searchParams.get("limit")) || 5;
      const recent = await getRecentApplications(limit);
      return NextResponse.json({ success: true, data: recent });
    }

    const categoryId = searchParams.get("categoryId") || undefined;
    const status = searchParams.get("status") || undefined;
    const search = searchParams.get("search") || undefined;
    const limit = Number(searchParams.get("limit")) || 50;
    const skip = Number(searchParams.get("skip")) || 0;

    const result = await getApplications({
      categoryId,
      status,
      search,
      limit,
      skip,
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch applications";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.company?.trim()) {
      return NextResponse.json({ success: false, error: "Company name is required" }, { status: 400 });
    }
    if (!body.role?.trim()) {
      return NextResponse.json({ success: false, error: "Role name is required" }, { status: 400 });
    }
    if (!body.categoryId?.trim()) {
      return NextResponse.json({ success: false, error: "Category is required" }, { status: 400 });
    }

    const application = await createApplication({
      company: body.company,
      role: body.role,
      categoryId: body.categoryId,
      jobUrl: body.jobUrl,
      recruiterName: body.recruiterName,
      recruiterEmail: body.recruiterEmail,
      contactDetails: body.contactDetails,
      salary: body.salary,
      jobDescription: body.jobDescription,
      notes: body.notes,
      resumeUsed: body.resumeUsed,
      clientDate: body.clientDate, // Local client YYYY-MM-DD
    });

    return NextResponse.json({ success: true, data: application }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to create application";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
