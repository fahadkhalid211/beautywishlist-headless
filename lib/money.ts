export function getPriceValue(prices: any, field: string = "price"): number {
  const minorUnit = prices?.currency_minor_unit ?? 2;
  return Number(prices?.[field] ?? 0) / Math.pow(10, minorUnit);
}

export function formatPrice(prices: any, field: string = "price"): string {
  const value = getPriceValue(prices, field);
  const prefix = prices?.currency_prefix ?? "";
  const suffix = prices?.currency_suffix ?? "";
  return `${prefix}${value.toLocaleString("en-PK", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}${suffix}`;
}
