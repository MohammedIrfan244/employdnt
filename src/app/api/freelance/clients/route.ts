import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  getFreelanceClients,
  createFreelanceClient,
  getFreelanceDashboardMetrics,
  getScopingAttentionLeads,
} from "@/services/freelance-client.service";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    const userEmail = session?.user?.email;
    if (!userEmail) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const stage = searchParams.get("stage") || undefined;
    const search = searchParams.get("search") || undefined;
    const clientDate = searchParams.get("clientDate") || new Date().toISOString().split("T")[0];

    const [clients, metrics, scopingAttention] = await Promise.all([
      getFreelanceClients(userEmail, { stage, search }),
      getFreelanceDashboardMetrics(userEmail, clientDate),
      getScopingAttentionLeads(userEmail, clientDate),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        clients,
        metrics,
        scopingAttention,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch clients";
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
    if (!body.companyName?.trim() || !body.contactName?.trim()) {
      return NextResponse.json(
        { success: false, error: "Company name and contact name are required" },
        { status: 400 }
      );
    }

    const client = await createFreelanceClient(userEmail, {
      companyName: body.companyName,
      contactName: body.contactName,
      location: body.location,
      email: body.email,
      mobile: body.mobile,
      website: body.website,
      leadSource: body.leadSource || "Other",
      outreachDate: body.outreachDate || new Date().toISOString().split("T")[0],
      initialNotes: body.initialNotes,
      stageDueDate: body.stageDueDate,
    });

    return NextResponse.json({ success: true, data: client }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to create client";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

