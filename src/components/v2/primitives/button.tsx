import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

import { cn } from "@/lib/utils";

type ButtonProps = {
  children: ReactNode;
  href?: string;
  variant?: "primary" | "ink" | "soft";
  className?: string;
} & ComponentProps<"button">;

export function Button({
  children,
  href,
  variant = "primary",
  className,
  type = "button",
  ...props
}: ButtonProps) {
  const classes = cn(
    "inline-flex min-h-11 items-center justify-center gap-2 rounded-pill px-5 py-3 font-sans text-[13.5px] font-semibold leading-none tracking-[0.005em] transition-colors",
    variant === "primary" && "bg-primary text-primary-ink",
    variant === "ink" && "bg-ink text-bg",
    variant === "soft" &&
      "bg-transparent text-ink shadow-[inset_0_0_0_1px_var(--rule-strong)] hover:bg-bg-tint",
    className,
  );

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} className={classes} {...props}>
      {children}
    </button>
  );
}
