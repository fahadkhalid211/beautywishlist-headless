import { NextRequest, NextResponse } from "next/server";
import { getWpAuthHeader } from "@/lib/wpAuth";
import { fetchStoreApi } from "@/lib/storeApi";

const API = process.env.NEXT_PUBLIC_WC_STORE_API!;

export async function POST(request: NextRequest) {
  try {
    const { billing_address, shipping_address } = await request.json();
    const ua = request.headers.get("user-agent") ?? "";
    let token = request.cookies.get("wc_cart_token")?.value;
    const authHeader = getWpAuthHeader(request);

    const cartResponse = await fetchStoreApi(`${API}/cart`, {
      method: "GET",
      cache: "no-store",
      headers: { ...(token ? { "Cart-Token": token } : {}), "User-Agent": ua, ...authHeader },
    });

    if (!cartResponse.ok) return NextResponse.json(await cartResponse.json(), { status: cartResponse.status });

    token = cartResponse.headers.get("Cart-Token") || token;
    const nonce = cartResponse.headers.get("Nonce");

    const response = await fetchStoreApi(`${API}/cart/update-customer`, {
      method: "POST",
      cache: "no-store",
      headers: { "Content-Type": "application/json", ...(token ? { "Cart-Token": token } : {}), ...(nonce ? { Nonce: nonce } : {}), "User-Agent": ua, ...authHeader },
      body: JSON.stringify({ billing_address, shipping_address }),
    });

    const data = await response.json();
    const result = NextResponse.json(data, { status: response.status });
    const finalToken = response.headers.get("Cart-Token") || token;
    if (finalToken) result.cookies.set("wc_cart_token", finalToken, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 14 });
    return result;
  } catch (error) {
    console.error("Cart customer backend request failed:", error);
    return NextResponse.json({ code: "backend_unavailable", message: "Cart service is temporarily unavailable. Please try again shortly." }, { status: 503 });
  }
}
