"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cx } from "@/utils/cx";

export interface RouteTabItem {
  label: string;
  href: string;
  /** Match only this exact path (used for the "Overview" tab so it doesn't stay highlighted on sub-routes). */
  exact?: boolean;
}

/**
 * Tab-styled navigation between sibling routes (e.g. a campaign's
 * Overview/Templates/Groups/Recipients pages). Untitled UI's `Tabs`
 * component manages selection as local RAC state for a single page's
 * panels - it isn't meant to drive navigation between distinct routes, so
 * this renders plain links with the same "underline" tab visual instead.
 */
export function RouteTabs({ items }: { items: RouteTabItem[] }) {
  const pathname = usePathname();

  return (
    <div className="relative flex gap-4 before:absolute before:inset-x-0 before:bottom-0 before:h-px before:bg-border-secondary">
      {items.map((item) => {
        const active = item.exact ? pathname === item.href : pathname?.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cx(
              "z-10 border-b-2 px-0.5 pb-2.5 text-sm font-semibold whitespace-nowrap text-quaternary transition duration-100 ease-linear",
              active ? "border-fg-brand-primary_alt text-brand-secondary" : "border-transparent hover:text-secondary",
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </div>
  );
}
