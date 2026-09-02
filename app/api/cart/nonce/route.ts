import { NextResponse } from "next/server";
import { fetchStoreApi } from "@/lib/storeApi";

const API = process.env.NEXT_PUBLIC_WC_STORE_API!;

export async function GET() {
  const response = await fetchStoreApi(`${API}/cart`, {
    method: "GET",
    cache: "no-store",
  });

  const data = await response.json();
  const nonce = response.headers.get("Nonce");
  const cartToken = response.headers.get("Cart-Token");

  const result = NextResponse.json(data, { status: response.status });

  if (nonce) {
    result.cookies.set("wc_nonce", nonce, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });
  }

  if (cartToken) {
    result.cookies.set("wc_cart_token", cartToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });
  }

  return result;
}
