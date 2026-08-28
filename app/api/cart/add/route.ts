import { NextRequest, NextResponse } from "next/server";

const API = process.env.NEXT_PUBLIC_WC_STORE_API!;

function decode(token: string | null) {
  if (!token) return null;
  try {
    return JSON.parse(Buffer.from(token.split(".")[1], "base64").toString());
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  const { productId, quantity = 1 } = await request.json();
  const ua = request.headers.get("user-agent") ?? "";
  let token = request.cookies.get("wc_cart_token")?.value;

  console.log("ADD incoming cookie token user_id:", decode(token || null)?.user_id);

  const cartResponse = await fetch(`${API}/cart`, {
    method: "GET",
    cache: "no-store",
    headers: { ...(token ? { "Cart-Token": token } : {}), "User-Agent": ua },
  });

  const initToken = cartResponse.headers.get("Cart-Token");
  const nonce = cartResponse.headers.get("Nonce");
  console.log("ADD init GET returned token user_id:", decode(initToken)?.user_id);

  token = initToken || token;

  const response = await fetch(
    `${API}/cart/add-item?id=${productId}&quantity=${quantity}`,
    {
      method: "POST",
      cache: "no-store",
      headers: {
        ...(token ? { "Cart-Token": token } : {}),
        ...(nonce ? { Nonce: nonce } : {}),
        "User-Agent": ua,
      },
    }
  );

  const data = await response.json();
  const returnedToken = response.headers.get("Cart-Token");
  console.log("ADD response token user_id:", decode(returnedToken)?.user_id, "items:", data?.items?.length);

  const result = NextResponse.json(data, { status: response.status });
  const finalToken = returnedToken || token;

  if (finalToken) {
    result.cookies.set("wc_cart_token", finalToken, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 14,
    });
  }

  console.log("ADD setting cookie token user_id:", decode(finalToken || null)?.user_id);
  return result;
}