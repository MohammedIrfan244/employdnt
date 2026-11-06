import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  getFreelanceClientById,
  updateFreelanceClient,
  deleteFreelanceClient,
} from "@/services/freelance-client.service";

export async function GET(
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
    const client = await getFreelanceClientById(id, userEmail);

    if (!client) {
      return NextResponse.json({ success: false, error: "Client not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: client });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch client";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

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

    const updated = await updateFreelanceClient(id, userEmail, body);

    if (!updated) {
      return NextResponse.json({ success: false, error: "Client not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to update client";
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
    const success = await deleteFreelanceClient(id, userEmail);

    if (!success) {
      return NextResponse.json({ success: false, error: "Failed to delete client" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Client deleted" });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to delete client";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

