import { NextRequest, NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { CACHE_TAGS } from "@/lib/woocommerce";

export async function POST(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get("secret");

  if (!process.env.REVALIDATION_SECRET || secret !== process.env.REVALIDATION_SECRET) {
    return NextResponse.json({ success: false, message: "Invalid secret" }, { status: 401 });
  }

  revalidateTag(CACHE_TAGS.catalog, "max");
  revalidateTag(CACHE_TAGS.categories, "max");
  revalidateTag(CACHE_TAGS.search, "max");
  revalidatePath("/");

  return NextResponse.json({
    success: true,
    revalidated: true,
    tags: Object.values(CACHE_TAGS),
    now: Date.now(),
  });
}
