import { NextRequest, NextResponse } from "next/server";

const WP_URL = process.env.NEXT_PUBLIC_WP_URL!;

export async function POST(request: NextRequest) {
  const body = await request.json();

  const response = await fetch(`${WP_URL}/wp-json/custom/v1/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  const data = await response.json();
  const result = NextResponse.json(data, { status: response.status });

  if (response.ok && data.token) {
    result.cookies.set("bw_auth_token", data.token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
  }

  return result;
}
