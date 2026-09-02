import { NextRequest, NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { CACHE_TAGS } from "@/lib/woocommerce";

const WP_URL = process.env.NEXT_PUBLIC_WP_URL;
const SYNC_TIMEOUT_MS = 30000;

function isAuthorized(request: NextRequest) {
  const expected = process.env.REVALIDATION_SECRET;
  if (!expected) return false;

  const querySecret = request.nextUrl.searchParams.get("secret");
  const headerSecret = request.headers.get("x-bw-sync-secret");

  return querySecret === expected || headerSecret === expected;
}

async function syncHomepage(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json(
      { success: false, message: "Invalid secret" },
      { status: 401 }
    );
  }

  if (!WP_URL) {
    return NextResponse.json(
      { success: false, message: "NEXT_PUBLIC_WP_URL is not configured" },
      { status: 500 }
    );
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), SYNC_TIMEOUT_MS);

  try {
    const response = await fetch(`${WP_URL}/wp-json/custom/v1/homepage-sync`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "X-BW-Sync-Secret": process.env.REVALIDATION_SECRET!,
      },
      cache: "no-store",
      signal: controller.signal,
    });

    const data = await response.json().catch(() => null);

    if (!response.ok || !data?.success) {
      return NextResponse.json(
        {
          success: false,
          message: data?.message || "WordPress homepage sync failed",
          upstreamStatus: response.status,
        },
        { status: 502 }
      );
    }

    // Only invalidate the frontend after WordPress has safely published the
    // new snapshot. Existing visitors continue using the previous cache.
    revalidateTag(CACHE_TAGS.homepage, "max");
    revalidatePath("/");

    return NextResponse.json({
      success: true,
      synced: true,
      snapshot: data.snapshot,
      now: Date.now(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Homepage sync failed",
      },
      { status: 502 }
    );
  } finally {
    clearTimeout(timeout);
  }
}

// Manual WordPress admin button.
export async function POST(request: NextRequest) {
  return syncHomepage(request);
}

// Hostinger Cron can call this directly with:
// curl -fsS "https://YOUR-FRONTEND/api/revalidate?secret=YOUR_SECRET"
export async function GET(request: NextRequest) {
  return syncHomepage(request);
}
