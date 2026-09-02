import { NextRequest } from "next/server";
import { getWpAuthHeader } from "@/lib/wpAuth";
import { fetchStoreApi } from "@/lib/storeApi";

const API = process.env.NEXT_PUBLIC_WC_STORE_API!;

export const CART_TOKEN_COOKIE = "wc_cart_token";
export const CART_NONCE_COOKIE = "wc_nonce";

type MutateFn = (
  token: string | undefined,
  nonce: string | undefined
) => Promise<Response>;

function unavailableResponse() {
  return Response.json(
    {
      code: "backend_unavailable",
      message: "Cart service is temporarily unavailable. Please try again shortly.",
    },
    { status: 503, headers: { "Cache-Control": "no-store, max-age=0" } }
  );
}

export async function withCartSession(request: NextRequest, mutate: MutateFn) {
  const ua = request.headers.get("user-agent") ?? "";
  const authHeader = getWpAuthHeader(request);
  let token = request.cookies.get(CART_TOKEN_COOKIE)?.value;
  let nonce = request.cookies.get(CART_NONCE_COOKIE)?.value;

  async function refreshTokenAndNonce() {
    const cartResponse = await fetchStoreApi(`${API}/cart`, {
      method: "GET",
      cache: "no-store",
      headers: { ...(token ? { "Cart-Token": token } : {}), "User-Agent": ua, ...authHeader },
    });

    if (!cartResponse.ok) throw new Error(`Cart session refresh failed: ${cartResponse.status}`);

    token = cartResponse.headers.get("Cart-Token") || token;
    nonce = cartResponse.headers.get("Nonce") || nonce;
  }

  try {
    if (!token || !nonce) {
      await refreshTokenAndNonce();
    }

    let response = await mutate(token, nonce);

    if (response.status === 401 || response.status === 403) {
      await refreshTokenAndNonce();
      response = await mutate(token, nonce);
    }

    const finalToken = response.headers.get("Cart-Token") || token || null;
    const finalNonce = response.headers.get("Nonce") || nonce || null;

    return { response, token: finalToken, nonce: finalNonce };
  } catch (error) {
    console.error("WooCommerce cart session unavailable:", error);
    return { response: unavailableResponse(), token: null, nonce: null };
  }
}

export function setCartCookies(
  result: { cookies: { set: (name: string, value: string, opts: any) => void } },
  token: string | null,
  nonce: string | null
) {
  if (token) {
    result.cookies.set(CART_TOKEN_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 14,
    });
  }
  if (nonce) {
    result.cookies.set(CART_NONCE_COOKIE, nonce, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 14,
    });
  }
}
