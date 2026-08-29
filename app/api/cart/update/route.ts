import { NextRequest, NextResponse } from "next/server";
import { getWpAuthHeader } from "@/lib/wpAuth";

const API = process.env.NEXT_PUBLIC_WC_STORE_API!;

export async function POST(request: NextRequest) {
  const { key, quantity } = await request.json();
  const ua = request.headers.get("user-agent") ?? "";
  let token = request.cookies.get("wc_cart_token")?.value;
  const authHeader = getWpAuthHeader(request);

  const cartResponse = await fetch(`${API}/cart`, {
    method: "GET",
    cache: "no-store",
    headers: { ...(token ? { "Cart-Token": token } : {}), "User-Agent": ua, ...authHeader },
  });

  const initToken = cartResponse.headers.get("Cart-Token");
  const nonce = cartResponse.headers.get("Nonce");
  token = initToken || token;

  const response = await fetch(`${API}/cart/update-item`, {
    method: "POST",
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { "Cart-Token": token } : {}),
      ...(nonce ? { Nonce: nonce } : {}),
      "User-Agent": ua,
      ...authHeader,
    },
    body: JSON.stringify({ key, quantity }),
  });

  const data = await response.json();
  const result = NextResponse.json(data, { status: response.status });
  const finalToken = response.headers.get("Cart-Token") || token;

  if (finalToken) {
    result.cookies.set("wc_cart_token", finalToken, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 14,
    });
  }

  return result;
}
