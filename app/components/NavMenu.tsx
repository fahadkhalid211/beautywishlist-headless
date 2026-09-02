import Link from "next/link";
import type { StaticMenuItem } from "@/lib/staticMenu";

export default function NavMenu({ items }: { items: StaticMenuItem[] }) {
  return (
    <div className="mx-auto flex max-w-7xl items-center justify-center gap-8 px-6 py-3 text-xs font-medium uppercase tracking-wide text-ink-soft">
      {items.map((item) => (
        <div key={item.id} className="group relative">
          <Link href={item.url} className="group/link relative inline-block pb-1 transition hover:text-purple-700">
            {item.title}
            <span className="absolute inset-x-0 -bottom-0.5 h-px origin-center scale-x-0 bg-purple-700 transition-transform duration-300 group-hover/link:scale-x-100" />
          </Link>

          {item.children && item.children.length > 0 && (
            <div className="invisible absolute left-0 top-full z-50 w-56 pt-3 opacity-0 transition group-hover:visible group-hover:opacity-100">
              <div className="rounded-2xl border border-line bg-white p-2 shadow-xl">
                {item.children.map((child) => (
                  <Link
                    key={child.id}
                    href={child.url}
                    className="block rounded-xl px-3 py-2 text-xs font-normal normal-case text-ink-soft hover:bg-purple-50 hover:text-purple-700"
                  >
                    {child.title}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
