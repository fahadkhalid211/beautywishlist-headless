import { NextRequest, NextResponse } from "next/server";

const WP_URL = process.env.NEXT_PUBLIC_WP_URL!;

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const key = request.nextUrl.searchParams.get("key") || "";

  const response = await fetch(
    `${WP_URL}/wp-json/custom/v1/invoice/${id}?key=${encodeURIComponent(key)}`,
    { cache: "no-store" }
  );

  const data = await response.json();
  return NextResponse.json(data, { status: response.status });
}
