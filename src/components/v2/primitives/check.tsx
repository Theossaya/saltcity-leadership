import { cn } from "@/lib/utils";

type CheckProps = {
  done?: boolean;
};

export function Check({ done = false }: CheckProps) {
  return (
    <span
      className={cn(
        "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-pill shadow-[inset_0_0_0_1.5px_var(--rule-strong)]",
        done && "bg-calm text-bg shadow-none",
      )}
      aria-hidden="true"
    >
      {done ? (
        <span className="block h-1.5 w-2.5 rotate-[-45deg] border-b-[1.5px] border-l-[1.5px] border-bg" />
      ) : null}
    </span>
  );
}
