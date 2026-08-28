const WP_URL = process.env.NEXT_PUBLIC_WP_URL!;

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

export async function getMenu(
  slug: string = "main-menu"
): Promise<MenuItem[]> {
  const res = await fetch(`${WP_URL}/wp-json/custom/v1/menu/${slug}`, {
    next: { revalidate: 300 },
  });

  if (!res.ok) {
    console.error(
      `getMenu("${slug}") failed: ${res.status} ${res.statusText} — check the menu is assigned to the "${slug}" location in Appearance > Menus > Manage Locations.`
    );
    return [];
  }
    return [];
  }

  const data = await res.json();
  const data = await res.json();

  if (!data.success) {
    console.error(`getMenu("${slug}") returned an error:`, data.message ?? data);
    return [];
  }

  const items: any[] = data.items ?? [];

  const byId = new Map<number, MenuItem>();

  items.forEach((item) => {
    byId.set(item.ID, {
      ID: item.ID,
      title: item.title,
      url: item.url,
      children: [],
    });
  });

  const tree: MenuItem[] = [];

  items.forEach((item) => {
    const node = byId.get(item.ID);

    if (!node) {
      return;
    }

    const parentId = Number(item.menu_item_parent ?? 0);

    if (parentId && byId.has(parentId)) {
      byId.get(parentId)!.children.push(node);
    } else {
      tree.push(node);
    }
  });

  return tree;
}

export function toPath(url: string): string {
  try {
    const parsed = new URL(url);

    return (
      parsed.pathname.replace(/\/$/, "") || "/"
    );
  } catch {
    return url;
  }
}
