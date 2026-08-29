import { NextRequest, NextResponse } from "next/server";
import { searchProducts } from "@/lib/woocommerce";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim() || "";
  if (!q) return NextResponse.json({ products: [], total: 0 });

  const { items, total } = await searchProducts({ search: q });
  const top = items.slice(0, 5).map((p: any) => ({
    id: p.id,
    slug: p.slug,
    name: p.name,
    image: p.images?.[0]?.src ?? null,
    price: p.prices.price,
    currency_prefix: p.prices.currency_prefix,
    currency_minor_unit: p.prices.currency_minor_unit ?? 2,
  }));

  return NextResponse.json({ products: top, total });
}