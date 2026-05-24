import { Check } from "@/components/v2/primitives/check";

type TaskRowProps = {
  title: string;
  meta: string;
  priority?: string;
  done?: boolean;
};

export function TaskRow({ title, meta, priority, done = false }: TaskRowProps) {
  return (
    <div className="flex gap-3.5 py-[13px] first:pt-0 last:pb-0 [&+&]:shadow-[inset_0_1px_0_var(--rule)]">
      <Check done={done} />
      <div className="min-w-0 flex-1">
        <p
          className={
            done
              ? "font-sans text-sm font-medium leading-[1.35] tracking-[-0.005em] text-ink-3 line-through"
              : "font-sans text-sm font-medium leading-[1.35] tracking-[-0.005em] text-ink"
          }
        >
          {title}
        </p>
        <p className="mt-1 flex flex-wrap items-center gap-2 font-sans text-[11.5px] font-medium text-ink-3">
          {priority ? (
            <span className="font-mono text-[9px] font-bold uppercase tracking-[0.12em]">
              {priority}
            </span>
          ) : null}
          {priority ? <span className="opacity-50">·</span> : null}
          <span>{meta}</span>
        </p>
      </div>
    </div>
  );
}
