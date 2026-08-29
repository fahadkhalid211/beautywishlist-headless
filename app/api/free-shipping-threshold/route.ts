import { NextResponse } from "next/server";

const WP_URL = process.env.NEXT_PUBLIC_WP_URL!;

export async function GET() {
  try {
    const res = await fetch(`${WP_URL}/wp-json/custom/v1/free-shipping-threshold`, {
      next: { revalidate: 300 },
    });

    if (!res.ok) {
      return NextResponse.json({ success: false, threshold: null }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ success: false, threshold: null }, { status: 500 });
  }
}
