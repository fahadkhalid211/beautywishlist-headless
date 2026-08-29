import { NextRequest, NextResponse } from "next/server";
import { getWpAuthHeader } from "@/lib/wpAuth";
import { withCartSession, setCartCookies } from "@/lib/cartSession";

const API = process.env.NEXT_PUBLIC_WC_STORE_API!;

export async function POST(request: NextRequest) {
  const { key, quantity } = await request.json();
  const ua = request.headers.get("user-agent") ?? "";
  const authHeader = getWpAuthHeader(request);

  const { response, token, nonce } = await withCartSession(request, (token, nonce) =>
    fetch(`${API}/cart/update-item`, {
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
    })
  );

  const data = await response.json();
  const result = NextResponse.json(data, { status: response.status });
  setCartCookies(result, token, nonce);
  return result;
}
