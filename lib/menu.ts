const WP_URL = process.env.NEXT_PUBLIC_WP_URL!;

export type MenuItem = {
  ID: number;
  title: string;
  url: string;
  children: MenuItem[];
};

export async function getMenu(
  slug: string = "main-menu"
): Promise<MenuItem[]> {
  const res = await fetch(
    `${WP_URL}/wp-json/custom/v1/menu/${slug}`,
    {
      next: { revalidate: 300 },
    }
  );

  if (!res.ok) {
    console.error(
      `getMenu("${slug}") failed: ${res.status} ${res.statusText}`
    );

    return [];
  }

  const data = await res.json();

  const items: any[] = data.items ?? data ?? [];

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

    const parentId = Number(
      item.menu_item_parent ?? 0
    );

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
