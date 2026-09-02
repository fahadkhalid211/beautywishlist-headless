import { NextRequest, NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { CACHE_TAGS } from "@/lib/woocommerce";

const WP_URL = process.env.NEXT_PUBLIC_WP_URL;
const FRONTEND_URL = process.env.NEXT_PUBLIC_SITE_URL;
const SYNC_TIMEOUT_MS = 120000;

function isAuthorized(request: NextRequest) {
  const expected = process.env.REVALIDATION_SECRET;
  if (!expected) return false;

  const querySecret = request.nextUrl.searchParams.get("secret");
  const headerSecret = request.headers.get("x-bw-sync-secret");

  return querySecret === expected || headerSecret === expected;
}

export async function GET(request: NextRequest) {
  return syncHomepage(request);
}

export async function POST(request: NextRequest) {
  return syncHomepage(request);
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

    revalidateTag(CACHE_TAGS.homepage, { expire: 0 });
    revalidatePath("/");

    let warmed = false;
    if (FRONTEND_URL) {
      try {
        const warmResponse = await fetch(FRONTEND_URL, {
          cache: "no-store",
          headers: { Accept: "text/html" },
        });
        warmed = warmResponse.ok;
      } catch {
        warmed = false;
      }
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
