"use client";

import { useRouter, useSearchParams } from "next/navigation";

export default function SortSelect() {
  const router = useRouter();
  const searchParams = useSearchParams();

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const params = new URLSearchParams(searchParams.toString());
    if (e.target.value) {
      params.set("sort", e.target.value);
    } else {
      params.delete("sort");
    }
    params.delete("page");
    router.push(`?${params.toString()}`);
  }

  return (
    <select
      defaultValue={searchParams.get("sort") || ""}
      onChange={handleChange}
      className="rounded-xl border border-line bg-white px-4 py-2 text-sm outline-none focus:border-purple-500"
    >
      <option value="">Sort: Featured</option>
      <option value="newest">Newest</option>
      <option value="price-low">Price: Low to High</option>
      <option value="price-high">Price: High to Low</option>
      <option value="name">Name: A-Z</option>
    </select>
  );
}
