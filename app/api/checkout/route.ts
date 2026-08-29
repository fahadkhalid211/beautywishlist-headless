import { NextRequest, NextResponse } from "next/server";
import { getWpAuthHeader } from "@/lib/wpAuth";

const API = process.env.NEXT_PUBLIC_WC_STORE_API!;

export async function POST(request: NextRequest) {
  const { billing_address, shipping_address, payment_method, customer_note } =
    await request.json();
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

  const response = await fetch(`${API}/checkout`, {
    method: "POST",
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { "Cart-Token": token } : {}),
      ...(nonce ? { Nonce: nonce } : {}),
      "User-Agent": ua,
      ...authHeader,
    },
    body: JSON.stringify({
      billing_address,
      shipping_address,
      payment_method,
      payment_data: [],
      customer_note: customer_note || "",
    }),
  });

  const data = await response.json();
  const result = NextResponse.json(data, { status: response.status });

  if (response.ok) {
    // Order placed — cart is now empty server-side, clear the cart token cookie.
    result.cookies.set("wc_cart_token", "", { path: "/", maxAge: 0 });
  } else {
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
  }

  return result;
}
