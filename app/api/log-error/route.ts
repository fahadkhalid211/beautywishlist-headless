import { NextRequest, NextResponse } from "next/server";

const WP_URL = process.env.NEXT_PUBLIC_WP_URL!;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const userAgent = request.headers.get("user-agent") ?? "";

    await fetch(`${WP_URL}/wp-json/custom/v1/log-error`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": userAgent,
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(5000),
    });
  } catch {
    // Never let error reporting itself cause a problem for the user.
  }

  return NextResponse.json({ success: true });
}
