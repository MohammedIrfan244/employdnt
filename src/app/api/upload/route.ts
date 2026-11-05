import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ success: false, error: "No file provided" }, { status: 400 });
    }

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;
    const folder = process.env.CLOUDINARY_FOLDER;

    const buffer = Buffer.from(await file.arrayBuffer());

    // 1. If Cloudinary credentials are fully configured in .env, upload to Cloudinary
    if (cloudName && apiKey && apiSecret && folder) {
      const timestamp = Math.floor(Date.now() / 1000);
      const signaturePayload = `folder=${folder}&timestamp=${timestamp}${apiSecret}`;
      const signature = crypto.createHash("sha1").update(signaturePayload).digest("hex");

      const uploadData = new FormData();
      uploadData.append("file", new Blob([buffer], { type: file.type }), file.name);
      uploadData.append("api_key", apiKey);
      uploadData.append("timestamp", String(timestamp));
      uploadData.append("folder", folder);
      uploadData.append("signature", signature);

      const cloudRes = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
        {
          method: "POST",
          body: uploadData,
        }
      );

      const cloudJson = await cloudRes.json();
      if (!cloudRes.ok) {
        throw new Error(cloudJson.error?.message || "Cloudinary upload failed");
      }

      return NextResponse.json({
        success: true,
        url: cloudJson.secure_url || cloudJson.url,
        fileName: file.name,
        fileSize: `${(file.size / 1024).toFixed(1)} KB`,
      });
    }

    // 2. Fallback: Base64 data URI so user can test before adding Cloudinary keys to .env
    const base64 = buffer.toString("base64");
    const dataUri = `data:${file.type || "application/pdf"};base64,${base64}`;

    return NextResponse.json({
      success: true,
      url: dataUri,
      fileName: file.name,
      fileSize: `${(file.size / 1024).toFixed(1)} KB`,
      note: "Stored as data URI (add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET, and optionally CLOUDINARY_FOLDER to .env for CDN hosting)",
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to upload file";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

