import { NextResponse } from "next/server";

const WP_URL = process.env.NEXT_PUBLIC_WP_URL!;

export async function GET() {
  try {
    const res = await fetch(`${WP_URL}/wp-json/custom/v1/payment-methods`, {
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      return NextResponse.json({ success: false, methods: [] }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ success: false, methods: [] }, { status: 500 });
  }
}
