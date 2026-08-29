import { NextRequest, NextResponse } from "next/server";
import { getWpAuthHeader } from "@/lib/wpAuth";
import { setCartCookies } from "@/lib/cartSession";

const API = process.env.NEXT_PUBLIC_WC_STORE_API!;

export async function GET(request: NextRequest) {
  const token = request.cookies.get("wc_cart_token")?.value;
  const ua = request.headers.get("user-agent") ?? "";
  const authHeader = getWpAuthHeader(request);

  const response = await fetch(`${API}/cart`, {
    method: "GET",
    cache: "no-store",
    headers: { ...(token ? { "Cart-Token": token } : {}), "User-Agent": ua, ...authHeader },
  });

  const data = await response.json();
  const newToken = response.headers.get("Cart-Token");
  const newNonce = response.headers.get("Nonce");

  const result = NextResponse.json(data);
  result.headers.set("Cache-Control", "no-store, max-age=0");
  setCartCookies(result, newToken, newNonce);

  return result;
}
