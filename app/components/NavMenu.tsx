import Link from "next/link";
import { toPath, MenuItem } from "@/lib/menu";

export default function NavMenu({ items }: { items: MenuItem[] }) {
  if (items.length === 0) {
    return (
      <p className="px-6 py-3 text-xs text-ink-soft">
        Assign a menu to the &quot;main-menu&quot; location in Appearance → Menus → Manage Locations.
      </p>
    );
  }

  return (
    <div className="mx-auto flex max-w-7xl items-center gap-8 px-6 py-3 text-xs font-medium uppercase tracking-wide text-ink-soft">
      {items.map((item) => (
        <div key={item.id} className="group relative">
          <Link href={toPath(item.url)} className="transition hover:text-purple-700">
            {item.title}
          </Link>

          {item.children.length > 0 && (
            <div className="invisible absolute left-0 top-full z-50 mt-3 w-56 rounded-2xl border border-line bg-white p-2 opacity-0 shadow-xl transition group-hover:visible group-hover:opacity-100">
              {item.children.map((child) => (
                <Link key={child.id} href={toPath(child.url)} className="block rounded-xl px-3 py-2 text-xs font-normal normal-case text-ink-soft hover:bg-purple-50 hover:text-purple-700">
                  {child.title}
                </Link>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}