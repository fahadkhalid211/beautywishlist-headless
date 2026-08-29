import { NextRequest } from "next/server";
import { getWpAuthHeader } from "@/lib/wpAuth";

const API = process.env.NEXT_PUBLIC_WC_STORE_API!;

export const CART_TOKEN_COOKIE = "wc_cart_token";
export const CART_NONCE_COOKIE = "wc_nonce";

type MutateFn = (
  token: string | undefined,
  nonce: string | undefined
) => Promise<Response>;

/**
 * Runs a cart-mutating request against the Store API, reusing a cached
 * Cart-Token + Nonce when we already have both (skipping the extra GET
 * /cart round trip most routes previously did before every single
 * mutation). Falls back to fetching a fresh token/nonce if we don't have
 * one cached yet, or retries once if the cached nonce turns out to be
 * stale (401/403).
 */
export async function withCartSession(request: NextRequest, mutate: MutateFn) {
  const ua = request.headers.get("user-agent") ?? "";
  const authHeader = getWpAuthHeader(request);
  let token = request.cookies.get(CART_TOKEN_COOKIE)?.value;
  let nonce = request.cookies.get(CART_NONCE_COOKIE)?.value;

  async function refreshTokenAndNonce() {
    const cartResponse = await fetch(`${API}/cart`, {
      method: "GET",
      cache: "no-store",
      headers: { ...(token ? { "Cart-Token": token } : {}), "User-Agent": ua, ...authHeader },
    });
    token = cartResponse.headers.get("Cart-Token") || token;
    nonce = cartResponse.headers.get("Nonce") || nonce;
  }

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
}

export function setCartCookies(
  result: { cookies: { set: (name: string, value: string, opts: any) => void } },
  token: string | null,
  nonce: string | null
) {
  if (token) {
    result.cookies.set(CART_TOKEN_COOKIE, token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 14,
    });
  }
  if (nonce) {
    result.cookies.set(CART_NONCE_COOKIE, nonce, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 14,
    });
  }
}
