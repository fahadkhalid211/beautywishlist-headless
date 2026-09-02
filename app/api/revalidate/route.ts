import { NextRequest, NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { CACHE_TAGS } from "@/lib/woocommerce";

const WP_URL = process.env.NEXT_PUBLIC_WP_URL;
const FRONTEND_URL = process.env.NEXT_PUBLIC_SITE_URL;
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
    // WordPress first builds and validates the complete snapshot. The old
    // snapshot remains untouched if any WooCommerce request fails.
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

    // The homepage snapshot is now safely published in WordPress.
    // expire: 0 makes the next homepage render read the new snapshot instead
    // of serving the previous snapshot as stale content.
    revalidateTag(CACHE_TAGS.homepage, { expire: 0 });
    revalidatePath("/");

    // Prewarm the homepage from the server so the first customer after a
    // manual/cron sync does not have to perform the regeneration.
    let warmed = false;
    if (FRONTEND_URL) {
      const warmResponse = await fetch(FRONTEND_URL, {
        cache: "no-store",
        headers: { Accept: "text/html" },
      });
      warmed = warmResponse.ok;
    }

    return NextResponse.json({
      success: true,
      synced: true,
      warmed,
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

// WordPress admin button uses POST.
export async function POST(request: NextRequest) {
  return syncHomepage(request);
}

// Hostinger Cron can use GET directly:
// curl -fsS "https://YOUR-FRONTEND/api/revalidate?secret=YOUR_SECRET"
export async function GET(request: NextRequest) {
  return syncHomepage(request);
}
