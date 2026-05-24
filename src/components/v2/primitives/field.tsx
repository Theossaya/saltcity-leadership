import type { ComponentProps, ReactNode } from "react";

import { cn } from "@/lib/utils";

type FieldProps = {
  children: ReactNode;
  htmlFor: string;
  label: string;
  hint?: string;
  className?: string;
};

export const v2InputClasses =
  "min-h-12 w-full rounded-input border-0 bg-bg px-3.5 py-3 font-sans text-sm font-medium text-ink shadow-[inset_0_0_0_1px_var(--rule-strong)] outline-none transition-shadow placeholder:font-serif placeholder:italic placeholder:text-ink-4 focus-visible:shadow-[inset_0_0_0_1.5px_var(--ink)] disabled:cursor-not-allowed disabled:opacity-60";

export function Field({
  children,
  htmlFor,
  label,
  hint,
  className,
}: FieldProps) {
  return (
    <div className={cn("grid gap-1.5", className)}>
      <label
        htmlFor={htmlFor}
        className="font-mono text-[9.5px] font-semibold uppercase leading-none tracking-[0.14em] text-ink-3"
      >
        {label}
      </label>
      {children}
      {hint ? (
        <p className="font-sans text-xs leading-[1.4] text-ink-3">{hint}</p>
      ) : null}
    </div>
  );
}

export function TextInput({ className, ...props }: ComponentProps<"input">) {
  return <input className={cn(v2InputClasses, className)} {...props} />;
}

export function TextArea({
  className,
  ...props
}: ComponentProps<"textarea">) {
  return (
    <textarea
      className={cn(v2InputClasses, "min-h-28 resize-y leading-[1.5]", className)}
      {...props}
    />
  );
}

export function Select({ className, ...props }: ComponentProps<"select">) {
  return <select className={cn(v2InputClasses, className)} {...props} />;
}
