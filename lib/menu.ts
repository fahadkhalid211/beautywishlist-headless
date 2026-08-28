const WP_URL = process.env.NEXT_PUBLIC_WP_URL!;

export type MenuItem = {
  ID: number;
  title: string;
  url: string;
  children: MenuItem[];
};

export async function getMenu(slug: string): Promise<MenuItem[]> {
  const res = await fetch(`${WP_URL}/wp-json/menus/v1/menus/${slug}`, {
    next: { revalidate: 300 },
  });

  if (!res.ok) {
    console.error(`getMenu("${slug}") failed: ${res.status} ${res.statusText} — check that a WordPress menu with this exact slug exists and the "WP REST API Menus" endpoint is reachable.`);
    return [];
  }

  const data = await res.json();
  const items: any[] = data.items ?? [];

  const byId = new Map<number, MenuItem>();
  items.forEach((item) => byId.set(item.ID, { ...item, children: [] }));

  const tree: MenuItem[] = [];
  items.forEach((item) => {
    const node = byId.get(item.ID)!;
    const parentId = Number(item.menu_item_parent);
    if (parentId && byId.has(parentId)) {
      byId.get(parentId)!.children.push(node);
    } else {
      tree.push(node);
    }
  });

  return tree;
}

export function toPath(url: string) {
  try {
    return new URL(url).pathname.replace(/\/$/, "") || "/";
  } catch {
    return url;
  }
}