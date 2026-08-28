import { NextRequest, NextResponse } from "next/server";

const API = process.env.NEXT_PUBLIC_WC_STORE_API!;

export async function GET(request: NextRequest) {
  const token =
    request.cookies.get("wc_cart_token")?.value;

  const headers: HeadersInit = {};

  if (token) {
    headers["Cart-Token"] = token;
  }

  const response = await fetch(`${API}/cart`, {
    method: "GET",
    headers,
    cache: "no-store",
  });

  const data = await response.json();

  const result = NextResponse.json(data);

  const newToken =
    response.headers.get("Cart-Token");

  if (newToken) {
    result.cookies.set(
      "wc_cart_token",
      newToken,
      {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
      }
    );
  }

  return result;
}