import { NextResponse } from "next/server";

export async function POST() {
  const result = NextResponse.json({ success: true });
  result.cookies.set("bw_auth_token", "", { path: "/", maxAge: 0 });
  return result;
}
