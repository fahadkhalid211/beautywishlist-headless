import { NextRequest, NextResponse } from "next/server";
import { fetchStoreApi } from "@/lib/storeApi";

const WP_URL = process.env.NEXT_PUBLIC_WP_URL!;

export async function POST(request: NextRequest) {
  const token = request.cookies.get("bw_auth_token")?.value;
  const sessionCookie = request.cookies.get("bw_wp_session")?.value;

  if (token && sessionCookie) {
    try {
      const { uuid } = JSON.parse(Buffer.from(sessionCookie, "base64").toString());
      if (uuid) {
        await fetchStoreApi(`${WP_URL}/wp-json/custom/v1/revoke-app-password`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ uuid }),
          timeoutMs: 4000,
        });
      }
    } catch (error) {
      console.error("Logout backend cleanup failed:", error);
    }
  }

  const result = NextResponse.json({ success: true });
  result.cookies.set("bw_auth_token", "", { path: "/", maxAge: 0 });
  result.cookies.set("bw_wp_session", "", { path: "/", maxAge: 0 });
  return result;
}
