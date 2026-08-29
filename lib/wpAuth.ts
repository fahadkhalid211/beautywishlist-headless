import { NextRequest } from "next/server";

/**
 * If the person is logged in (bw_wp_session cookie present), returns a
 * Basic Auth header so cart/checkout requests to WooCommerce authenticate
 * as their real WordPress account — letting WooCommerce attribute orders
 * to the correct customer_id instead of always creating guest orders.
 * Returns {} for guests, so this is safe to spread into any fetch call.
 */
export function getWpAuthHeader(request: NextRequest): Record<string, string> {
  const sessionCookie = request.cookies.get("bw_wp_session")?.value;

  if (!sessionCookie) {
    return {};
  }

  try {
    const { login, password } = JSON.parse(Buffer.from(sessionCookie, "base64").toString());
    if (!login || !password) return {};
    const basic = Buffer.from(`${login}:${password}`).toString("base64");
    return { Authorization: `Basic ${basic}` };
  } catch {
    return {};
  }
}
