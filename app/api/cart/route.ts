import { NextRequest, NextResponse } from "next/server";

const API = process.env.NEXT_PUBLIC_WC_STORE_API!;

function decode(token: string | null) {
  if (!token) return null;
  try {
    return JSON.parse(Buffer.from(token.split(".")[1], "base64").toString());
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  const token = request.cookies.get("wc_cart_token")?.value;
  const ua = request.headers.get("user-agent") ?? "";

  console.log("GET /cart cookie token user_id:", decode(token || null)?.user_id);

  const response = await fetch(`${API}/cart`, {
    method: "GET",
    cache: "no-store",
    headers: { ...(token ? { "Cart-Token": token } : {}), "User-Agent": ua },
  });

  const data = await response.json();
  const newToken = response.headers.get("Cart-Token");
  console.log("GET /cart response token user_id:", decode(newToken)?.user_id, "items:", data?.items?.length);

  const result = NextResponse.json(data);
  result.headers.set("Cache-Control", "no-store, max-age=0");

  if (newToken) {
    result.cookies.set("wc_cart_token", newToken, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 14,
    });
  }

  return result;
}