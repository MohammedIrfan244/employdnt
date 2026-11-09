import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { checkDuplicateFreelanceClient } from "@/services/freelance-client.service";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    const userEmail = session?.user?.email;
    if (!userEmail) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const companyName = searchParams.get("companyName") || undefined;
    const contactName = searchParams.get("contactName") || undefined;
    const email = searchParams.get("email") || undefined;
    const website = searchParams.get("website") || undefined;
    const mobile = searchParams.get("mobile") || undefined;

    const duplicates = await checkDuplicateFreelanceClient(userEmail, {
      companyName,
      contactName,
      email,
      website,
      mobile,
    });

    return NextResponse.json({
      success: true,
      data: duplicates,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to check duplicates";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

