import { NextRequest, NextResponse } from "next/server";
import { getWpAuthHeader } from "@/lib/wpAuth";
import { fetchStoreApi } from "@/lib/storeApi";

const API = process.env.NEXT_PUBLIC_WC_STORE_API!;

async function getCartSession(request: NextRequest) {
  const ua = request.headers.get("user-agent") ?? "";
  const authHeader = getWpAuthHeader(request);
  let token = request.cookies.get("wc_cart_token")?.value;

  const cartResponse = await fetchStoreApi(`${API}/cart`, {
    method: "GET",
    cache: "no-store",
    headers: { ...(token ? { "Cart-Token": token } : {}), "User-Agent": ua, ...authHeader },
  });

  if (!cartResponse.ok) return { cartResponse, token, nonce: null, ua, authHeader };

  token = cartResponse.headers.get("Cart-Token") || token;
  return { cartResponse, token, nonce: cartResponse.headers.get("Nonce"), ua, authHeader };
}

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json();
    const { cartResponse, token, nonce, ua, authHeader } = await getCartSession(request);
    if (!cartResponse.ok) return NextResponse.json(await cartResponse.json(), { status: cartResponse.status });

    const response = await fetchStoreApi(`${API}/cart/apply-coupon`, {
      method: "POST",
      cache: "no-store",
      headers: { "Content-Type": "application/json", ...(token ? { "Cart-Token": token } : {}), ...(nonce ? { Nonce: nonce } : {}), "User-Agent": ua, ...authHeader },
      body: JSON.stringify({ code }),
    });

    const data = await response.json();
    const result = NextResponse.json(data, { status: response.status });
    const finalToken = response.headers.get("Cart-Token") || token;
    if (finalToken) result.cookies.set("wc_cart_token", finalToken, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 14 });
    return result;
  } catch (error) {
    console.error("Coupon backend request failed:", error);
    return NextResponse.json({ code: "backend_unavailable", message: "Coupons are temporarily unavailable. Please try again shortly." }, { status: 503 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { code } = await request.json();
    const { cartResponse, token, nonce, ua, authHeader } = await getCartSession(request);
    if (!cartResponse.ok) return NextResponse.json(await cartResponse.json(), { status: cartResponse.status });

    const response = await fetchStoreApi(`${API}/cart/remove-coupon`, {
      method: "POST",
      cache: "no-store",
      headers: { "Content-Type": "application/json", ...(token ? { "Cart-Token": token } : {}), ...(nonce ? { Nonce: nonce } : {}), "User-Agent": ua, ...authHeader },
      body: JSON.stringify({ code }),
    });

    const data = await response.json();
    const result = NextResponse.json(data, { status: response.status });
    const finalToken = response.headers.get("Cart-Token") || token;
    if (finalToken) result.cookies.set("wc_cart_token", finalToken, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 14 });
    return result;
  } catch (error) {
    console.error("Coupon removal backend request failed:", error);
    return NextResponse.json({ code: "backend_unavailable", message: "Coupons are temporarily unavailable. Please try again shortly." }, { status: 503 });
  }
}
