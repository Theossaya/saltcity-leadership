import { cn } from "@/lib/utils";

type StepRailProps = {
  steps: string[];
  activeIndex?: number;
};

export function StepRail({ steps, activeIndex = 0 }: StepRailProps) {
  return (
    <div className="mt-[18px] rounded-card bg-surface p-2 shadow-lift">
      <ol className="grid grid-cols-3 gap-1.5">
        {steps.map((step, index) => (
          <li
            key={step}
            className={cn(
              "rounded-pill px-2.5 py-2 text-center font-mono text-[9.5px] font-semibold uppercase leading-none tracking-[0.12em] text-ink-3",
              index <= activeIndex && "bg-ink text-bg",
            )}
          >
            <span className="sr-only">Step {index + 1}: </span>
            {index + 1} {step}
          </li>
        ))}
      </ol>
    </div>
  );
}
