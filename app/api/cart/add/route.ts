import { NextRequest, NextResponse } from "next/server";
import { getWpAuthHeader } from "@/lib/wpAuth";
import { withCartSession, setCartCookies } from "@/lib/cartSession";

const API = process.env.NEXT_PUBLIC_WC_STORE_API!;

export async function POST(request: NextRequest) {
  const { productId, quantity = 1 } = await request.json();
  const ua = request.headers.get("user-agent") ?? "";
  const authHeader = getWpAuthHeader(request);

  const { response, token, nonce } = await withCartSession(request, (token, nonce) =>
    fetch(`${API}/cart/add-item?id=${productId}&quantity=${quantity}`, {
      method: "POST",
      cache: "no-store",
      headers: {
        ...(token ? { "Cart-Token": token } : {}),
        ...(nonce ? { Nonce: nonce } : {}),
        "User-Agent": ua,
        ...authHeader,
      },
    })
  );

  const data = await response.json();
  const result = NextResponse.json(data, { status: response.status });
  setCartCookies(result, token, nonce);
  return result;
}
