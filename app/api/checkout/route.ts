import { NextRequest, NextResponse } from "next/server";
import { getWpAuthHeader } from "@/lib/wpAuth";
import { fetchStoreApi } from "@/lib/storeApi";

const API = process.env.NEXT_PUBLIC_WC_STORE_API!;

export async function POST(request: NextRequest) {
  try {
    const { billing_address, shipping_address, payment_method, customer_note } = await request.json();
    const ua = request.headers.get("user-agent") ?? "";
    let token = request.cookies.get("wc_cart_token")?.value;
    const authHeader = getWpAuthHeader(request);

    const cartResponse = await fetchStoreApi(`${API}/cart`, {
      method: "GET",
      cache: "no-store",
      headers: { ...(token ? { "Cart-Token": token } : {}), "User-Agent": ua, ...authHeader },
    });

    if (!cartResponse.ok) {
      const data = await cartResponse.json();
      return NextResponse.json(data, { status: cartResponse.status });
    }

    const initToken = cartResponse.headers.get("Cart-Token");
    const nonce = cartResponse.headers.get("Nonce");
    token = initToken || token;

    const response = await fetchStoreApi(`${API}/checkout`, {
      method: "POST",
      cache: "no-store",
      // Placing an order does real work beyond a normal request -- our
      // custom tax/fee hooks, stock updates, and WordPress sending
      // confirmation emails can all add real time. The default 8s timeout
      // (fine for routine browsing calls) was too aggressive here: it
      // could abort on our side while WordPress kept processing in the
      // background and successfully created the order a moment later --
      // the customer would see a false "temporarily unavailable" error for
      // an order that actually went through.
      timeoutMs: 25000,
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
      result.cookies.set("wc_cart_token", "", { path: "/", maxAge: 0 });
    } else {
      const finalToken = response.headers.get("Cart-Token") || token;
      if (finalToken) {
        result.cookies.set("wc_cart_token", finalToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          path: "/",
          maxAge: 60 * 60 * 24 * 14,
        });
      }
    }

    return result;
  } catch (error) {
    console.error("Checkout backend request failed:", error);
    return NextResponse.json(
      { code: "backend_unavailable", message: "Checkout is temporarily unavailable. Please try again shortly." },
      { status: 503, headers: { "Cache-Control": "no-store, max-age=0" } }
    );
  }
}
