"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CheckSquare,
  FileText,
  HeartHandshake,
  Home,
  MoreHorizontal,
} from "lucide-react";

import { MAIN_NAVIGATION_ITEMS } from "@/lib/constants/app";
import { cn } from "@/lib/utils";

const iconByLabel = {
  Home,
  Reports: FileText,
  "Follow-up": HeartHandshake,
  Tasks: CheckSquare,
  More: MoreHorizontal,
} as const;

function getNavHref(item: (typeof MAIN_NAVIGATION_ITEMS)[number]) {
  return item.label === "Home" ? "/dashboard" : item.href;
}

function isActive(label: string, href: string, pathname: string) {
  if (label === "Home") {
    return pathname === "/" || pathname === "/dashboard";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border/90 bg-card/95 px-3 pb-[calc(env(safe-area-inset-bottom)+0.5rem)] pt-2 shadow-[0_-12px_30px_rgba(21,18,23,0.08)] backdrop-blur md:hidden"
      aria-label="Primary"
    >
      <div className="mx-auto grid max-w-3xl grid-cols-5 gap-1">
        {MAIN_NAVIGATION_ITEMS.map((item) => {
          const href = getNavHref(item);
          const active = isActive(item.label, href, pathname);
          const Icon = iconByLabel[item.label];

          return (
            <Link
              key={item.href}
              href={href}
              className={cn(
                "flex min-h-12 flex-col items-center justify-center gap-1 rounded-lg px-1 text-[0.68rem] font-medium text-muted-foreground transition-colors",
                active
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted hover:text-foreground",
              )}
              aria-current={active ? "page" : undefined}
            >
              <Icon className="size-4" aria-hidden="true" />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
