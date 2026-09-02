import { fetchStoreApi } from "@/lib/storeApi";

const WP_URL = process.env.NEXT_PUBLIC_WP_URL!;
const MENU_TIMEOUT_MS = 1200;
const MENU_CACHE_SECONDS = 86400;

export type MenuThumbnail = {
  id: number;
  url: string | null;
  alt: string;
};

export type MenuItem = {
  id: number;
  title: string;
  url: string;
  target: string;
  parent: number;
  order: number;
  type: string;
  object: string;
  object_id: number;
  classes: string[];
  description: string;
  thumbnail: MenuThumbnail | null;
  children: MenuItem[];
};

export async function getMenu(slug: string): Promise<MenuItem[]> {
  if (!WP_URL) return [];

  try {
    const res = await fetchStoreApi(`${WP_URL}/wp-json/custom/v1/menu/${slug}`, {
      next: { revalidate: MENU_CACHE_SECONDS },
      timeoutMs: MENU_TIMEOUT_MS,
      headers: { Accept: "application/json" },
    });

    if (!res.ok) {
      console.error(`getMenu("${slug}") failed: ${res.status} ${res.statusText}`);
      return [];
    }

    const data = await res.json();
    if (!data.success) {
      console.error(`getMenu("${slug}") returned an error:`, data.message ?? data);
      return [];
    }

    return (data.items ?? []) as MenuItem[];
  } catch (error) {
    console.error(`getMenu("${slug}") backend request failed:`, error);
    return [];
  }
}

export function toPath(url: string) {
  try {
    return new URL(url).pathname.replace(/\/$/, "") || "/";
  } catch {
    return url;
  }
}
