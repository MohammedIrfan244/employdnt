import { NextRequest, NextResponse } from "next/server";
import { getActiveCategories } from "@/services/category.service";
import { getCategoryDailyProgress } from "@/services/progress.service";
import { getClientDateString } from "@/lib/date-utils";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const clientDate = searchParams.get("clientDate") || getClientDateString(new Date());

    const categories = await getActiveCategories();

    const progressList = await Promise.all(
      categories.map(async (cat) => {
        const catId = cat._id!.toString();
        const progress = await getCategoryDailyProgress(
          catId,
          clientDate,
          cat.defaultTarget
        );

        return {
          category: cat,
          progress,
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: {
        date: clientDate,
        categories: progressList,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch today's progress";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

