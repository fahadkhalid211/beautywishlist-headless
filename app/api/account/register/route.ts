import { NextRequest, NextResponse } from "next/server";
import { fetchStoreApi } from "@/lib/storeApi";

const WP_URL = process.env.NEXT_PUBLIC_WP_URL!;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const response = await fetchStoreApi(`${WP_URL}/wp-json/custom/v1/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
    });

    const data = await response.json();
    const result = NextResponse.json(data, { status: response.status });

    if (response.ok && data.token) {
      result.cookies.set("bw_auth_token", data.token, {
        httpOnly: true, secure: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 30,
      });
    }

    if (response.ok && data.wp_credentials) {
      const sessionValue = Buffer.from(JSON.stringify(data.wp_credentials)).toString("base64");
      result.cookies.set("bw_wp_session", sessionValue, {
        httpOnly: true, secure: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 30,
      });
    }

    return result;
  } catch (error) {
    console.error("Registration backend request failed:", error);
    return NextResponse.json({ success: false, code: "backend_unavailable", message: "Registration is temporarily unavailable. Please try again shortly." }, { status: 503 });
  }
}
