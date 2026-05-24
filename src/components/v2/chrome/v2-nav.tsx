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

import { cn } from "@/lib/utils";

const items = [
  { label: "Home", href: "/dashboard", icon: Home },
  { label: "Report", href: "/reports", icon: FileText },
  { label: "Care", href: "/follow-up", icon: HeartHandshake },
  { label: "Tasks", href: "/tasks", icon: CheckSquare },
  { label: "More", href: "/more", icon: MoreHorizontal },
] as const;

function isActive(label: string, href: string, pathname: string) {
  if (label === "Home") {
    return pathname === "/" || pathname === "/dashboard";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function V2Nav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 bg-gradient-to-b from-bg/0 to-bg px-3.5 pt-2.5 pb-[calc(env(safe-area-inset-bottom)+1.125rem)] md:hidden"
      aria-label="Primary"
    >
      <div className="mx-auto flex max-w-3xl rounded-pill bg-surface p-1.5 shadow-lift">
        {items.map((item) => {
          const active = isActive(item.label, item.href, pathname);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-pill px-1.5 font-sans text-[11.5px] font-semibold tracking-[-0.005em] text-ink-3 transition-colors",
                active && "bg-ink text-bg",
              )}
              aria-current={active ? "page" : undefined}
            >
              <Icon className="size-3.5 shrink-0" strokeWidth={1.75} aria-hidden="true" />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
