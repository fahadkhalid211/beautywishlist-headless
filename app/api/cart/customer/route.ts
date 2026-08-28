import { NextRequest, NextResponse } from "next/server";

const API = process.env.NEXT_PUBLIC_WC_STORE_API!;

export async function POST(request: NextRequest) {
  const { billing_address, shipping_address } = await request.json();
  const ua = request.headers.get("user-agent") ?? "";
  let token = request.cookies.get("wc_cart_token")?.value;

  const cartResponse = await fetch(`${API}/cart`, {
    method: "GET",
    cache: "no-store",
    headers: { ...(token ? { "Cart-Token": token } : {}), "User-Agent": ua },
  });

  const initToken = cartResponse.headers.get("Cart-Token");
  const nonce = cartResponse.headers.get("Nonce");
  token = initToken || token;

  const response = await fetch(`${API}/cart/update-customer`, {
    method: "POST",
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { "Cart-Token": token } : {}),
      ...(nonce ? { Nonce: nonce } : {}),
      "User-Agent": ua,
    },
    body: JSON.stringify({ billing_address, shipping_address }),
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
