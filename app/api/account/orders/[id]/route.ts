import { NextRequest, NextResponse } from "next/server";
import { fetchStoreApi } from "@/lib/storeApi";

const WP_URL = process.env.NEXT_PUBLIC_WP_URL!;

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const token = request.cookies.get("bw_auth_token")?.value;
    if (!token) return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 });

    const response = await fetchStoreApi(`${WP_URL}/wp-json/custom/v1/orders/${id}`, {
      headers: { Authorization: `Bearer ${token}` }, cache: "no-store",
    });
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Account order details request failed:", error);
    return NextResponse.json({ success: false, code: "backend_unavailable", message: "Order details are temporarily unavailable. Please try again shortly." }, { status: 503 });
  }
}
