import { NextResponse } from "next/server";
import { fetchStoreApi } from "@/lib/storeApi";

const WP_URL = process.env.NEXT_PUBLIC_WP_URL!;

export async function GET() {
  try {
    const res = await fetchStoreApi(`${WP_URL}/wp-json/custom/v1/payment-methods`, {
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      return NextResponse.json({ success: false, methods: [] }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Payment methods backend request failed:", error);
    return NextResponse.json({ success: false, code: "backend_unavailable", methods: [], message: "Payment methods are temporarily unavailable." }, { status: 503 });
  }
}
